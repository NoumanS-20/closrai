# ClosrAI — the AI sales rep that argues with itself

> **FlowZint AI Hackathon 2026 · Sales Bot track**
> *Automate sales conversations & boost conversions.*

ClosrAI is an AI Sales Development Representative for B2B SaaS. It lives on a pricing page, qualifies anonymous visitors in real time, **runs an internal Skeptic-vs-Closer debate** before responding to every objection, and books meetings — all while a transparent **Deal IQ** score streams live to the founder's dashboard.

The fictional product behind the demo is *Lumen Analytics*, a churn-prediction SaaS. ClosrAI is the SDR working its homepage.

---

## Why this is different from another GPT-wrapper chatbot

Three things judges have never seen in one Sales Bot:

| # | Mechanism | Why it matters |
|---|-----------|----------------|
| 1 | **Live Deal IQ scoring** — a 7-dimensional BANT + intent + sentiment + ICP-fit score that updates *per message* with a one-line rationale | Founders get a transparent number, not a black box. Visible in real time on the dashboard. |
| 2 | **Skeptic-vs-Closer multi-agent debate** on every objection | The internal Skeptic surfaces the *real* underlying concern beneath the stated objection. The Closer crafts the reframe. A Resolver synthesizes the final message. The debate is logged in the transcript — explainable AI for sales. |
| 3 | **Real tool-using agent** — not a glorified RAG bot | ClosrAI calls 5 live tools: enriches the company from its public website, books a meeting on a calendar, writes a CRM row, drafts a personalized founder follow-up email. |

---

## Live demo

- **Visitor view:** `/chat` — talk to ClosrAI as a prospect.
- **Founder console:** `/dashboard` — see every lead, transcript, debate trace, and auto-drafted email.

A guided 90-second demo script is in [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md).

---

## Architecture

```
Next.js 16 App Router (Vercel-deployable, all-in-one)
  ├── /                       Marketing landing
  ├── /chat                   Visitor-facing widget + Live Deal IQ gauge
  ├── /dashboard              Founder console (lead list + stats)
  ├── /dashboard/[id]         Lead detail (transcript, debate, email draft)
  ├── /api/chat               Agent endpoint (POST)
  └── /api/leads              CRM read (GET) + /[id]

Agent runtime (src/agent/)
  └── runAgentTurn()
        ├── scoreDealIQ()          ── Haiku 4.5 · structured JSON scorer
        ├── Claude tool-use loop   ── Opus 4.7 · 5 tools, ≤5 rounds
        │     ├── enrich_company         · Live HTTP fetch + heuristic tagging
        │     ├── handle_objection       · → debate sub-system
        │     │     ├── Skeptic           ── Haiku 4.5
        │     │     ├── Closer            ── Haiku 4.5
        │     │     └── Resolver          ── Haiku 4.5
        │     ├── book_meeting           · Mock calendar with confirmation code
        │     ├── save_lead              · JSON-file CRM (zero-deps demo store)
        │     └── draft_follow_up_email  · Opus 4.7 · personalized
        └── upsertLead()            ── data/leads.json
```

### Why this design

- **Prompt caching** (`cache_control: { type: "ephemeral" }`) on the long SDR system prompt — keeps token cost low and latency tight on multi-turn calls.
- **Model split** — Opus 4.7 for the SDR brain and email drafting (quality matters); Haiku 4.5 for scoring, debate roles, and resolution (latency matters, cost matters, 4 calls per debate).
- **Tool-use as the spine, not RAG** — every "action" the agent takes is a real, observable tool call. No vector DB needed for this product surface, so we don't add one.
- **JSON file store** — leads persist locally for the demo; swappable for Postgres in one file. Deliberate scope choice for a 3-day solo build.
- **Heuristic fallback everywhere** — Deal IQ, debate, and email drafting all degrade gracefully when `ANTHROPIC_API_KEY` is absent, so judges can clone and run with zero secrets and still see the UX.

---

## Quick start

```bash
git clone <this-repo>
cd closrai
npm install
cp .env.local.example .env.local
# add your ANTHROPIC_API_KEY to .env.local
npm run dev
```

Then open:
- http://localhost:3000 — landing
- http://localhost:3000/chat — talk to ClosrAI
- http://localhost:3000/dashboard — founder view

The app runs **without an API key** in stub mode (heuristic scoring, scripted replies) — useful for reviewers who don't want to plug in a key.

### Production build

```bash
npm run build
npm start
```

---

## Tech stack

- **Next.js 16** (App Router, Turbopack)
- **React 19**
- **TypeScript** (strict)
- **Tailwind CSS 4**
- **Anthropic SDK** (`@anthropic-ai/sdk` v0.98) — Claude Opus 4.7 + Haiku 4.5
- **zod** for request validation
- **No database** — JSON file persistence (`data/leads.json`)

---

## File map

```
src/
  agent/
    core.ts        Agent orchestrator: scoring + tool-use loop
    client.ts      Anthropic SDK singleton + model IDs
    tools.ts       Tool definitions and handlers
    debate.ts      Skeptic / Closer / Resolver sub-system
    dealiq.ts      7-dimensional lead scoring
    prompts.ts     All system prompts (one source of truth)
  app/
    page.tsx                  Marketing landing
    layout.tsx                Root layout
    chat/page.tsx             Visitor chat
    dashboard/page.tsx        Lead list + stats
    dashboard/[id]/page.tsx   Lead detail
    api/chat/route.ts         POST /api/chat
    api/leads/route.ts        GET  /api/leads
    api/leads/[id]/route.ts   GET  /api/leads/[id]
  components/
    ChatWidget.tsx     Stateful chat UI
    DealIQGauge.tsx    Animated score ring + breakdown bars
    DebatePanel.tsx    Inline objection-debate display
  lib/
    types.ts           Shared TS types
    store.ts           JSON-file CRM
```

---

## Judging-criteria alignment

| Criterion (weight) | How ClosrAI delivers |
|---|---|
| **Model Innovation & Novelty (30%)** | Multi-agent Skeptic-vs-Closer debate routed via Claude tool-use; transparent live Deal IQ score with explainability; model split (Opus for closing, Haiku for fast loops). |
| **Real-World Applicability (25%)** | Solves a concrete B2B SaaS founder pain (anonymous-visitor → qualified-meeting). Every action is a real tool call: enrichment, calendar, CRM, follow-up email. |
| **Technical Architecture (25%)** | Clean module boundaries (agent / lib / components / app), prompt caching, graceful no-key fallback, strict TypeScript, zod-validated API, ≤5-round tool loop guard. |
| **Documentation Clarity (20%)** | This README, demo script, inline file comments, architecture ASCII diagram, README-driven file map. |

---

## License

MIT
