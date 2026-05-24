# ClosrAI Platform — one agent core, three bots that argue with themselves

> **FlowZint AI Hackathon 2026 · Open Innovation**
> Covers 3 of 4 hackathon tracks: **Sales Bot · Support Chat Bot · Customer Care Bot** — all on one shared agent runtime.

ClosrAI is a multi-track AI bot platform. Three personas (Sales SDR, Support Agent, Customer Care) share the same `runAgentTurn()`, the same Skeptic-vs-Closer multi-agent debate, the same transparent IQ scorer, and the same founder dashboard. Only the system prompt, the scorer dimensions, and the tool palette change per persona.

It also ships with **browser-native voice mode** (Web Speech API — talk to the bot, hear it talk back) and a **one-line `<script>` embed** that drops the appropriate bot into any third-party website.

---

## Live demo

- **Landing & overview:** [`/`](https://closrai-nine.vercel.app/)
- **Bot picker:** [`/chat`](https://closrai-nine.vercel.app/chat)
  - Sales SDR: [`/chat/sales`](https://closrai-nine.vercel.app/chat/sales)
  - Support Agent: [`/chat/support`](https://closrai-nine.vercel.app/chat/support)
  - Customer Care: [`/chat/care`](https://closrai-nine.vercel.app/chat/care)
- **Unified founder dashboard:** [`/dashboard`](https://closrai-nine.vercel.app/dashboard) (filter by persona)
- **Third-party embed demo:** [`/embed-demo`](https://closrai-nine.vercel.app/embed-demo) (fake customer site with the launcher in the corner)

---

## What's novel — for the 30% Model Innovation score

Four mechanisms judges have never seen in **one** Sales+Support+Care submission:

| # | Mechanism | Why it matters |
|---|-----------|----------------|
| 1 | **One agent core, three bots** | Same `runAgentTurn()` powers Sales, Support, and Care. Switch personas, get a different system prompt, scorer, tool palette, accent color, IQ threshold. Architectural reuse, not three separate apps. |
| 2 | **Skeptic-vs-Closer multi-agent debate** | When a person pushes back (price, refund refusal, policy), two internal agents argue. Skeptic finds the *real* concern beneath the surface; Closer crafts the reframe; Resolver synthesizes. **All three personas use it.** |
| 3 | **Persona-specific IQ scoring** | 7 dimensions, scored per message by Llama 3.1 8B. Sales gets Deal IQ (BANT + ICP fit). Support gets Resolution IQ (KB coverage + escalation risk). Care gets Care IQ (satisfaction + loyalty risk). Streams to the dashboard live. |
| 4 | **Voice + Embed for free** | Browser-native Web Speech API (STT + TTS) — no extra API key, no extra dep. One-line `<script>` embed lets any site drop a configured persona in 30 seconds. |

---

## Try it locally

```bash
git clone https://github.com/NoumanS-20/closrai.git
cd closrai
npm install
cp .env.local.example .env.local
# Add your free Groq API key from https://console.groq.com/keys
npm run seed   # populates 4 demo leads across all 3 personas
npm run dev
```

Then open:
- http://localhost:3000 — landing
- http://localhost:3000/chat — bot picker
- http://localhost:3000/dashboard — founder view
- http://localhost:3000/embed-demo — embed demo (fake customer site)

The app runs **without an API key** in stub mode (heuristic scoring per persona, scripted replies) — useful for reviewers who don't want to plug in a key.

---

## Architecture

```
Next.js 16 App Router (Vercel-deployable, all-in-one)
  ├── /                          Marketing landing
  ├── /chat                      Bot picker (links to 3 personas)
  │   ├── /chat/sales           Sales SDR widget (emerald)
  │   ├── /chat/support         Support Agent widget (sky)
  │   └── /chat/care            Customer Care widget (violet)
  ├── /embed                     Sidebar-less widget for iframes
  ├── /embed-demo                Fake customer site demonstrating <script> embed
  ├── /dashboard                 Founder console (filter by persona)
  ├── /dashboard/[id]            Per-lead detail (transcript + debate + order + escalation)
  ├── /api/chat                  Agent endpoint (POST)
  ├── /api/leads                 CRM read (GET) + /[id]
  └── /embed.js                  Public script that any site can <script src=...>

Agent runtime (src/agent/)
  └── runAgentTurn(lead)
        ├── personas.ts            3 persona definitions (system prompt, scorer prompt, tool gate, IQ threshold)
        ├── scoreDealIQ            persona.scorerPrompt → Llama 3.1 8B (JSON output)
        ├── Groq tool-use loop     persona.systemPrompt + persona.enabledTools, ≤5 rounds
        │     ├── enrich_company         (Sales)         — live web fetch + heuristic tagging
        │     ├── search_kb              (Support)       — in-memory KB w/ tag+token scoring
        │     ├── lookup_order           (Care)          — mock order DB, 2 fixtures
        │     ├── refund_request         (Care)          — 14-day return-window logic
        │     ├── escalate_to_human      (Support, Care) — produces ticket ID with priority
        │     ├── handle_objection       (All 3)         — Skeptic + Closer + Resolver debate
        │     ├── book_meeting           (Sales)         — mock calendar with confirmation code
        │     ├── save_lead              (All 3)         — persists to backend
        │     └── draft_follow_up_email  (Sales)         — Llama 3.3 70B
        └── store.upsertLead       3-tier backend: Upstash Redis / file / in-memory (auto-picked)
```

### Why these choices

- **Persona as data, not subclasses.** Adding a fourth persona is a single new entry in `personas.ts` — no agent core changes, no new route handler, no new components. The platform is the point.
- **Llama 3.3 70B + 3.1 8B split.** 70B on the SDR brain and email drafting (quality). 8B on the scorer and three debate roles (latency, cost — four 8B calls per debate). Groq inference (~280 tok/s on 70B, ~560 on 8B) makes the multi-agent debate sub-second.
- **Tool-use as the spine, not RAG.** Every visible action is a real, observable tool call. No vector DB. The Support persona's "knowledge base" is a small in-memory tagged corpus with deterministic scoring — fast, debuggable, and enough for the demo.
- **Salvage path for Llama-on-Groq tool-call quirks.** Llama occasionally emits raw `<function=...>` text instead of structured `tool_calls`. The core loop catches the `tool_use_failed` 400, parses the raw text, and continues the loop manually.
- **Zero-config persistence with three backends.** Local: `data/leads.json`. Vercel + Upstash env vars: Redis. Vercel without KV: in-memory map. Single import, automatic.
- **Voice via browser, not via API.** Web Speech API gives free STT + TTS with no extra cost or rate limit. en-IN locale by default.

---

## Embedding ClosrAI on another site

```html
<!-- Anywhere in your site's HTML -->
<script
  src="https://closrai-nine.vercel.app/embed.js"
  data-persona="care"
  data-voice="1"
  defer
></script>
```

- `data-persona` — `sales` | `support` | `care` (default `sales`)
- `data-voice` — `1` to enable voice mode in the embedded widget, `0` to disable
- The script injects a themed floating launcher; clicking it opens an iframe to `/embed?persona=…`.

See `/embed-demo` for a fake third-party site demonstrating this.

---

## Accessibility

Accessibility is built into ClosrAI Platform from day one — not bolted on later. The dedicated [`/accessibility`](https://closrai-nine.vercel.app/accessibility) page in the deployed app documents every commitment in detail; here's the short version:

- **In-app settings panel** on every page (header icon). Toggles: high contrast, larger text (16 → 18 px), dyslexia-friendly font, reduce motion, always-underline links. Persists in `localStorage`.
- **Skip-to-content link** as the first focusable element on every page. Every `<main>` has `id="main"` for it to target.
- **Screen reader support:**
  - Chat transcript uses `role="log"` + `aria-live="polite"` + `aria-relevant="additions text"` — new bot replies are announced.
  - Each message is wrapped in `<article aria-label="...said">` so screen readers identify the speaker.
  - Live Deal IQ ring is `role="img"` with the current score in `aria-label`; each breakdown bar uses `role="progressbar"` with proper min/max/valuenow/valuetext; a screen-reader-only `aria-live` region announces score changes with rationale.
  - Skeptic-vs-Closer debate panel is a labelled `<section role="region">` with `<h3>` headings for each perspective.
  - Status and persona badges have `sr-only` "Status:" / "Persona:" prefixes so the chips read sensibly without color.
  - Dashboard filter pills use `aria-current="page"` on the active filter; the leads table has an `<caption className="sr-only">` describing the current view.
- **Voice mode** — Web Speech API mic button, `aria-pressed` for listening state. When the bot reads aloud, a visible caption banner appears at the bottom so Deaf/HoH users see the spoken text.
- **Keyboard navigation** — all interactive elements reachable via Tab, visible focus rings (emerald outline + offset). Accessibility settings dialog auto-focuses the first toggle, traps Escape to close, returns focus to the trigger. Embed launcher closes on Escape and restores focus.
- **Reduced motion** — honors `prefers-reduced-motion: reduce` automatically, and exposes a manual toggle. Disables every animation including the chat header's pulse dot.
- **No information conveyed by color alone** — every colored badge and indicator also carries text. Skip link uses Tailwind `sr-only` / `focus:not-sr-only`.

**What we haven't done** (honest disclosure):
- No automated `axe-core` runs or manual NVDA/VoiceOver test passes. ARIA follows WCAG patterns but full WCAG 2.2 AA conformance hasn't been verified.
- Color contrast spot-checked but not exhaustively audited (the muted text on amber/sky/violet backgrounds is on the edge).
- Voice mode requires Chrome/Edge/Safari — Firefox doesn't support the Web Speech API. The button hides itself when unsupported, so text input always works as a fallback.

---

## Tech stack

- **Next.js 16** (App Router, Turbopack)
- **React 19** with strict React 19 lint rules (`set-state-in-effect`, `react-hooks/purity`)
- **TypeScript strict**
- **Tailwind CSS 4**
- **Groq SDK** (`groq-sdk` v1.2) — Llama 3.3 70B Versatile + Llama 3.1 8B Instant (free tier)
- **Zod** for request validation (Zod 4 `treeifyError`)
- **Upstash Redis** as optional persistence layer; falls back to file or memory automatically
- **Web Speech API** for browser-native voice (no external STT/TTS service)
- **No vector DB**, no database server, no extra LLM provider

---

## File map

```
src/
  agent/
    core.ts        Agent orchestrator: persona resolution + scoring + tool-use loop + salvage path
    personas.ts    3 persona definitions
    client.ts      Groq SDK singleton + model IDs
    prompts.ts     Shared prompts (debate, follow-up email)
    tools.ts       9 tool definitions and handlers + persona gating
    debate.ts      Skeptic / Closer / Resolver sub-system
    dealiq.ts      Per-persona scorer (LLM + heuristic fallback)
  app/
    page.tsx                  Marketing landing
    chat/page.tsx             Bot picker
    chat/sales/page.tsx       Sales widget
    chat/support/page.tsx     Support widget
    chat/care/page.tsx        Care widget
    embed/page.tsx            Sidebar-less widget for iframes
    embed-demo/page.tsx       Fake customer site
    accessibility/page.tsx    Accessibility commitments & feature inventory
    dashboard/page.tsx        Lead list + persona filter
    dashboard/[id]/page.tsx   Lead detail
    api/chat/route.ts         POST /api/chat
    api/leads/route.ts        GET /api/leads
    api/leads/[id]/route.ts   GET /api/leads/[id]
  components/
    ChatWidget.tsx     Stateful chat UI (persona-aware, voice-capable)
    VoiceButton.tsx    Web Speech STT + TTS toggle, ARIA-pressed, TTS captions
    DealIQGauge.tsx    Animated score ring + role=progressbar bars + sr-only live summary
    DebatePanel.tsx    Inline objection-debate display, region + headings
    A11ySettings.tsx   useSyncExternalStore-backed a11y settings + dialog
    SkipToContent.tsx  Universal "Skip to main content" link
  lib/
    types.ts           Shared TS types
    store.ts           3-tier backend lead store
public/
  embed.js             One-line embed script
scripts/
  seed-demo.ts         Populates 4 demo leads (Sales + Support + Care)
docs/
  ARCHITECTURE.md      Mermaid diagrams + per-turn sequence
  DEMO_SCRIPT.md       90-second demo storyboard
  SUBMISSION.md        Submission form cheat-sheet
```

---

## Judging-criteria alignment

| Criterion (weight) | How ClosrAI Platform delivers |
|---|---|
| **Model Innovation & Novelty (30%)** | Multi-persona agent platform with shared Skeptic-vs-Closer debate, per-persona transparent IQ scoring, browser-native voice, one-line embed. Covers 3 of 4 hackathon tracks on one runtime. |
| **Real-World Applicability (25%)** | Solves three concrete real-world problems: B2B SaaS lead qualification, technical support deflection, D2C post-purchase care. Embed.js makes it deployable on any site in one line. **Accessible to all users** — see dedicated [accessibility commitments](https://closrai-nine.vercel.app/accessibility). |
| **Technical Architecture (25%)** | Clean separation: personas as data, shared runtime, gated tool palette, 3-tier auto-falling-back store, salvage path for Groq quirks, strict TypeScript, zod-validated API, React 19 strict lint rules. |
| **Documentation Clarity (20%)** | This README, dedicated architecture doc with Mermaid diagrams, 90-second demo script, submission cheat-sheet, inline file map, ASCII architecture diagram on landing page. |

---

## License

MIT
