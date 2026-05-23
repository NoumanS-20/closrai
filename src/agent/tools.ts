import type Groq from "groq-sdk";
import type {
  BookedMeeting,
  CompanyEnrichment,
  DebateTrace,
  Lead,
} from "@/lib/types";
import { runObjectionDebate } from "./debate";
import { AGENT_MODEL, getGroq } from "./client";
import { FOLLOW_UP_EMAIL_PROMPT } from "./prompts";

type GroqTool = Groq.Chat.Completions.ChatCompletionTool;

export const TOOLS: GroqTool[] = [
  {
    type: "function",
    function: {
      name: "enrich_company",
      description:
        "Research a prospect's company from their website URL or domain. Returns industry, rough size, tech stack hints, and a short summary. Call this exactly once per conversation when the visitor reveals their company.",
      parameters: {
        type: "object",
        properties: {
          domain: {
            type: "string",
            description: "Company domain or full URL (e.g. acme.com or https://acme.com).",
          },
        },
        required: ["domain"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "handle_objection",
      description:
        "Route a visitor objection (price, time, trust, fit, competitor) to the internal Skeptic-vs-Closer debate system. Use this whenever the visitor pushes back on the product or process. Returns the message you should send to the visitor along with the internal reasoning trace.",
      parameters: {
        type: "object",
        properties: {
          objection: {
            type: "string",
            description: "The visitor's objection in their own words, quoted as faithfully as possible.",
          },
        },
        required: ["objection"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "book_meeting",
      description:
        "Propose and confirm a 30-minute meeting on the founder's calendar. Only call this once the visitor has explicitly agreed to a meeting or has Deal IQ ≥ 65 and shows clear intent.",
      parameters: {
        type: "object",
        properties: {
          attendee_email: { type: "string", description: "Visitor's email address." },
          attendee_name: { type: "string", description: "Visitor's name." },
          topic: { type: "string", description: "Short topic/agenda for the meeting." },
          preferred_day_offset_days: {
            type: "integer",
            description:
              "Days from today the visitor prefers (0 = today, 1 = tomorrow, etc.). Use 1 if unsure.",
            minimum: 0,
            maximum: 14,
          },
        },
        required: ["attendee_email", "attendee_name", "topic", "preferred_day_offset_days"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "save_lead",
      description:
        "Persist what you have learned about the lead so far. Call this once when you have enough structured info (name, email, company, role) OR when the visitor disengages.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
          company: { type: "string" },
          role: { type: "string" },
          company_website: { type: "string" },
          status: {
            type: "string",
            enum: ["new", "qualified", "meeting_booked", "disqualified"],
          },
        },
        required: ["status"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "draft_follow_up_email",
      description:
        "Generate a personalized follow-up email from the founder to the lead, based on the full conversation. Call this at the end of any productive conversation.",
      parameters: {
        type: "object",
        properties: {},
      },
    },
  },
];

export interface ToolContext {
  lead: Lead;
  recentTranscript: string;
}

export interface ToolResult {
  output: unknown;
  mutate?: (lead: Lead) => Lead;
  debate?: DebateTrace;
  forcedReply?: string;
}

async function enrichCompany(domain: string): Promise<CompanyEnrichment> {
  const cleaned = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
  try {
    const url = `https://${cleaned}`;
    const res = await fetch(url, {
      signal: AbortSignal.timeout(6000),
      headers: { "user-agent": "ClosrAI-Enrich/1.0" },
    });
    const html = await res.text();
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i);
    const techHints: string[] = [];
    if (/react/i.test(html)) techHints.push("React");
    if (/next\.?js/i.test(html)) techHints.push("Next.js");
    if (/shopify/i.test(html)) techHints.push("Shopify");
    if (/segment\.io|segment_io/i.test(html)) techHints.push("Segment");
    if (/intercom/i.test(html)) techHints.push("Intercom");
    if (/hubspot/i.test(html)) techHints.push("HubSpot");
    const summary =
      [titleMatch?.[1], descMatch?.[1]].filter(Boolean).join(" — ") ||
      `Public site at ${cleaned}.`;
    let industry: string | undefined;
    if (/fintech|payments|lending|banking/i.test(html)) industry = "Fintech";
    else if (/e-?commerce|d2c|shop|retail/i.test(html)) industry = "D2C / E-commerce";
    else if (/saas|platform|software/i.test(html)) industry = "B2B SaaS";
    return {
      domain: cleaned,
      summary: summary.slice(0, 280),
      industry,
      techStack: techHints,
      source: "live",
    };
  } catch (err) {
    console.error("[enrich] live fetch failed, returning stub", err);
    return {
      domain: cleaned,
      summary: `Could not fetch ${cleaned} live; treating as unknown.`,
      source: "stub",
    };
  }
}

function bookMeeting(args: {
  attendee_email: string;
  attendee_name: string;
  topic: string;
  preferred_day_offset_days: number;
}): BookedMeeting {
  const date = new Date();
  date.setDate(date.getDate() + Math.max(0, Math.min(14, args.preferred_day_offset_days)));
  date.setHours(15, 0, 0, 0);
  const confirmationCode = "MEET-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  return {
    slotIso: date.toISOString(),
    attendee: args.attendee_name,
    topic: args.topic,
    confirmationCode,
  };
}

async function draftFollowUpEmail(ctx: ToolContext): Promise<string> {
  const client = getGroq();
  const meta = `Lead: ${ctx.lead.name ?? "unknown"} (${ctx.lead.email ?? "no email"})\nCompany: ${ctx.lead.company ?? "unknown"} — ${ctx.lead.enrichment?.industry ?? "industry unknown"}\nRole: ${ctx.lead.role ?? "unknown"}\nDeal IQ: ${ctx.lead.dealIq?.total ?? "n/a"}\nMeeting: ${ctx.lead.meeting ? `${ctx.lead.meeting.slotIso} (${ctx.lead.meeting.confirmationCode})` : "not booked"}`;
  if (!client) {
    return `Subject: Following up on our chat\n\nHi ${ctx.lead.name ?? "there"},\n\nThanks for the conversation today. I'd love to share how we've helped similar ${ctx.lead.enrichment?.industry ?? "B2B"} teams cut churn meaningfully.\n\n${ctx.lead.meeting ? `Looking forward to our session on ${new Date(ctx.lead.meeting.slotIso).toLocaleString("en-IN")}.` : "Happy to share a short walkthrough whenever you have 15 minutes."}\n\nAarav Mehta\nFounder, Lumen Analytics`;
  }
  const res = await client.chat.completions.create({
    model: AGENT_MODEL,
    max_tokens: 500,
    temperature: 0.6,
    messages: [
      { role: "system", content: FOLLOW_UP_EMAIL_PROMPT },
      { role: "user", content: `${meta}\n\nTranscript:\n${ctx.recentTranscript}` },
    ],
  });
  return (res.choices[0]?.message?.content ?? "").trim();
}

export async function runTool(
  name: string,
  rawInput: unknown,
  ctx: ToolContext,
): Promise<ToolResult> {
  const input = (rawInput ?? {}) as Record<string, unknown>;
  switch (name) {
    case "enrich_company": {
      const domain = String(input.domain ?? "");
      const enrichment = await enrichCompany(domain);
      return {
        output: enrichment,
        mutate: (lead) => ({
          ...lead,
          companyWebsite: enrichment.domain,
          enrichment,
        }),
      };
    }
    case "handle_objection": {
      const objection = String(input.objection ?? "");
      const { trace, reply } = await runObjectionDebate({
        objection,
        lead: ctx.lead,
        recentTranscript: ctx.recentTranscript,
      });
      return {
        output: { trace, reply },
        debate: trace,
        forcedReply: reply,
      };
    }
    case "book_meeting": {
      const meeting = bookMeeting(input as Parameters<typeof bookMeeting>[0]);
      return {
        output: meeting,
        mutate: (lead) => ({
          ...lead,
          status: "meeting_booked",
          meeting,
          name: lead.name ?? String(input.attendee_name ?? ""),
          email: lead.email ?? String(input.attendee_email ?? ""),
        }),
      };
    }
    case "save_lead": {
      const status = (input.status as Lead["status"]) ?? "new";
      return {
        output: { ok: true },
        mutate: (lead) => ({
          ...lead,
          name: (input.name as string) ?? lead.name,
          email: (input.email as string) ?? lead.email,
          company: (input.company as string) ?? lead.company,
          role: (input.role as string) ?? lead.role,
          companyWebsite: (input.company_website as string) ?? lead.companyWebsite,
          status,
        }),
      };
    }
    case "draft_follow_up_email": {
      const email = await draftFollowUpEmail(ctx);
      return {
        output: { email },
        mutate: (lead) => ({ ...lead, followUpEmail: email }),
      };
    }
    default:
      return { output: { error: `Unknown tool: ${name}` } };
  }
}
