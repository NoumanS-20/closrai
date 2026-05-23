import Anthropic from "@anthropic-ai/sdk";
import type {
  ChatMessage,
  DebateTrace,
  Lead,
  ToolCallRecord,
} from "@/lib/types";
import { AGENT_MODEL, getAnthropic } from "./client";
import { SDR_SYSTEM_PROMPT } from "./prompts";
import { TOOLS, runTool } from "./tools";
import { scoreDealIQ } from "./dealiq";

const MAX_TOOL_ROUNDS = 5;

function toApiMessages(
  history: ChatMessage[],
): Anthropic.MessageParam[] {
  return history
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: m.content,
    }));
}

function newMessageId(): string {
  return `msg_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

function extractText(content: Anthropic.ContentBlock[]): string {
  return content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
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
  const client = getAnthropic();

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

  const apiMessages: Anthropic.MessageParam[] = toApiMessages(lead.transcript);
  let finalText = "";

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const res: Anthropic.Message = await client.messages.create({
      model: AGENT_MODEL,
      max_tokens: 800,
      system: [
        {
          type: "text",
          text: SDR_SYSTEM_PROMPT,
          cache_control: { type: "ephemeral" },
        },
      ],
      tools: TOOLS,
      messages: apiMessages,
    });

    apiMessages.push({ role: "assistant", content: res.content });

    const toolUses = res.content.filter(
      (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
    );

    if (toolUses.length === 0 || res.stop_reason !== "tool_use") {
      finalText = extractText(res.content);
      break;
    }

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    const recentTranscript = lead.transcript
      .slice(-10)
      .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    for (const tu of toolUses) {
      const result = await runTool(tu.name, tu.input, {
        lead,
        recentTranscript,
      });
      toolCallRecords.push({
        name: tu.name,
        input: tu.input,
        output: result.output,
      });
      if (result.mutate) {
        lead = result.mutate(lead);
      }
      if (result.debate) {
        debateTrace = result.debate;
      }
      if (result.forcedReply) {
        forcedReply = result.forcedReply;
      }
      toolResults.push({
        type: "tool_result",
        tool_use_id: tu.id,
        content: JSON.stringify(result.output).slice(0, 4000),
      });
    }

    apiMessages.push({ role: "user", content: toolResults });
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
  return `${intro}Tell me a bit about what brought you here — are you running into churn issues or just exploring retention tools? (Running in stub mode — add ANTHROPIC_API_KEY to .env.local for full agent.)`;
}
