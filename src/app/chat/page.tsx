import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Orb, OrbFace, type OrbKind } from "@/components/Orb";

interface Tile {
  href: string;
  kind: OrbKind;
  tag: string;
  title: string;
  rep: string;
  description: string;
}

const TILES: Tile[] = [
  {
    href: "/chat/sales",
    kind: "sales",
    tag: "Sales Bot",
    title: "Sales SDR",
    rep: "ClosrAI · Lumen Analytics",
    description:
      "B2B SaaS sales rep that qualifies visitors with a transparent Deal IQ, runs a Skeptic-vs-Closer debate on objections, and books meetings.",
  },
  {
    href: "/chat/support",
    kind: "support",
    tag: "Support Chat Bot",
    title: "Support Agent",
    rep: "ClosrSupport · Lumen Analytics",
    description:
      "Technical support agent that searches the knowledge base, handles policy pushback via internal debate, and escalates to humans cleanly.",
  },
  {
    href: "/chat/care",
    kind: "care",
    tag: "Customer Care Bot",
    title: "Customer Care",
    rep: "PlyoCare · Plyo Mart",
    description:
      "D2C post-purchase care agent that looks up orders, processes refunds within 14-day policy, and escalates damaged-goods cases with priority.",
  },
];

export default function ChatHubPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="chat-hub">
        <div className="shell chat-hub__inner">
          <header className="chat-hub__head">
            <p className="eyebrow">Live demos</p>
            <h1>Pick a bot. Try it for real.</h1>
            <p>
              All three personas share the same agent runtime — same
              Skeptic-vs-Closer debate, same scorer architecture, same dashboard.
              Only the system prompt, scorer dimensions, and tool palette change
              per persona.
            </p>
          </header>

          <div className="chat-hub__grid">
            {TILES.map((t) => (
              <Link key={t.href} href={t.href} className="hub-tile">
                <div className="hub-tile__orb" aria-hidden="true">
                  <Orb kind={t.kind} size={120} float={false} idle />
                  <OrbFace size={120} />
                </div>
                <span className="hub-tile__tag eyebrow">{t.tag}</span>
                <h2>{t.title}</h2>
                <p className="hub-tile__rep">{t.rep}</p>
                <p className="hub-tile__desc">{t.description}</p>
                <span className="linklike">
                  Open {t.title} <span aria-hidden="true">›</span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <style>{`
          .chat-hub { padding: 64px 0 120px; }
          .chat-hub__head {
            text-align: center;
            max-width: 720px;
            margin: 0 auto 56px;
          }
          .chat-hub__head h1 {
            font-size: clamp(2.4rem, 4.8vw, 3.6rem);
            font-weight: 600;
            letter-spacing: -0.04em;
            line-height: 1.05;
            margin: 10px 0 14px;
          }
          .chat-hub__head p {
            color: var(--ink-soft);
            font-size: 1.1rem;
            line-height: 1.4;
            margin: 0;
          }
          .chat-hub__grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 18px;
          }
          @media (max-width: 980px) {
            .chat-hub__grid { grid-template-columns: 1fr; }
          }
          .hub-tile {
            background: var(--surface);
            border: 1px solid var(--line-soft);
            border-radius: var(--radius-lg);
            padding: 28px 24px;
            display: flex; flex-direction: column;
            gap: 6px;
            color: var(--ink);
            box-shadow: var(--shadow-soft);
            transition: transform var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease);
            text-decoration: none;
          }
          .hub-tile:hover { transform: translateY(-2px); box-shadow: var(--shadow-lift); text-decoration: none; }
          .hub-tile__orb {
            position: relative;
            width: 120px; height: 120px;
            margin: 0 auto 10px;
          }
          .hub-tile__tag {
            font-size: 0.7rem;
          }
          .hub-tile h2 {
            font-size: 1.5rem;
            margin: 6px 0 2px;
          }
          .hub-tile__rep {
            color: var(--ink-mute);
            font-size: 0.85rem;
            margin: 0 0 6px;
          }
          .hub-tile__desc {
            color: var(--ink-soft);
            font-size: 0.95rem;
            line-height: 1.4;
            margin: 0 0 14px;
            flex: 1;
          }
          .hub-tile .linklike {
            margin-top: auto;
            font-size: 0.95rem;
          }
        `}</style>
      </main>
    </>
  );
}
