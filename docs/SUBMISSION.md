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

## Project Description (≥50 words — this one is ~150)

```
ClosrAI Platform is a multi-track AI bot runtime that ships three production-grade
bots from a single agent core: a B2B SaaS Sales SDR, a knowledge-base-grounded
Support Agent, and a D2C Customer Care agent. All three share one runAgentTurn(),
one Skeptic-vs-Closer multi-agent debate sub-system for handling objections, and
one transparent per-persona IQ scorer (Deal IQ for Sales, Resolution IQ for
Support, Care IQ for Care) streamed live to a unified founder dashboard. The
platform ships with nine real tools (gated per persona), browser-native voice
mode using the Web Speech API, and a one-line script-tag embed that drops a
configured bot onto any third-party website. Built on Next.js 16, Groq's free
tier (Llama 3.3 70B + 3.1 8B), and Tailwind 4, with three-tier auto-falling-back
persistence (Upstash → file → memory) and graceful no-key degradation.
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
