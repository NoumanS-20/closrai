import type { ChatMessage, DealIQ } from "@/lib/types";
import { getGroq, SCORER_MODEL } from "./client";
import type { PersonaDefinition } from "./personas";

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
  persona: PersonaDefinition,
  history: ChatMessage[],
  latestUserMessage: string,
  previous?: DealIQ,
): Promise<DealIQ> {
  const client = getGroq();
  if (!client) {
    return heuristicScore(persona, latestUserMessage, previous);
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
        { role: "system", content: persona.scorerPrompt },
        { role: "user", content: userBlock },
      ],
    });
    const text = res.choices[0]?.message?.content ?? "";
    const parsed = JSON.parse(extractJson(text)) as Record<string, unknown>;
    return normalize(parsed);
  } catch (err) {
    console.error("[dealiq] scoring failed, falling back to heuristic", err);
    return heuristicScore(persona, latestUserMessage, previous);
  }
}

function normalize(parsed: Record<string, unknown>): DealIQ {
  return {
    budget: clamp(parsed.budget ?? parsed.clarity ?? parsed.satisfaction),
    authority: clamp(parsed.authority ?? parsed.specificity ?? parsed.loyaltyRisk),
    need: clamp(parsed.need ?? parsed.kbCoverage ?? parsed.complexity),
    timing: clamp(parsed.timing ?? parsed.urgency),
    intent: clamp(parsed.intent ?? parsed.resolutionLikelihood ?? parsed.repeatIssue),
    sentiment: clamp(parsed.sentiment ?? 50),
    icpFit: clamp(parsed.icpFit ?? parsed.escalationRisk ?? parsed.resolutionLikelihood),
    total: clamp(parsed.total),
    rationale:
      typeof parsed.rationale === "string" && parsed.rationale.length > 0
        ? (parsed.rationale as string).slice(0, 200)
        : "Updated score.",
  };
}

function heuristicScore(
  persona: PersonaDefinition,
  msg: string,
  previous?: DealIQ,
): DealIQ {
  const lower = msg.toLowerCase();
  const base = previous ?? EMPTY_IQ;
  const next = { ...base };
  const bump = (k: keyof Omit<DealIQ, "total" | "rationale">, by: number) => {
    next[k] = clamp(next[k] + by);
  };

  if (persona.id === "sales") {
    if (/(churn|retention|cancel|losing customers)/.test(lower)) bump("need", 25);
    if (/(this quarter|asap|urgent|soon|next week|next month)/.test(lower)) bump("timing", 25);
    if (/(budget|pricing|cost|how much|plan)/.test(lower)) bump("budget", 15);
    if (/(ceo|founder|vp|head of|director|cto|cmo)/.test(lower)) bump("authority", 30);
    if (/(saas|fintech|d2c|subscription)/.test(lower)) bump("icpFit", 20);
    if (/(demo|trial|pilot|book|meeting|call)/.test(lower)) bump("intent", 25);
  } else if (persona.id === "support") {
    if (/(error|broken|not working|crash|bug)/.test(lower)) bump("need", 25);
    if (/(integration|api|webhook|sync)/.test(lower)) bump("icpFit", 20);
    if (/(refund|cancel|escalate|manager|supervisor)/.test(lower)) bump("authority", 30);
    if (/(billing|invoice|charge)/.test(lower)) bump("intent", 20);
    if (/(urgent|production|down|critical)/.test(lower)) bump("timing", 30);
  } else if (persona.id === "care") {
    if (/(order|tracking|where is|delivery)/.test(lower)) bump("intent", 25);
    if (/(return|exchange|wrong|damaged|broken)/.test(lower)) bump("need", 25);
    if (/(refund|money back)/.test(lower)) bump("authority", 20);
    if (/(angry|terrible|worst|never again)/.test(lower)) bump("sentiment", -25);
    if (/(thanks|great|amazing|love)/.test(lower)) bump("sentiment", 15);
    if (/(asap|today|now|urgent)/.test(lower)) bump("timing", 25);
  }

  if (/(love|great|excited|perfect|awesome|thank)/.test(lower)) bump("sentiment", 10);
  if (/(annoyed|frustrated|hate|terrible|disappointed)/.test(lower)) bump("sentiment", -15);

  next.total = computeTotal(next);
  next.rationale = "Heuristic scoring (no API key).";
  return next;
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
