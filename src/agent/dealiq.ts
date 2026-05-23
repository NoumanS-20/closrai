import type { ChatMessage, DealIQ } from "@/lib/types";
import { DEAL_IQ_SCORER_PROMPT } from "./prompts";
import { getGroq, SCORER_MODEL } from "./client";

const EMPTY_IQ: DealIQ = {
  total: 0,
  budget: 0,
  authority: 0,
  need: 0,
  timing: 0,
  intent: 0,
  sentiment: 50,
  icpFit: 0,
  rationale: "No signal yet.",
};

function clamp(n: unknown): number {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

function extractJson(text: string): string {
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1].trim();
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first >= 0 && last > first) return text.slice(first, last + 1);
  return text.trim();
}

export async function scoreDealIQ(
  history: ChatMessage[],
  latestUserMessage: string,
  previous?: DealIQ,
): Promise<DealIQ> {
  const client = getGroq();
  if (!client) {
    return heuristicScore(latestUserMessage, previous);
  }

  const conversation = history
    .slice(-12)
    .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  const userBlock = `Conversation so far:\n${conversation}\n\nLatest visitor message:\n"${latestUserMessage}"\n\nPrevious score (for reference): ${previous ? JSON.stringify(previous) : "none"}\n\nReturn the updated JSON score.`;

  try {
    const res = await client.chat.completions.create({
      model: SCORER_MODEL,
      max_tokens: 400,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: DEAL_IQ_SCORER_PROMPT },
        { role: "user", content: userBlock },
      ],
    });
    const text = res.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(extractJson(text)) as Partial<DealIQ>;
    return {
      budget: clamp(parsed.budget),
      authority: clamp(parsed.authority),
      need: clamp(parsed.need),
      timing: clamp(parsed.timing),
      intent: clamp(parsed.intent),
      sentiment: clamp(parsed.sentiment ?? 50),
      icpFit: clamp(parsed.icpFit),
      total: clamp(parsed.total),
      rationale:
        typeof parsed.rationale === "string" && parsed.rationale.length > 0
          ? parsed.rationale.slice(0, 200)
          : "Updated score.",
    };
  } catch (err) {
    console.error("[dealiq] scoring failed, falling back to heuristic", err);
    return heuristicScore(latestUserMessage, previous);
  }
}

export function computeTotal(iq: Omit<DealIQ, "total" | "rationale">): number {
  const weighted =
    iq.need * 0.25 +
    iq.intent * 0.2 +
    iq.icpFit * 0.2 +
    iq.authority * 0.15 +
    iq.timing * 0.1 +
    iq.budget * 0.05 +
    iq.sentiment * 0.05;
  return clamp(weighted);
}

function heuristicScore(msg: string, previous?: DealIQ): DealIQ {
  const lower = msg.toLowerCase();
  const base = previous ?? EMPTY_IQ;
  const next = { ...base };
  const bump = (k: keyof Omit<DealIQ, "total" | "rationale">, by: number) => {
    next[k] = clamp(next[k] + by);
  };
  if (/(churn|retention|cancel|losing customers)/.test(lower)) bump("need", 25);
  if (/(this quarter|asap|urgent|soon|next week|next month)/.test(lower)) bump("timing", 25);
  if (/(budget|pricing|cost|how much|plan)/.test(lower)) bump("budget", 15);
  if (/(ceo|founder|vp|head of|director|cto|cmo)/.test(lower)) bump("authority", 30);
  if (/(saas|fintech|d2c|subscription)/.test(lower)) bump("icpFit", 20);
  if (/(demo|trial|pilot|book|meeting|call)/.test(lower)) bump("intent", 25);
  if (/(love|great|excited|perfect|awesome)/.test(lower)) bump("sentiment", 10);
  if (/(annoyed|frustrated|hate|terrible|disappointed)/.test(lower)) bump("sentiment", -15);
  next.total = computeTotal(next);
  next.rationale = "Heuristic scoring (no API key).";
  return next;
}
