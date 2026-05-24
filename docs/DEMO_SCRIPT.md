# 90-Second Demo Script — ClosrAI

The video should be ~90 seconds. Shoot in 1080p, screen capture only (no webcam needed). Use OBS, Loom, or Windows Game Bar (Win+G → record).

---

## Setup before recording

1. `npm run dev` and confirm http://localhost:3000 loads.
2. Make sure `GROQ_API_KEY` is in `.env.local`.
3. Delete `data/leads.json` so the dashboard starts empty.
4. Open three tabs in the same browser window:
   - Tab 1: http://localhost:3000  (landing)
   - Tab 2: http://localhost:3000/chat (visitor view)
   - Tab 3: http://localhost:3000/dashboard (founder view)
5. Zoom browser to ~110% so judges can read text on small screens.

---

## Shot list

### Shot 1 · Landing (0:00 – 0:10)

> "ClosrAI is an AI sales rep for B2B SaaS. It does three things no other sales bot does. Let me show you."

Scroll the landing page once to show the hero and the architecture diagram.

### Shot 2 · Open the chat (0:10 – 0:15)

Click "Try the bot →" — opens `/chat`. ClosrAI greets the visitor.

### Shot 3 · Qualifying turn (0:15 – 0:35)

Type as the visitor (you):

> *"Hey, I'm Priya, head of growth at Plyo. We're losing about 8% of our paying users every quarter and our success team is drowning. Worth a chat?"*

Wait for ClosrAI's response. Watch:
- The **Deal IQ gauge climbs** in the right sidebar (target: 60s+).
- A `🛠 enrich_company` chip might appear if it picked up the company name.
- The reply asks one focused follow-up.

> Voice-over: "Notice the Deal IQ score on the right — that's a transparent, multi-dimensional lead score updating per message."

### Shot 4 · Drop an objection (0:35 – 0:55)

Type:

> *"Honestly the pricing on AI sales tools has gotten ridiculous. We're not going to spend ₹2 lakh a month on this."*

This triggers **`handle_objection`** → debate.

The chat will show a yellow **"Internal debate · objection routed"** panel with the Skeptic and Closer columns, followed by ClosrAI's final reply.

> Voice-over: "Watch what happens with an objection. Two internal agents argue — Skeptic finds the real concern, Closer crafts the reframe. You see the whole debate. Then ClosrAI sends one calm message."

### Shot 5 · Book a meeting (0:55 – 1:10)

Type:

> *"OK fine, I'm intrigued. Send me a 20-min slot for tomorrow afternoon. priya@plyo.io."*

Wait for the response. ClosrAI calls `book_meeting`. The top-right of the chat shows **"✓ Meeting booked · MEET-XXXX"**.

### Shot 6 · Switch to dashboard (1:10 – 1:30)

Switch to Tab 3 (`/dashboard`). Refresh.

> Voice-over: "The founder sees this in real time."

- Show the stats row updating (1 lead, 1 qualified, 1 meeting booked, avg Deal IQ).
- Click the lead row → opens `/dashboard/[id]`.
- Show the full transcript with the debate panel visible.
- Scroll to the **auto-drafted follow-up email** in the emerald box.

> Voice-over: "Transcript, debate trace, Deal IQ breakdown, and a personalized follow-up email the founder can just send. That's ClosrAI."

### Final beat (1:30 – 1:35)

Cut to a static frame with the URL: `closrai.vercel.app` (or wherever you deploy).

---

## Voice-over notes

- Keep the script tight — 90 seconds is roughly 220–230 words of voiceover at a natural pace.
- Don't read this script verbatim. Sound like a founder showing a product, not a student giving a viva.
- If you don't want to do voice-over, use on-screen captions (Loom and CapCut both auto-caption).

## Upload

- Upload to YouTube as **unlisted** (not private — private won't pass the "publicly accessible" check on the submission form).
- Title: `ClosrAI — FlowZint AI Hackathon 2026 (Sales Bot)`
- Description: one-paragraph summary + GitHub repo link.
