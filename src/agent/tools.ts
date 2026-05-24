import type Groq from "groq-sdk";
import type {
  BookedMeeting,
  CompanyEnrichment,
  DebateTrace,
  EscalationTicket,
  Lead,
  OrderRecord,
} from "@/lib/types";
import { runObjectionDebate } from "./debate";
import { AGENT_MODEL, getGroq } from "./client";
import { FOLLOW_UP_EMAIL_PROMPT } from "./prompts";
import type { PersonaDefinition } from "./personas";

type GroqTool = Groq.Chat.Completions.ChatCompletionTool;

const ALL_TOOLS: Record<string, GroqTool> = {
  enrich_company: {
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
  handle_objection: {
    type: "function",
    function: {
      name: "handle_objection",
      description:
        "Route a person's objection (price, time, trust, fit, refund refusal, policy pushback) to the internal Skeptic-vs-Closer debate system. Use this whenever the person pushes back on the product, process, or policy. Returns the message to send along with the internal reasoning trace.",
      parameters: {
        type: "object",
        properties: {
          objection: {
            type: "string",
            description: "The person's objection in their own words, quoted as faithfully as possible.",
          },
        },
        required: ["objection"],
      },
    },
  },
  book_meeting: {
    type: "function",
    function: {
      name: "book_meeting",
      description:
        "Propose and confirm a 30-minute meeting on the founder's calendar. Only call once the visitor has explicitly agreed OR has Deal IQ ≥ 65 and shows clear intent.",
      parameters: {
        type: "object",
        properties: {
          attendee_email: { type: "string" },
          attendee_name: { type: "string" },
          topic: { type: "string" },
          preferred_day_offset_days: {
            type: "integer",
            minimum: 0,
            maximum: 14,
          },
        },
        required: ["attendee_email", "attendee_name", "topic", "preferred_day_offset_days"],
      },
    },
  },
  save_lead: {
    type: "function",
    function: {
      name: "save_lead",
      description:
        "Persist what you have learned. Call when you have enough structured info (name, email, company, role) OR when the conversation is wrapping up.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          email: { type: "string" },
          phone: { type: "string" },
          company: { type: "string" },
          role: { type: "string" },
          company_website: { type: "string" },
          status: {
            type: "string",
            enum: [
              "new",
              "qualified",
              "meeting_booked",
              "disqualified",
              "resolved",
              "escalated",
            ],
          },
          summary: {
            type: "string",
            description: "One-sentence summary of what was discussed and resolved.",
          },
        },
        required: ["status"],
      },
    },
  },
  draft_follow_up_email: {
    type: "function",
    function: {
      name: "draft_follow_up_email",
      description:
        "Generate a personalized follow-up email from the founder to the lead based on the full conversation. Call at the end of a productive sales conversation.",
      parameters: { type: "object", properties: {} },
    },
  },
  search_kb: {
    type: "function",
    function: {
      name: "search_kb",
      description:
        "Search the product knowledge base for an answer to a technical or policy question. Use FIRST for any product/billing/integration/policy question before answering from memory.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The user's question, rephrased as a concise search query.",
          },
        },
        required: ["query"],
      },
    },
  },
  escalate_to_human: {
    type: "function",
    function: {
      name: "escalate_to_human",
      description:
        "Hand off the conversation to a human agent. Use when issue is unresolvable in chat: data loss, security incident, billing dispute >₹10K, custom integration, or the user explicitly asks for a human.",
      parameters: {
        type: "object",
        properties: {
          reason: {
            type: "string",
            description: "One-sentence summary of why this needs a human.",
          },
          priority: {
            type: "string",
            enum: ["low", "normal", "high"],
          },
        },
        required: ["reason", "priority"],
      },
    },
  },
  lookup_order: {
    type: "function",
    function: {
      name: "lookup_order",
      description:
        "Look up an order by order ID, email, or phone. ALWAYS call this before discussing any order's status. Returns order details, status, items, and tracking.",
      parameters: {
        type: "object",
        properties: {
          identifier: {
            type: "string",
            description:
              "Order ID (e.g. PLY-12345), email, or phone number provided by the customer.",
          },
        },
        required: ["identifier"],
      },
    },
  },
  refund_request: {
    type: "function",
    function: {
      name: "refund_request",
      description:
        "Process a refund or return request. Returns approval status, refund amount, and ETA. Only call after looking up the order with lookup_order.",
      parameters: {
        type: "object",
        properties: {
          order_id: { type: "string" },
          reason: { type: "string" },
          type: { type: "string", enum: ["refund", "return", "exchange"] },
        },
        required: ["order_id", "reason", "type"],
      },
    },
  },
};

export function getToolsForPersona(persona: PersonaDefinition): GroqTool[] {
  return persona.enabledTools
    .map((name) => ALL_TOOLS[name])
    .filter((t): t is GroqTool => Boolean(t));
}

export interface ToolContext {
  lead: Lead;
  recentTranscript: string;
  persona: PersonaDefinition;
}

export interface ToolResult {
  output: unknown;
  mutate?: (lead: Lead) => Lead;
  debate?: DebateTrace;
  forcedReply?: string;
}

async function enrichCompany(domain: string): Promise<CompanyEnrichment> {
  const cleaned = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").toLowerCase();
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(cleaned)) {
    return {
      domain: cleaned || "unknown",
      summary: "No valid company domain was provided, so live enrichment was skipped.",
      source: "stub",
    };
  }
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

interface KbDoc {
  topic: string;
  question: string;
  answer: string;
  tags: string[];
}

const KB: KbDoc[] = [
  {
    topic: "billing",
    question: "What are Lumen's pricing tiers?",
    answer:
      "Three plans: Starter at ₹40K/mo (up to 5K monitored users), Growth at ₹1.2L/mo (up to 50K users + Slack/HubSpot/Salesforce integrations), Enterprise at custom pricing (unlimited users, dedicated CSM, custom SLAs). 14-day free trial. Annual plans get 20% off and 30-day money-back guarantee.",
    tags: ["pricing", "cost", "plans", "trial", "refund"],
  },
  {
    topic: "integration",
    question: "Which integrations does Lumen support?",
    answer:
      "Native integrations: Slack (alerts + bot), HubSpot (two-way sync), Salesforce (lead + contact sync), Segment (event stream input), Mixpanel (event stream input). REST API + webhooks available on Growth and Enterprise.",
    tags: ["integration", "slack", "hubspot", "salesforce", "api", "webhook"],
  },
  {
    topic: "data",
    question: "Where is customer data stored?",
    answer:
      "All customer data is stored in AWS ap-south-1 (Mumbai region) with at-rest encryption (AES-256) and in-transit TLS 1.3. SOC2 Type II audit completed Feb 2026. GDPR + DPDP Act compliant. Customers can request a data export or full deletion via support@lumenanalytics.in.",
    tags: ["security", "data", "compliance", "gdpr", "dpdp", "soc2"],
  },
  {
    topic: "product",
    question: "How does churn prediction work?",
    answer:
      "Lumen ingests product usage events (via Segment/Mixpanel/API), support tickets (via HubSpot/Zendesk), and billing signals. A gradient-boosted model trained on each customer's own historical churners produces a churn-risk score (0-100) updated nightly. Customers above threshold trigger automated retention playbooks (email, in-app, CSM alert).",
    tags: ["churn", "prediction", "model", "ml", "playbook", "retention"],
  },
  {
    topic: "support",
    question: "How do I reach a human if the bot can't help?",
    answer:
      "Type 'talk to human' or 'escalate' and you'll be handed off to a human CSM (response time: ~4 business hours on Starter, ~1 hour on Growth, 15 min SLA on Enterprise). Or email support@lumenanalytics.in.",
    tags: ["human", "escalate", "csm", "sla"],
  },
];

function searchKb(query: string): { hits: KbDoc[]; query: string } {
  const q = query.toLowerCase();
  const scored = KB.map((doc) => {
    let score = 0;
    for (const tag of doc.tags) if (q.includes(tag)) score += 3;
    for (const word of q.split(/\W+/).filter(Boolean)) {
      if (doc.question.toLowerCase().includes(word)) score += 1;
      if (doc.answer.toLowerCase().includes(word)) score += 0.5;
    }
    return { doc, score };
  })
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => s.doc);
  return { hits: scored, query };
}

function escalateToHuman(args: { reason: string; priority: "low" | "normal" | "high" }): EscalationTicket {
  return {
    ticketId: "TIX-" + Math.random().toString(36).slice(2, 8).toUpperCase(),
    priority: args.priority,
    reason: args.reason,
    createdAtIso: new Date().toISOString(),
  };
}

const MOCK_ORDERS: Record<string, OrderRecord> = {
  "PLY-12345": {
    orderId: "PLY-12345",
    status: "out_for_delivery",
    items: [
      { name: "Plyo Cast-Iron Skillet (10 inch)", qty: 1, priceInr: 2499 },
      { name: "Plyo Wooden Spatula Set (3 pcs)", qty: 1, priceInr: 599 },
    ],
    totalInr: 3098,
    placedIso: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    expectedDeliveryIso: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    trackingUrl: "https://track.delhivery.com/PLY-12345",
    shippingPincode: "560034",
  },
  "PLY-99001": {
    orderId: "PLY-99001",
    status: "delivered",
    items: [
      { name: "Plyo Steel Bottle 1L (Onyx)", qty: 2, priceInr: 899 },
    ],
    totalInr: 1798,
    placedIso: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
    expectedDeliveryIso: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
    trackingUrl: "https://track.delhivery.com/PLY-99001",
    shippingPincode: "110024",
  },
};

function lookupOrder(identifier: string): OrderRecord | { error: string } {
  const id = identifier.toUpperCase().trim();
  const direct = MOCK_ORDERS[id];
  if (direct) return direct;
  const byPrefix = Object.keys(MOCK_ORDERS).find((k) => id.includes(k));
  if (byPrefix) return MOCK_ORDERS[byPrefix];
  if (/@/.test(identifier) || /^\d{10}$/.test(identifier.replace(/\D/g, ""))) {
    const [first] = Object.values(MOCK_ORDERS);
    return first;
  }
  return {
    error: `No order found for identifier "${identifier}". Try a full order ID like PLY-12345 or the email used at checkout.`,
  };
}

interface RefundResult {
  approved: boolean;
  orderId: string;
  type: "refund" | "return" | "exchange";
  reason: string;
  refundAmountInr?: number;
  etaBusinessDays?: number;
  rejectionReason?: string;
  ticketId: string;
}

function refundRequest(args: {
  order_id: string;
  reason: string;
  type: "refund" | "return" | "exchange";
}): RefundResult {
  const order = MOCK_ORDERS[args.order_id.toUpperCase().trim()];
  const ticketId = "RMA-" + Math.random().toString(36).slice(2, 8).toUpperCase();
  if (!order) {
    return {
      approved: false,
      orderId: args.order_id,
      type: args.type,
      reason: args.reason,
      rejectionReason: "Order ID not found.",
      ticketId,
    };
  }
  const deliveredAt = order.expectedDeliveryIso
    ? new Date(order.expectedDeliveryIso).getTime()
    : 0;
  const daysSinceDelivery = (Date.now() - deliveredAt) / (24 * 60 * 60 * 1000);
  if (order.status !== "delivered" && order.status !== "out_for_delivery") {
    return {
      approved: false,
      orderId: order.orderId,
      type: args.type,
      reason: args.reason,
      rejectionReason: `Order is currently ${order.status} — refund/return requests are processed after delivery.`,
      ticketId,
    };
  }
  if (daysSinceDelivery > 14) {
    return {
      approved: false,
      orderId: order.orderId,
      type: args.type,
      reason: args.reason,
      rejectionReason: `Outside 14-day return window (delivered ${Math.floor(daysSinceDelivery)} days ago).`,
      ticketId,
    };
  }
  return {
    approved: true,
    orderId: order.orderId,
    type: args.type,
    reason: args.reason,
    refundAmountInr: order.totalInr,
    etaBusinessDays: 5,
    ticketId,
  };
}

async function draftFollowUpEmail(ctx: ToolContext): Promise<string> {
  const client = getGroq();
  const meta = `Lead: ${ctx.lead.name ?? "unknown"} (${ctx.lead.email ?? "no email"})\nCompany: ${ctx.lead.company ?? "unknown"} — ${ctx.lead.enrichment?.industry ?? "industry unknown"}\nRole: ${ctx.lead.role ?? "unknown"}\nScore: ${ctx.lead.dealIq?.total ?? "n/a"}\nMeeting: ${ctx.lead.meeting ? `${ctx.lead.meeting.slotIso} (${ctx.lead.meeting.confirmationCode})` : "not booked"}\nFounder name: Aarav Mehta, Founder, ${ctx.persona.brand.company}`;
  if (!client) {
    return `Subject: Following up on our chat\n\nHi ${ctx.lead.name ?? "there"},\n\nThanks for the conversation today. I'd love to share how we've helped similar ${ctx.lead.enrichment?.industry ?? "B2B"} teams cut churn meaningfully.\n\n${ctx.lead.meeting ? `Looking forward to our session on ${new Date(ctx.lead.meeting.slotIso).toLocaleString("en-IN")}.` : "Happy to share a short walkthrough whenever you have 15 minutes."}\n\nAarav Mehta\nFounder, ${ctx.persona.brand.company}`;
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
      if (ctx.lead.enrichment) {
        return {
          output: {
            skipped: true,
            reason: "Company already enriched for this conversation.",
            enrichment: ctx.lead.enrichment,
          },
        };
      }
      const enrichment = await enrichCompany(String(input.domain ?? ""));
      return {
        output: enrichment,
        mutate: (lead) =>
          enrichment.domain === "unknown"
            ? lead
            : {
                ...lead,
                companyWebsite: enrichment.domain,
                enrichment,
              },
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
      const summary =
        typeof input.summary === "string" ? input.summary : undefined;
      return {
        output: { ok: true },
        mutate: (lead) => ({
          ...lead,
          name: (input.name as string) ?? lead.name,
          email: (input.email as string) ?? lead.email,
          phone: (input.phone as string) ?? lead.phone,
          company: (input.company as string) ?? lead.company,
          role: (input.role as string) ?? lead.role,
          companyWebsite: (input.company_website as string) ?? lead.companyWebsite,
          resolvedSummary: summary ?? lead.resolvedSummary,
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
    case "search_kb": {
      const result = searchKb(String(input.query ?? ""));
      return { output: result };
    }
    case "escalate_to_human": {
      const ticket = escalateToHuman({
        reason: String(input.reason ?? "Unresolvable in chat."),
        priority: (input.priority as "low" | "normal" | "high") ?? "normal",
      });
      return {
        output: ticket,
        mutate: (lead) => ({ ...lead, status: "escalated", escalation: ticket }),
      };
    }
    case "lookup_order": {
      const result = lookupOrder(String(input.identifier ?? ""));
      if ("error" in result) {
        return { output: result };
      }
      return {
        output: result,
        mutate: (lead) => ({ ...lead, orderLookup: result }),
      };
    }
    case "refund_request": {
      const result = refundRequest({
        order_id: String(input.order_id ?? ""),
        reason: String(input.reason ?? ""),
        type: (input.type as "refund" | "return" | "exchange") ?? "refund",
      });
      return {
        output: result,
        mutate: (lead) =>
          result.approved
            ? { ...lead, status: "resolved" }
            : lead,
      };
    }
    default:
      return { output: { error: `Unknown tool: ${name}` } };
  }
}
