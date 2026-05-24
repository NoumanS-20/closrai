import type Groq from "groq-sdk";
import type {
  ChatMessage,
  DebateTrace,
  Lead,
  ToolCallRecord,
} from "@/lib/types";
import { AGENT_MODEL, getGroq } from "./client";
import { getToolsForPersona, runTool } from "./tools";
import { scoreDealIQ } from "./dealiq";
import { type PersonaDefinition, getPersona } from "./personas";

const MAX_TOOL_ROUNDS = 5;

type GroqMessage = Groq.Chat.Completions.ChatCompletionMessageParam;

interface SalvagedToolCall {
  id: string;
  name: string;
  arguments: string;
}

function salvageToolCallsFromError(err: unknown): SalvagedToolCall[] {
  const text =
    typeof err === "object" && err !== null && "message" in err
      ? String((err as { message: unknown }).message ?? "")
      : String(err);
  if (!text.includes("tool_use_failed") && !text.includes("<function=")) return [];

  // Llama-on-Groq emits at least two surface forms when it fails to call a tool:
  //   1) <function=name{json}</function>
  //   2) <function=name>{json}</function>   (with name->args separator and/or no closing tag)
  // We try both. JSON args may also be escape-encoded inside the error payload,
  // so we unescape backslash-escaped quotes / backslashes before parsing.
  const candidates = [
    /<function=([a-z_]+)\s*\{([\s\S]*?)\}\s*<\/?function>?/i, // form 1
    /<function=([a-z_]+)>\s*\{([\s\S]*?)\}\s*<\/?function>?/i, // form 2
  ];
  for (const re of candidates) {
    const m = text.match(re);
    if (!m) continue;
    const [, name, body] = m;
    let argsJson = "{" + body + "}";
    // The args may have been double-escaped when wrapped inside the error JSON
    // (e.g. \\" instead of "). Strip one level of escaping.
    if (argsJson.includes('\\"')) {
      argsJson = argsJson.replace(/\\"/g, '"').replace(/\\\\/g, "\\");
    }
    return [
      {
        id: `salvaged_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        name,
        arguments: argsJson,
      },
    ];
  }
  return [];
}

function toApiMessages(history: ChatMessage[]): GroqMessage[] {
  return history
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map<GroqMessage>((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));
}

function newMessageId(): string {
  return `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export interface RunAgentInput {
  lead: Lead;
  userMessage: string;
}

export interface RunAgentOutput {
  lead: Lead;
  assistantMessage: ChatMessage;
}

export async function runAgentTurn(input: RunAgentInput): Promise<RunAgentOutput> {
  const client = getGroq();
  const persona: PersonaDefinition = getPersona(input.lead.personaId);
  const tools = getToolsForPersona(persona);

  const userMsg: ChatMessage = {
    id: newMessageId(),
    role: "user",
    content: input.userMessage,
    ts: Date.now(),
  };

  let lead: Lead = {
    ...input.lead,
    transcript: [...input.lead.transcript, userMsg],
  };

  const dealIq = await scoreDealIQ(persona, lead.transcript, input.userMessage, lead.dealIq);
  lead = { ...lead, dealIq };

  if (!client) {
    const fallback = stubReply(persona, input.userMessage, lead);
    const asst: ChatMessage = {
      id: newMessageId(),
      role: "assistant",
      content: fallback,
      ts: Date.now(),
      dealIq,
    };
    lead = { ...lead, transcript: [...lead.transcript, asst] };
    return { lead, assistantMessage: asst };
  }

  const toolCallRecords: ToolCallRecord[] = [];
  let debateTrace: DebateTrace | undefined;
  let forcedReply: string | undefined;

  const apiMessages: GroqMessage[] = [
    { role: "system", content: persona.systemPrompt },
    ...toApiMessages(lead.transcript),
  ];

  let finalText = "";

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    let salvaged: SalvagedToolCall[] = [];
    let msg: Groq.Chat.Completions.ChatCompletionMessage | undefined;

    try {
      const res = await client.chat.completions.create({
        model: AGENT_MODEL,
        max_tokens: 800,
        temperature: 0.3,
        tools,
        tool_choice: "auto",
        messages: apiMessages,
      });
      msg = res.choices[0]?.message;
    } catch (err) {
      salvaged = salvageToolCallsFromError(err);
      if (salvaged.length === 0) throw err;
    }

    const recentTranscript = lead.transcript
      .slice(-10)
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    if (msg) {
      apiMessages.push({
        role: "assistant",
        content: msg.content ?? "",
        tool_calls: msg.tool_calls,
      });

      const toolCalls = msg.tool_calls ?? [];
      if (toolCalls.length === 0) {
        finalText = (msg.content ?? "").trim();
        break;
      }

      for (const tc of toolCalls) {
        if (tc.type !== "function") continue;
        const name = tc.function.name;
        let parsedArgs: unknown = {};
        try {
          parsedArgs = JSON.parse(tc.function.arguments || "{}");
        } catch {
          parsedArgs = {};
        }
        const result = await runTool(name, parsedArgs, { lead, recentTranscript, persona });
        toolCallRecords.push({ name, input: parsedArgs, output: result.output });
        if (result.mutate) lead = result.mutate(lead);
        if (result.debate) debateTrace = result.debate;
        if (result.forcedReply) forcedReply = result.forcedReply;

        apiMessages.push({
          role: "tool",
          tool_call_id: tc.id,
          content: JSON.stringify(result.output).slice(0, 4000),
        });
      }
    } else {
      apiMessages.push({
        role: "assistant",
        content: "",
        tool_calls: salvaged.map((s) => ({
          id: s.id,
          type: "function",
          function: { name: s.name, arguments: s.arguments },
        })),
      });

      for (const s of salvaged) {
        let parsedArgs: unknown = {};
        try {
          parsedArgs = JSON.parse(s.arguments || "{}");
        } catch {
          parsedArgs = {};
        }
        const result = await runTool(s.name, parsedArgs, { lead, recentTranscript, persona });
        toolCallRecords.push({ name: s.name, input: parsedArgs, output: result.output });
        if (result.mutate) lead = result.mutate(lead);
        if (result.debate) debateTrace = result.debate;
        if (result.forcedReply) forcedReply = result.forcedReply;

        apiMessages.push({
          role: "tool",
          tool_call_id: s.id,
          content: JSON.stringify(result.output).slice(0, 4000),
        });
      }
    }
  }

  const replyText = forcedReply || finalText || "Got it — give me a moment.";

  const assistantMessage: ChatMessage = {
    id: newMessageId(),
    role: "assistant",
    content: replyText,
    ts: Date.now(),
    dealIq,
    debate: debateTrace,
    toolCalls: toolCallRecords,
  };

  lead = {
    ...lead,
    transcript: [...lead.transcript, assistantMessage],
  };

  if (lead.status === "new" && (dealIq.total ?? 0) >= persona.qualifyThreshold) {
    lead = { ...lead, status: "qualified" };
  }

  return { lead, assistantMessage };
}

function stubReply(persona: PersonaDefinition, userMessage: string, lead: Lead): string {
  const intro =
    lead.transcript.length <= 2
      ? `Hey! I'm ${persona.brand.rep} — ${persona.brand.productOneLiner} `
      : "";
  if (/(price|cost|how much)/i.test(userMessage)) {
    return `${intro}I'd be happy to walk you through pricing once I understand your scenario. What's your team size and biggest pain point right now?`;
  }
  if (/(demo|trial|book|meeting)/i.test(userMessage)) {
    return `${intro}Happy to set that up. What email should I use for the invite?`;
  }
  return `${intro}Tell me a bit about what brought you here — what are you trying to solve? (Running in stub mode — add GROQ_API_KEY to .env.local for the full agent.)`;
}
