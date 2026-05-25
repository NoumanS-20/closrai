# Submission Form Cheat-Sheet — flowzint.in/2026/ai/hackothon

Use these exact values when filling the submission portal.

---

## Project Title

```
ClosrAI Platform — one agent core, three bots that argue with themselves
```

## Technical Domain Track

```
Open Innovation
```

(Rationale: the submission covers Sales Bot + Support Chat Bot + Customer Care Bot tracks on a single shared agent runtime — the platform itself is the innovation. Submitting under any single bot track would underrepresent the work.)

## Project Description (≥50 words — this one is ~170)

```
ClosrAI Platform is a multi-track AI bot runtime that ships three production-grade
bots from one shared agent core: a B2B SaaS Sales SDR, a knowledge-base-grounded
Support Agent, and a D2C Customer Care agent. All three share one runAgentTurn(),
one Skeptic-vs-Closer multi-agent debate sub-system that handles every objection
with explainable internal reasoning, and one transparent per-persona IQ scorer
(Deal IQ, Resolution IQ, Care IQ) streamed live to a unified founder dashboard.
Nine real tools gated per persona — live company enrichment, KB search, order
lookup, refund processing, calendar booking, human escalation, follow-up email
drafting. Browser-native voice mode with engine priming, emoji sanitization, and
cancel-on-click. One-line script-tag embed with a live persona switcher and
clean SPA teardown. Built-in accessibility: five-toggle settings panel, ARIA
live regions, skip-to-content, OS reduced-motion detection. Next.js 16, Groq's
free tier (Llama 3.3 70B + 3.1 8B), Upstash Redis persistence, warm Apple-style
design language with hand-rendered 3D CSS orbs.
```

## Required links

- **Demo Video Link** — YouTube *unlisted* URL (see `DEMO_SCRIPT.md`).
- **Source Code Repository** — `https://github.com/NoumanS-20/closrai`
- **Live Project URL** — `https://closrai-nine.vercel.app`

---

## Pre-submission checklist

- [ ] GitHub repo is **public** (not private — auto-rejects on private).
- [ ] Demo video link plays in an incognito window without auth.
- [ ] Live Vercel URL is reachable and `/chat`, `/chat/sales`, `/chat/support`, `/chat/care`, `/dashboard`, `/embed-demo` all return 200.
- [ ] `GROQ_API_KEY` env var is set in Vercel project settings.
- [ ] README.md is the first thing visible on the GitHub repo.
- [ ] Project description in the form is ≥50 words and is **not** gibberish.
- [ ] All form fields filled — team leader, email, phone, college/org.
- [ ] Submitted before **27 May 2026, 23:59 IST**.

## Key URLs to verify before submitting

```
https://closrai-nine.vercel.app/                  # landing
https://closrai-nine.vercel.app/chat              # bot picker
https://closrai-nine.vercel.app/chat/sales        # sales widget
https://closrai-nine.vercel.app/chat/support      # support widget
https://closrai-nine.vercel.app/chat/care         # care widget
https://closrai-nine.vercel.app/dashboard         # founder dashboard
https://closrai-nine.vercel.app/embed-demo        # third-party site demo
https://github.com/NoumanS-20/closrai             # source code
```
