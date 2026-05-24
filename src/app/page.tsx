import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-sky-400 flex items-center justify-center text-zinc-950 font-bold text-sm">
            C
          </div>
          <span className="font-semibold tracking-tight">ClosrAI</span>
          <span className="text-xs text-zinc-500 hidden sm:inline">
            by Lumen Analytics
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard"
            className="text-sm text-zinc-300 hover:text-zinc-100 px-3 py-1.5"
          >
            Founder dashboard
          </Link>
          <Link
            href="/chat"
            className="text-sm bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium px-3 py-1.5 rounded-lg transition-colors"
          >
            Try the bot →
          </Link>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 pt-16 sm:pt-24 pb-16 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-300 border border-emerald-500/30 bg-emerald-500/5 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            FlowZint AI Hackathon 2026 · Sales Bot Track
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
            The AI sales rep that{" "}
            <span className="bg-gradient-to-r from-emerald-300 to-sky-300 bg-clip-text text-transparent">
              argues with itself
            </span>{" "}
            before answering your prospect.
          </h1>
          <p className="text-lg text-zinc-400 max-w-xl leading-relaxed">
            ClosrAI lives on your pricing page, qualifies B2B visitors in real
            time, runs an internal{" "}
            <span className="text-zinc-200">Skeptic-vs-Closer debate</span> on
            every objection, and books meetings — with a transparent{" "}
            <span className="text-zinc-200">Deal IQ score</span> founders can
            actually trust.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/chat"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium transition-colors"
            >
              Try ClosrAI live →
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50 transition-colors"
            >
              See founder dashboard
            </Link>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-zinc-500 pt-2">
            <span>✓ No signup needed</span>
            <span>✓ Real Groq tool-use</span>
            <span>✓ Live transparent scoring</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-br from-emerald-500/20 to-sky-500/10 blur-3xl rounded-full" />
          <div className="relative rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider text-zinc-500">
                Live Deal IQ
              </div>
              <div className="text-xs text-emerald-300">Streaming</div>
            </div>
            <div className="flex items-center gap-5">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 100 100" className="-rotate-90">
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    stroke="rgb(39 39 42)"
                    strokeWidth="8"
                    fill="transparent"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="44"
                    stroke="url(#g1)"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={2 * Math.PI * 44}
                    strokeDashoffset={2 * Math.PI * 44 * (1 - 0.78)}
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#38bdf8" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-2xl font-semibold text-emerald-300">
                  78
                </div>
              </div>
              <div className="flex-1 space-y-1.5 text-xs">
                {[
                  ["Need", 85],
                  ["Intent", 80],
                  ["ICP Fit", 90],
                  ["Authority", 70],
                  ["Timing", 65],
                ].map(([label, val]) => (
                  <div key={label as string} className="flex items-center gap-2">
                    <span className="w-14 text-zinc-400">{label}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-sky-400"
                        style={{ width: `${val as number}%` }}
                      />
                    </div>
                    <span className="w-7 text-right text-zinc-300 tabular-nums">
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-xs italic text-zinc-500 pt-1">
              &ldquo;Strong ICP fit + explicit churn pain. Push for demo.&rdquo;
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-zinc-900">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="text-xs uppercase tracking-wider text-emerald-300">
            What makes it different
          </div>
          <h2 className="text-3xl font-semibold tracking-tight">
            Three things judges have never seen in a sales bot.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Feature
            title="Live Deal IQ scoring"
            body="A transparent BANT + intent + sentiment + ICP-fit score updates per message — visible to the founder in real time, with a one-line rationale for every shift."
          />
          <Feature
            title="Skeptic-vs-Closer debate"
            body="When a visitor objects, two internal agents argue: the Skeptic surfaces the real underlying concern, the Closer crafts the reframe. You see the full debate in the transcript."
          />
          <Feature
            title="Tool-using SDR"
            body="ClosrAI calls live tools: enriches the prospect's company from their website, books a meeting, writes the lead to CRM, and auto-drafts a personalized founder follow-up email."
          />
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-zinc-900">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-4">
            <div className="text-xs uppercase tracking-wider text-emerald-300">
              How it works
            </div>
            <h2 className="text-3xl font-semibold tracking-tight">
              One agent loop. Five real tools. Two-agent debate when it counts.
            </h2>
            <ol className="space-y-3 text-zinc-400">
              <Step n={1} title="Visitor lands on /chat">
                The widget greets them and starts qualifying with one focused
                question at a time.
              </Step>
              <Step n={2} title="Groq tool-use loop runs">
                The agent calls{" "}
                <code className="text-emerald-300">enrich_company</code> on the
                visitor&rsquo;s domain, then chains{" "}
                <code className="text-emerald-300">save_lead</code> and{" "}
                <code className="text-emerald-300">book_meeting</code> as
                context warrants.
              </Step>
              <Step n={3} title="Objection? Debate fires">
                The agent calls{" "}
                <code className="text-emerald-300">handle_objection</code>,
                which spawns Skeptic + Closer + Resolver to produce the actual
                reply.
              </Step>
              <Step n={4} title="Founder gets a hot lead">
                CRM row + transcript + Deal IQ + auto-drafted follow-up email
                land in the dashboard, ready to send.
              </Step>
            </ol>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 font-mono text-xs leading-relaxed text-zinc-400 overflow-x-auto">
            <div className="text-emerald-300 mb-2">{"// architecture"}</div>
            <pre className="whitespace-pre">{`Next.js App Router
  └── /chat                  Visitor-facing widget
  └── /dashboard             Founder console
  └── /api/chat              Agent endpoint
        └── runAgentTurn()
              ├── scoreDealIQ()         Llama 3.1 8B · BANT+ICP scorer
              ├── Groq tool-use loop    Llama 3.3 70B · 5 tools, ≤5 rounds
              │     ├── enrich_company        Live web fetch
              │     ├── handle_objection      → debate
              │     │     ├── Skeptic         Llama 3.1 8B
              │     │     ├── Closer          Llama 3.1 8B
              │     │     └── Resolver        Llama 3.1 8B
              │     ├── book_meeting          Mock calendar
              │     ├── save_lead             JSON CRM
              │     └── draft_follow_up_email Llama 3.3 70B
              └── upsertLead()          JSON store`}</pre>
          </div>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-10 border-t border-zinc-900 text-xs text-zinc-500 flex flex-wrap items-center justify-between gap-3">
        <div>ClosrAI · FlowZint AI Hackathon 2026 · Sales Bot Track</div>
        <div className="flex gap-4">
          <Link href="/chat" className="hover:text-zinc-300">
            Try the bot
          </Link>
          <Link href="/dashboard" className="hover:text-zinc-300">
            Founder dashboard
          </Link>
        </div>
      </footer>
    </main>
  );
}

function Feature({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 hover:border-zinc-700 transition-colors">
      <h3 className="font-semibold text-zinc-100 mb-2">{title}</h3>
      <p className="text-sm text-zinc-400 leading-relaxed">{body}</p>
    </div>
  );
}

function Step({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <li className="flex gap-3">
      <span className="shrink-0 w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center">
        {n}
      </span>
      <div className="space-y-1">
        <div className="text-zinc-100 font-medium">{title}</div>
        <div className="text-sm leading-relaxed">{children}</div>
      </div>
    </li>
  );
}
