# 90-Second Demo Script — ClosrAI Platform

The video should be ~90–120 seconds. Shoot in 1080p, screen capture only (no webcam needed). Use OBS, Loom, or Windows Game Bar (Win+G → record).

---

## Setup before recording

1. `npm run dev` and confirm http://localhost:3000 loads.
2. Make sure `GROQ_API_KEY` is in `.env.local`.
3. Run `npm run seed` so the dashboard has 4 pre-populated leads across 3 personas.
4. Open six tabs in the same browser window:
   - Tab 1: http://localhost:3000  (landing)
   - Tab 2: http://localhost:3000/chat  (bot picker)
   - Tab 3: http://localhost:3000/chat/sales
   - Tab 4: http://localhost:3000/chat/support
   - Tab 5: http://localhost:3000/chat/care
   - Tab 6: http://localhost:3000/embed-demo
   - Tab 7: http://localhost:3000/dashboard
5. Zoom browser to ~110% so judges can read text on small screens.
6. **Allow microphone permission** in the browser if you plan to demo voice mode.

---

## Shot list (target: 90s; stretch: 120s)

### Shot 1 · Landing (0:00 – 0:08)

Voice-over:
> "ClosrAI is one AI agent platform that runs three different bots — Sales, Support, and Customer Care — on a shared runtime."

Scroll the landing page once to show the hero with the three persona cards on the right and the architecture diagram below.

### Shot 2 · Bot picker (0:08 – 0:12)

Click "Try a bot →" — opens `/chat`. Camera lingers on the three-tile picker.

> "Same agent core. Three personas."

### Shot 3 · Sales bot, qualification + debate (0:12 – 0:40)

Click the Sales SDR tile.

Type (or use voice — tap the mic button):
> *"Hey, I'm Priya, head of growth at Plyo. We're losing 8% of paying users every quarter and our success team is drowning."*

Watch:
- The **Deal IQ gauge climbs** in the right sidebar
- `🛠 enrich_company` chip appears below the reply

Voice-over:
> "Live Deal IQ scoring on the right — transparent, multi-dimensional, updating per message."

Then type:
> *"The pricing on AI sales tools is ridiculous. Not paying 2 lakh a month."*

When the response arrives, the **yellow Skeptic-vs-Closer debate panel** appears.

Voice-over:
> "Watch what happens with an objection. Two internal agents argue — Skeptic finds the real concern, Closer crafts the reframe. You see the whole debate. Then the bot sends one calm message."

### Shot 4 · Support bot (0:40 – 0:55)

Switch to the `/chat/support` tab (or click "Bot picker" from sales and go to Support).

Type:
> *"Our Segment events stopped flowing into Lumen about 6 hours ago. Health scores are stale."*

Watch:
- `🛠 search_kb` chip — the bot grounded its answer in the knowledge base
- The reply is concrete: rotate the write key

Voice-over:
> "Same debate engine, same scoring. But Support has a knowledge-base tool and an escalation tool — not meeting booking."

### Shot 5 · Customer Care bot (0:55 – 1:15)

Switch to `/chat/care`.

Type:
> *"My cast-iron skillet from order PLY-12345 arrived with a crack on the rim."*

Watch:
- `🛠 lookup_order` chip — the bot pulls the actual order details
- `🛠 escalate_to_human` chip — high priority for damage-on-arrival
- Top-right shows **"⚠ Escalated · TIX-..."**

Voice-over:
> "Care has order lookup and refund tools. The platform is one runtime; the tool palette per persona is the only thing that changes."

### Shot 6 · Voice mode (1:15 – 1:25)

Anywhere — tap the mic button next to the input.

Say out loud:
> *"What plans do you offer?"*

When the reply appears, the bot's voice reads it back.

Voice-over:
> "Voice mode is free — browser-native, no extra API key."

### Shot 7 · Embed demo (1:25 – 1:35)

Switch to `/embed-demo`.

Voice-over:
> "And here's a customer's site. The launcher in the corner is the entire integration — one script tag, one data-persona attribute."

Click the launcher. The embedded Care bot pops up over the fake Acme Wellness site.

### Shot 8 · Dashboard (1:35 – 1:50)

Switch to `/dashboard`.

Voice-over:
> "And the founder sees all three bots in one inbox."

- Show the persona filter pills (All / Sales / Support / Care)
- Click "Care" — filters to the escalated lead
- Click the escalated lead → opens detail view with order info + escalation ticket

### Shot 9 · End frame (1:50 – 1:55)

Cut to a static frame with the URL: `closrai-nine.vercel.app`

> "ClosrAI Platform. One core, three bots, four innovations."

---

## Voice-over notes

- Keep it tight — 90–120 seconds is roughly 220–290 words of voiceover.
- Don't read this script verbatim. Sound like a founder showing a product, not a student giving a viva.
- If you don't want to do voice-over, use on-screen captions (Loom and CapCut both auto-caption).

## Upload

- Upload to YouTube as **Unlisted** (NOT Private — Private requires login, which fails the hackathon's "publicly accessible" check).
- Title: `ClosrAI Platform — FlowZint AI Hackathon 2026 (Open Innovation)`
- Description: one-paragraph summary + link to https://github.com/NoumanS-20/closrai + live URL.
