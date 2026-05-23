import type Groq from "groq-sdk";
import type {
  ChatMessage,
  DebateTrace,
  Lead,
  ToolCallRecord,
} from "@/lib/types";
import { AGENT_MODEL, getGroq } from "./client";
import { SDR_SYSTEM_PROMPT } from "./prompts";
import { TOOLS, runTool } from "./tools";
import { scoreDealIQ } from "./dealiq";

const MAX_TOOL_ROUNDS = 5;

type GroqMessage = Groq.Chat.Completions.ChatCompletionMessageParam;

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

  const dealIq = await scoreDealIQ(lead.transcript, input.userMessage, lead.dealIq);
  lead = { ...lead, dealIq };

  if (!client) {
    const fallback = stubReply(input.userMessage, lead);
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
    { role: "system", content: SDR_SYSTEM_PROMPT },
    ...toApiMessages(lead.transcript),
  ];

  let finalText = "";

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const res = await client.chat.completions.create({
      model: AGENT_MODEL,
      max_tokens: 800,
      temperature: 0.6,
      tools: TOOLS,
      tool_choice: "auto",
      messages: apiMessages,
    });

    const choice = res.choices[0];
    if (!choice) break;
    const msg = choice.message;

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

    const recentTranscript = lead.transcript
      .slice(-10)
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    for (const tc of toolCalls) {
      if (tc.type !== "function") continue;
      const name = tc.function.name;
      let parsedArgs: unknown = {};
      try {
        parsedArgs = JSON.parse(tc.function.arguments || "{}");
      } catch {
        parsedArgs = {};
      }
      const result = await runTool(name, parsedArgs, { lead, recentTranscript });
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

  if (lead.status === "new" && (dealIq.total ?? 0) >= 65) {
    lead = { ...lead, status: "qualified" };
  }

  return { lead, assistantMessage };
}

function stubReply(userMessage: string, lead: Lead): string {
  const intro =
    lead.transcript.length <= 2
      ? "Hey! I'm ClosrAI — I help founders at Lumen Analytics figure out if we can help cut your churn. "
      : "";
  if (/(price|cost|how much)/i.test(userMessage)) {
    return `${intro}Pricing depends on your customer base size — most teams in our range pay between ₹40K and ₹2L/month. What's the rough size of your paying user base?`;
  }
  if (/(demo|trial|book|meeting)/i.test(userMessage)) {
    return `${intro}Happy to set that up. What email should I send the calendar invite to?`;
  }
  return `${intro}Tell me a bit about what brought you here — are you running into churn issues or just exploring retention tools? (Running in stub mode — add GROQ_API_KEY to .env.local for full agent.)`;
}
