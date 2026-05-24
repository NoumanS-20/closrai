import fs from "node:fs/promises";
import path from "node:path";
import type { Lead } from "../src/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");

const now = Date.now();
const min = 60 * 1000;
const hour = 60 * min;

function id(suffix: string): string {
  return `lead_seed_${suffix}`;
}

function mid(prefix: string, n: number): string {
  return `msg_${prefix}_${n}`;
}

const leads: Lead[] = [
  {
    id: id("priya"),
    personaId: "sales",
    createdAt: now - 3 * hour,
    updatedAt: now - 2 * hour,
    name: "Priya Iyer",
    email: "priya@plyo.io",
    company: "Plyo",
    role: "Head of Growth",
    companyWebsite: "plyo.io",
    status: "meeting_booked",
    meeting: {
      slotIso: new Date(now + 24 * hour).toISOString(),
      attendee: "Priya Iyer",
      topic: "Cutting Plyo's 8% quarterly churn with predictive retention",
      confirmationCode: "MEET-PLY3K9",
    },
    enrichment: {
      domain: "plyo.io",
      summary: "Plyo — workplace wellness SaaS for D2C and SaaS teams in India. Series A.",
      industry: "B2B SaaS",
      techStack: ["Next.js", "Segment"],
      source: "stub",
    },
    dealIq: {
      total: 84,
      budget: 70,
      authority: 80,
      need: 95,
      timing: 85,
      intent: 88,
      sentiment: 75,
      icpFit: 90,
      rationale: "Strong ICP, explicit churn pain, decision-maker, urgent timing.",
    },
    followUpEmail:
      "Subject: Cutting Plyo's 8% quarterly churn\n\nHi Priya,\n\nGreat chat earlier. Your 8% quarterly churn on the paying base is exactly the wedge we're built for — most D2C SaaS teams in your range get to ~3% within two quarters of deploying Lumen's retention playbooks.\n\nLooking forward to our session tomorrow at 3 PM IST. I'll come ready with a teardown of two anonymized SaaS accounts we onboarded last month so you can pressure-test the model live.\n\nAarav Mehta\nFounder, Lumen Analytics",
    transcript: [
      {
        id: mid("priya", 1),
        role: "assistant",
        ts: now - 3 * hour,
        content:
          "Hey 👋 I'm ClosrAI from Lumen Analytics. We help SaaS and D2C teams cut churn with predictive retention playbooks. Mind if I ask what brought you here today?",
      },
      {
        id: mid("priya", 2),
        role: "user",
        ts: now - 3 * hour + 30 * 1000,
        content:
          "Hey — I'm Priya, head of growth at Plyo. We're losing about 8% of our paying users every quarter and our success team is drowning. Worth a chat?",
      },
      {
        id: mid("priya", 3),
        role: "assistant",
        ts: now - 3 * hour + 45 * 1000,
        content:
          "8% quarterly is painful — and totally fixable on a SaaS base your size. Quick one: are most cancels happening in the first 30 days of a subscription, or further along the lifecycle?",
        toolCalls: [{ name: "enrich_company", input: { domain: "plyo.io" }, output: {} }],
      },
      {
        id: mid("priya", 4),
        role: "user",
        ts: now - 3 * hour + 2 * min,
        content:
          "Mostly month 2 and 3. Honestly the pricing on AI sales tools has gotten ridiculous though — we're not going to spend ₹2 lakh a month on this.",
      },
      {
        id: mid("priya", 5),
        role: "assistant",
        ts: now - 3 * hour + 2.5 * min,
        content:
          "Totally hear you — \"another ₹2L line item\" is the wrong framing if the impact isn't obvious in 30 days. Most teams in your range start on a usage-based pilot tied to retained MRR, so you don't pay if we don't move the number. Worth seeing what that looks like?",
        debate: {
          objection: "Pricing on AI sales tools has gotten ridiculous — not spending ₹2L/month.",
          skeptic:
            "Real concern isn't price absolute — it's pricing risk. She's been burned by flat-fee SaaS that bills regardless of outcomes. She'll walk if we sound like another fixed-fee vendor.",
          closer:
            "Acknowledge pricing fatigue openly. Reframe to outcome-based pricing: pilot tied to retained MRR, no upside without proof. Lower perceived risk before discussing numbers.",
          resolution: "(rendered as the message above)",
        },
        toolCalls: [
          { name: "handle_objection", input: { objection: "Pricing too high" }, output: {} },
        ],
      },
      {
        id: mid("priya", 6),
        role: "user",
        ts: now - 3 * hour + 5 * min,
        content:
          "OK fine, I'm intrigued. Send me a 20-min slot for tomorrow afternoon. priya@plyo.io.",
      },
      {
        id: mid("priya", 7),
        role: "assistant",
        ts: now - 3 * hour + 5.5 * min,
        content:
          "Done — sent the invite to priya@plyo.io for tomorrow at 3 PM IST (confirmation code MEET-PLY3K9). Aarav, our founder, will run it. He'll come with two anonymized D2C SaaS accounts we onboarded last month so you can stress-test the retention model on real data.",
        toolCalls: [
          { name: "book_meeting", input: {}, output: {} },
          { name: "save_lead", input: { status: "meeting_booked" }, output: {} },
          { name: "draft_follow_up_email", input: {}, output: {} },
        ],
      },
    ],
  },
  {
    id: id("vikram"),
    personaId: "support",
    createdAt: now - 5 * hour,
    updatedAt: now - 4 * hour,
    name: "Vikram Rao",
    email: "vikram@stripeshield.in",
    company: "StripeShield",
    role: "Engineering Lead",
    status: "resolved",
    resolvedSummary:
      "Helped diagnose Segment ingestion lag — turned out to be a stale write key. Customer fixed in chat.",
    dealIq: {
      total: 88,
      budget: 60,
      authority: 75,
      need: 90,
      timing: 80,
      intent: 95,
      sentiment: 70,
      icpFit: 12,
      rationale: "Specific technical issue, on Growth plan, resolved with KB hit.",
    },
    transcript: [
      {
        id: mid("vikram", 1),
        role: "assistant",
        ts: now - 5 * hour,
        content:
          "Hi! I'm ClosrSupport from Lumen Analytics. I can help with product questions, troubleshooting, billing, integrations, or anything else. What's going on?",
      },
      {
        id: mid("vikram", 2),
        role: "user",
        ts: now - 5 * hour + 30 * 1000,
        content:
          "Our Segment events stopped flowing into Lumen about 6 hours ago. Health scores are stale. We're on Growth plan.",
      },
      {
        id: mid("vikram", 3),
        role: "assistant",
        ts: now - 5 * hour + 60 * 1000,
        content:
          "That usually points to one of three things: a stale Segment write key, a Segment workspace renamed/moved, or a recent destination toggle. Easiest first — open Lumen → Integrations → Segment and confirm the write key matches what's in your Segment workspace under Connections → Sources → your-source → Settings. If those drifted, the events will queue without erroring on Segment's side.",
        toolCalls: [
          { name: "search_kb", input: { query: "segment events stopped flowing integration" }, output: {} },
        ],
      },
      {
        id: mid("vikram", 4),
        role: "user",
        ts: now - 5 * hour + 5 * min,
        content: "You were right — the write key didn't match. Rotated and events are flowing again. Thank you!",
      },
      {
        id: mid("vikram", 5),
        role: "assistant",
        ts: now - 5 * hour + 5.5 * min,
        content:
          "Glad that worked. For future, you can enable \"alert on >10min ingestion gap\" under Settings → Alerting → Ingestion to catch this within minutes instead of hours. Anything else?",
        toolCalls: [{ name: "save_lead", input: { status: "resolved" }, output: {} }],
      },
    ],
  },
  {
    id: id("anita"),
    personaId: "care",
    createdAt: now - 8 * hour,
    updatedAt: now - 7 * hour,
    name: "Anita Sharma",
    email: "anita.sharma@gmail.com",
    phone: "+91 98xxxxxx12",
    status: "escalated",
    escalation: {
      ticketId: "TIX-DMG-9F2K",
      priority: "high",
      reason:
        "Cast-iron skillet arrived with a visible crack along the rim. Customer paid ₹2499, photographic evidence shared in chat.",
      createdAtIso: new Date(now - 7 * hour).toISOString(),
    },
    orderLookup: {
      orderId: "PLY-12345",
      status: "delivered",
      items: [
        { name: "Plyo Cast-Iron Skillet (10 inch)", qty: 1, priceInr: 2499 },
        { name: "Plyo Wooden Spatula Set (3 pcs)", qty: 1, priceInr: 599 },
      ],
      totalInr: 3098,
      placedIso: new Date(now - 4 * 24 * hour).toISOString(),
      expectedDeliveryIso: new Date(now - 6 * hour).toISOString(),
      trackingUrl: "https://track.delhivery.com/PLY-12345",
      shippingPincode: "560034",
    },
    dealIq: {
      total: 42,
      budget: 20,
      authority: 80,
      need: 80,
      timing: 90,
      intent: 60,
      sentiment: 20,
      icpFit: 75,
      rationale:
        "Damaged-on-arrival case, customer upset but coherent — escalated to fulfillment with high priority.",
    },
    transcript: [
      {
        id: mid("anita", 1),
        role: "assistant",
        ts: now - 8 * hour,
        content:
          "Hi! I'm PlyoCare. I can help with order status, returns, exchanges, refunds, or anything about your account. What can I do for you?",
      },
      {
        id: mid("anita", 2),
        role: "user",
        ts: now - 8 * hour + 40 * 1000,
        content:
          "Order PLY-12345 just arrived. The cast-iron skillet has a visible crack along the rim — it's unusable. I paid ₹2499 for it.",
      },
      {
        id: mid("anita", 3),
        role: "assistant",
        ts: now - 8 * hour + 70 * 1000,
        content:
          "I'm really sorry — that's not what should be in your kitchen this evening. I've pulled up PLY-12345 and can see it was delivered today. This is a damage-on-arrival case so I'm escalating it to our fulfillment lead with high priority (ticket TIX-DMG-9F2K). They'll arrange a free pickup and a fresh replacement, or a full refund to your original payment method — your call. Which would you prefer?",
        toolCalls: [
          { name: "lookup_order", input: { identifier: "PLY-12345" }, output: {} },
          {
            name: "escalate_to_human",
            input: {
              reason: "Damaged-on-arrival cast iron skillet",
              priority: "high",
            },
            output: {},
          },
          { name: "save_lead", input: { status: "escalated" }, output: {} },
        ],
      },
    ],
  },
  {
    id: id("rohan"),
    personaId: "sales",
    createdAt: now - 11 * hour,
    updatedAt: now - 10 * hour,
    name: "Rohan Kapoor",
    email: "rk@bytecart.in",
    company: "Bytecart",
    role: "VP Customer Success",
    companyWebsite: "bytecart.in",
    status: "qualified",
    enrichment: {
      domain: "bytecart.in",
      summary: "Bytecart — D2C e-commerce SaaS for Indian brands. Bootstrapped.",
      industry: "D2C / E-commerce",
      techStack: ["React", "Shopify"],
      source: "stub",
    },
    dealIq: {
      total: 68,
      budget: 55,
      authority: 75,
      need: 80,
      timing: 50,
      intent: 70,
      sentiment: 65,
      icpFit: 75,
      rationale: "Decision-maker with clear need; budget timing soft.",
    },
    transcript: [
      {
        id: mid("rohan", 1),
        role: "assistant",
        ts: now - 11 * hour,
        content:
          "Hey 👋 I'm ClosrAI from Lumen Analytics. We help SaaS and D2C teams cut churn with predictive retention playbooks. Mind if I ask what brought you here today?",
      },
      {
        id: mid("rohan", 2),
        role: "user",
        ts: now - 11 * hour + 40 * 1000,
        content:
          "Just exploring. Our CSMs are spending too much time triaging at-risk accounts manually. We have ~3k merchants on Bytecart.",
      },
      {
        id: mid("rohan", 3),
        role: "assistant",
        ts: now - 11 * hour + 70 * 1000,
        content:
          "Got it — manual triage at 3k merchants is exactly where predictive scoring earns its keep. Are your CSMs working off Slack alerts and a spreadsheet today, or do you have a tool that just isn't surfacing the right signals?",
      },
    ],
  },
];

async function main() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), "utf8");
  console.log(`Seeded ${leads.length} leads across personas to ${LEADS_FILE}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
