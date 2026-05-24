import Link from "next/link";
import { A11yPanelButton } from "@/components/A11ySettings";

export default function Home() {
  return (
    <main id="main" className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav
        aria-label="Primary"
        className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div
            aria-hidden="true"
            className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 via-sky-400 to-violet-400 flex items-center justify-center text-zinc-950 font-bold text-sm"
          >
            C
          </div>
          <span className="font-semibold tracking-tight">ClosrAI Platform</span>
          <span className="text-xs text-zinc-500 hidden sm:inline">
            · Sales · Support · Care
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <A11yPanelButton />
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
            Try a bot →
          </Link>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 pt-16 sm:pt-24 pb-16 grid lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-300 border border-emerald-500/30 bg-emerald-500/5 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            FlowZint AI Hackathon 2026 · Open Innovation
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.05]">
            One agent core.{" "}
            <span className="bg-gradient-to-r from-emerald-300 via-sky-300 to-violet-300 bg-clip-text text-transparent">
              Three bots
            </span>{" "}
            that argue with themselves before answering.
          </h1>
          <p className="text-lg text-zinc-400 max-w-xl leading-relaxed">
            ClosrAI is a multi-track AI bot platform — Sales SDR, Support Agent, and
            Customer Care, all on a shared runtime. Every persona runs the same
            internal{" "}
            <span className="text-zinc-200">Skeptic-vs-Closer debate</span> on
            objections, the same transparent{" "}
            <span className="text-zinc-200">IQ score</span> in the founder dashboard,
            and the same tool-use spine — just different prompts, scorers, and tool
            palettes.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/chat"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-medium transition-colors"
            >
              Try the 3 bots live →
            </Link>
            <Link
              href="/dashboard"
              className="px-5 py-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50 transition-colors"
            >
              Unified founder dashboard
            </Link>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-zinc-500 pt-2">
            <span>✓ Covers 3 of 4 hackathon tracks</span>
            <span>✓ Real Groq tool-use</span>
            <span>✓ Shared agent core</span>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 bg-gradient-to-br from-emerald-500/20 via-sky-500/10 to-violet-500/10 blur-3xl rounded-full" />
          <div className="relative space-y-3">
            <PersonaCard
              accent="emerald"
              tag="Sales Bot"
              title="ClosrAI"
              line="B2B SaaS SDR for Lumen Analytics. Qualifies, debates objections, books meetings."
              metric="Deal IQ"
              value={78}
              href="/chat/sales"
            />
            <PersonaCard
              accent="sky"
              tag="Support Chat Bot"
              title="ClosrSupport"
              line="Tech support for Lumen. KB-grounded answers, escalation when needed."
              metric="Resolution IQ"
              value={82}
              href="/chat/support"
            />
            <PersonaCard
              accent="violet"
              tag="Customer Care Bot"
              title="PlyoCare"
              line="D2C post-purchase care for Plyo Mart. Real order lookups, refunds within policy."
              metric="Care IQ"
              value={71}
              href="/chat/care"
            />
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-zinc-900">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="text-xs uppercase tracking-wider text-emerald-300">
            What judges have never seen in one Sales/Support/Care submission
          </div>
          <h2 className="text-3xl font-semibold tracking-tight">
            One platform, three bots, four innovations.
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <Feature
            title="Skeptic-vs-Closer debate on every objection"
            body="When a person pushes back — price, refund refusal, policy — two internal agents argue. Skeptic finds the real underlying concern; Closer crafts the reframe; a Resolver synthesizes the final message. Same mechanism works across all three bots."
          />
          <Feature
            title="Live per-persona IQ scoring"
            body="Each persona has its own 7-dimensional scorer. Sales gets Deal IQ (BANT + intent + ICP fit). Support gets Resolution IQ (KB coverage + escalation risk). Care gets Care IQ (satisfaction + loyalty risk). Same architecture; persona-specific dimensions."
          />
          <Feature
            title="Real tools, not RAG-wrapping"
            body="Nine real tools wired in: enrich_company, handle_objection, book_meeting, save_lead, draft_follow_up_email, search_kb, escalate_to_human, lookup_order, refund_request. Each persona sees only the tools that fit its job."
          />
          <Feature
            title="Unified founder console"
            body="One dashboard. Filter by Sales / Support / Care. See every transcript, every internal debate trace, every auto-drafted follow-up email, every escalation ticket — across all three bots — in one place."
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
              One <code className="text-emerald-300 font-mono text-2xl">runAgentTurn()</code>. Persona-gated tool palette.
            </h2>
            <ol className="space-y-3 text-zinc-400">
              <Step n={1} title="Visitor picks a persona at /chat">
                Same widget, same store, same dashboard. Only the persona id
                changes — and that switches the system prompt, the scorer
                prompt, and which tools are enabled.
              </Step>
              <Step n={2} title="Groq tool-use loop runs">
                Llama 3.3 70B chooses tools from the persona&rsquo;s allowed
                set. Salvage path catches the occasional{" "}
                <code className="text-emerald-300">&lt;function=…&gt;</code>{" "}
                raw-text quirk Llama emits on Groq.
              </Step>
              <Step n={3} title="Objections → debate">
                Any persona that has{" "}
                <code className="text-emerald-300">handle_objection</code>{" "}
                enabled routes pushback to Skeptic + Closer + Resolver. All
                three personas use it.
              </Step>
              <Step n={4} title="Founder sees everything in one view">
                Persona badge on every row. Filter pills at the top. Click
                through to the full transcript with the debate trace inline.
              </Step>
            </ol>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 font-mono text-xs leading-relaxed text-zinc-400 overflow-x-auto">
            <div className="text-emerald-300 mb-2">{"// architecture"}</div>
            <pre className="whitespace-pre">{`Next.js App Router
  ├── /                       Marketing landing
  ├── /chat                   Bot picker
  │   ├── /chat/sales        Sales SDR widget
  │   ├── /chat/support      Support Agent widget
  │   └── /chat/care         Customer Care widget
  ├── /dashboard              Founder console (3-persona inbox)
  └── /api/chat               Agent endpoint (POST)

Agent runtime (src/agent/)
  └── runAgentTurn(lead)
        ├── personas.ts            3 persona definitions
        ├── scoreDealIQ            persona.scorerPrompt → Llama 3.1 8B
        ├── Groq tool-use loop     persona.systemPrompt + persona.enabledTools
        │     ├── enrich_company        (Sales)
        │     ├── search_kb             (Support)
        │     ├── lookup_order          (Care)
        │     ├── refund_request        (Care)
        │     ├── handle_objection      (All 3) → debate
        │     │     ├── Skeptic           Llama 3.1 8B
        │     │     ├── Closer            Llama 3.1 8B
        │     │     └── Resolver          Llama 3.1 8B
        │     ├── escalate_to_human     (Support, Care)
        │     ├── book_meeting          (Sales)
        │     ├── save_lead             (All 3)
        │     └── draft_follow_up_email (Sales)
        └── store.upsertLead       Upstash / file / memory backend`}</pre>
          </div>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-10 border-t border-zinc-900 text-xs text-zinc-500 flex flex-wrap items-center justify-between gap-3">
        <div>ClosrAI Platform · FlowZint AI Hackathon 2026 · Open Innovation</div>
        <div className="flex gap-4">
          <Link href="/chat" className="hover:text-zinc-300">
            Bot picker
          </Link>
          <Link href="/dashboard" className="hover:text-zinc-300">
            Dashboard
          </Link>
        </div>
      </footer>
    </main>
  );
}

const ACCENT: Record<"emerald" | "sky" | "violet", { border: string; chip: string; text: string; bg: string; grad: string }> = {
  emerald: {
    border: "border-emerald-500/30",
    chip: "text-emerald-300",
    text: "text-emerald-300",
    bg: "bg-emerald-500/5",
    grad: "from-emerald-400 to-sky-400",
  },
  sky: {
    border: "border-sky-500/30",
    chip: "text-sky-300",
    text: "text-sky-300",
    bg: "bg-sky-500/5",
    grad: "from-sky-400 to-violet-400",
  },
  violet: {
    border: "border-violet-500/30",
    chip: "text-violet-300",
    text: "text-violet-300",
    bg: "bg-violet-500/5",
    grad: "from-violet-400 to-fuchsia-400",
  },
};

function PersonaCard({
  accent,
  tag,
  title,
  line,
  metric,
  value,
  href,
}: {
  accent: "emerald" | "sky" | "violet";
  tag: string;
  title: string;
  line: string;
  metric: string;
  value: number;
  href: string;
}) {
  const a = ACCENT[accent];
  return (
    <Link
      href={href}
      className={`block rounded-2xl border ${a.border} ${a.bg} backdrop-blur p-4 transition-all hover:scale-[1.01]`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.grad} flex items-center justify-center text-zinc-950 font-bold`}
        >
          {title[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-semibold text-zinc-100">{title}</div>
            <span className={`text-[10px] uppercase tracking-wider ${a.text}`}>
              {tag}
            </span>
          </div>
          <p className="text-xs text-zinc-400 truncate">{line}</p>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-semibold tabular-nums ${a.text}`}>
            {value}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-zinc-500">
            {metric}
          </div>
        </div>
      </div>
    </Link>
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
