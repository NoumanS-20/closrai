import Link from "next/link";
import { A11yPanelButton } from "@/components/A11ySettings";

const TILES = [
  {
    href: "/chat/sales",
    title: "Sales SDR",
    rep: "ClosrAI · Lumen Analytics",
    tag: "Sales Bot",
    accent: "from-emerald-400 to-sky-400",
    border: "border-emerald-500/30 hover:border-emerald-500/60",
    description:
      "B2B SaaS sales rep that qualifies visitors with a transparent Deal IQ, runs a Skeptic-vs-Closer debate on objections, and books meetings.",
  },
  {
    href: "/chat/support",
    title: "Support Agent",
    rep: "ClosrSupport · Lumen Analytics",
    tag: "Support Chat Bot",
    accent: "from-sky-400 to-violet-400",
    border: "border-sky-500/30 hover:border-sky-500/60",
    description:
      "Technical support agent that searches the knowledge base, handles policy pushback via internal debate, and escalates to humans cleanly.",
  },
  {
    href: "/chat/care",
    title: "Customer Care",
    rep: "PlyoCare · Plyo Mart",
    tag: "Customer Care Bot",
    accent: "from-violet-400 to-fuchsia-400",
    border: "border-violet-500/30 hover:border-violet-500/60",
    description:
      "D2C post-purchase care agent that looks up orders, processes refunds/returns within policy, and escalates damaged-goods cases with priority.",
  },
];

export default function ChatHubPage() {
  return (
    <main id="main" className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-12">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-xs text-zinc-500 hover:text-zinc-200"
          >
            ← Home
          </Link>
          <A11yPanelButton />
        </div>
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-300 border border-emerald-500/30 bg-emerald-500/5 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            ClosrAI Platform · 3 personas, one agent core
          </div>
          <h1 className="text-4xl font-semibold tracking-tight">
            Pick a bot. Try it for real.
          </h1>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            All three personas share the same agent runtime — same Skeptic-vs-Closer
            debate, same scorer architecture, same dashboard. Only the system prompt,
            scorer dimensions, and tool palette change per persona.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-4">
          {TILES.map((t) => (
            <Link
              key={t.href}
              href={t.href}
              className={`rounded-2xl border bg-zinc-950 p-5 transition-colors space-y-3 ${t.border}`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-9 h-9 rounded-xl bg-gradient-to-br ${t.accent} flex items-center justify-center text-zinc-950 font-bold text-sm`}
                >
                  {t.title[0]}
                </div>
                <span className="text-[10px] uppercase tracking-wider text-zinc-500">
                  {t.tag}
                </span>
              </div>
              <div>
                <div className="font-semibold text-zinc-100">{t.title}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{t.rep}</div>
              </div>
              <p className="text-sm text-zinc-400 leading-relaxed">{t.description}</p>
              <div className="text-xs text-zinc-300 pt-1">Open {t.title} →</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
