import Groq from "groq-sdk";

export const AGENT_MODEL = "llama-3.3-70b-versatile";
export const SCORER_MODEL = "llama-3.1-8b-instant";
export const DEBATE_MODEL = "llama-3.1-8b-instant";

let cached: Groq | null | undefined;

export function getGroq(): Groq | null {
  if (cached !== undefined) return cached;
  const key = process.env.GROQ_API_KEY;
  if (!key) {
    cached = null;
    return cached;
  }
  cached = new Groq({ apiKey: key });
  return cached;
}

export function hasGroq(): boolean {
  return Boolean(process.env.GROQ_API_KEY);
}
