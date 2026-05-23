import Anthropic from "@anthropic-ai/sdk";

export const AGENT_MODEL = "claude-opus-4-7";
export const SCORER_MODEL = "claude-haiku-4-5-20251001";
export const DEBATE_MODEL = "claude-haiku-4-5-20251001";

let cached: Anthropic | null | undefined;

export function getAnthropic(): Anthropic | null {
  if (cached !== undefined) return cached;
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    cached = null;
    return cached;
  }
  cached = new Anthropic({ apiKey: key });
  return cached;
}

export function hasAnthropic(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}
