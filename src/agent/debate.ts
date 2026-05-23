import Anthropic from "@anthropic-ai/sdk";
import type { DebateTrace, Lead } from "@/lib/types";
import { CLOSER_PROMPT, RESOLUTION_PROMPT, SKEPTIC_PROMPT } from "./prompts";
import { DEBATE_MODEL, getAnthropic } from "./client";

interface DebateInput {
  objection: string;
  lead: Lead;
  recentTranscript: string;
}

interface DebateOutput {
  trace: DebateTrace;
  reply: string;
}

async function singleShot(client: Anthropic, system: string, user: string): Promise<string> {
  const res = await client.messages.create({
    model: DEBATE_MODEL,
    max_tokens: 350,
    system,
    messages: [{ role: "user", content: user }],
  });
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

export async function runObjectionDebate(input: DebateInput): Promise<DebateOutput> {
  const client = getAnthropic();
  const context = `Lead context:\n- Company: ${input.lead.company ?? "unknown"}\n- Role: ${input.lead.role ?? "unknown"}\n- Industry: ${input.lead.enrichment?.industry ?? "unknown"}\n- Deal IQ: ${input.lead.dealIq?.total ?? "n/a"}\n\nRecent transcript:\n${input.recentTranscript}\n\nObjection raised:\n"${input.objection}"`;

  if (!client) {
    const trace: DebateTrace = {
      objection: input.objection,
      skeptic:
        "Without an API key the debate engine cannot run. Suspect: underlying concern is likely cost or trust.",
      closer:
        "Acknowledge openly and offer a smaller commitment (pilot, 15-min walkthrough) to lower the perceived risk.",
      resolution: "Fallback resolution generated without LLM.",
    };
    return {
      trace,
      reply:
        "That's a fair concern — would a 15-minute walkthrough on a small slice of your data help us figure out if this is even worth your team's time?",
    };
  }

  const skeptic = await singleShot(client, SKEPTIC_PROMPT, context);
  const closerInput = `${context}\n\nSkeptic analysis:\n${skeptic}`;
  const closer = await singleShot(client, CLOSER_PROMPT, closerInput);
  const resolutionInput = `${context}\n\nSkeptic analysis:\n${skeptic}\n\nCloser strategy:\n${closer}`;
  const reply = await singleShot(client, RESOLUTION_PROMPT, resolutionInput);

  return {
    trace: {
      objection: input.objection,
      skeptic,
      closer,
      resolution: reply,
    },
    reply,
  };
}
