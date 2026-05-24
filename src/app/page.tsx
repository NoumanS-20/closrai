import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { Orb, OrbFace, type OrbKind } from "@/components/Orb";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="landing">
        {/* HERO -------------------------------------------------- */}
        <section className="hero" aria-labelledby="hero-h">
          <div className="hero__inner">
            <p className="hero__eyebrow">ClosrAI</p>
            <h1 id="hero-h" className="hero__title">
              Three bots.
              <br />
              Made for everyone.
            </h1>
            <p className="hero__sub">
              Conversational AI for sales, support, and care — designed with
              accessibility built in from the first pixel.
            </p>
            <div className="hero__ctas">
              <Link href="/chat" className="linklike">
                See the bots <span aria-hidden="true">›</span>
              </Link>
              <Link href="/accessibility" className="linklike">
                Accessibility statement <span aria-hidden="true">›</span>
              </Link>
            </div>

            <div className="hero__stage" aria-hidden="true">
              <div className="hero__plinth" />
              <div className="hero__orb">
                <Orb kind="sales" size={360} float={false} idle />
                <OrbFace size={360} />
              </div>
            </div>
          </div>
        </section>

        <ProductTile
          kind="sales"
          eyebrow="Sales Bot"
          title={
            <>
              Close more,
              <br />
              without sounding like a bot.
            </>
          }
          sub="Qualifies leads in real time. Books meetings. Scores every conversation with Deal IQ."
          theme="light"
          href="/chat/sales"
        />

        <ProductTile
          kind="support"
          eyebrow="Support Chat Bot"
          title={
            <>
              Instant answers.
              <br />
              Patience built in.
            </>
          }
          sub="Pulls from your docs. Triages tickets. Hands off to humans with full context."
          theme="dark"
          href="/chat/support"
        />

        <ProductTile
          kind="care"
          eyebrow="Customer Care Bot"
          title={
            <>
              Resolve. Retain.
              <br />
              Build trust.
            </>
          }
          sub="Empathic conversations for billing, account, and retention — with live sentiment tracking."
          theme="light"
          href="/chat/care"
        />

        {/* BENTO ------------------------------------------------- */}
        <section className="bento" aria-labelledby="bento-h">
          <header className="section-head">
            <p className="section-eyebrow">Built in</p>
            <h2 id="bento-h">Things that come standard.</h2>
          </header>

          <div className="bento__grid">
            <article className="bento__tile bento__tile--lg bento__tile--dark">
              <div className="bento__copy">
                <h3>Accessibility, foundational.</h3>
                <p>
                  Five toggles in every header. WCAG 2.2 AA targets, polite live
                  regions, skip-to-content, focus rings, and OS preference
                  detection.
                </p>
                <Link href="/accessibility" className="linklike linklike--on-dark">
                  Read the statement <span aria-hidden="true">›</span>
                </Link>
              </div>
              <div className="bento__visual" aria-hidden="true">
                <A11yPreview />
              </div>
            </article>

            <article className="bento__tile">
              <div className="bento__copy">
                <h3>Deal IQ scoring.</h3>
                <p>
                  A live read on every conversation. Intent, budget, authority,
                  urgency — narrated by aria-live so nothing is invisible.
                </p>
              </div>
              <div className="bento__visual" aria-hidden="true">
                <RingPreview />
              </div>
            </article>

            <article className="bento__tile">
              <div className="bento__copy">
                <h3>Voice in, captions out.</h3>
                <p>
                  Speak to it. Read what it says back. The transcript is the
                  caption — deaf-friendly without a duplicate overlay.
                </p>
              </div>
              <div className="bento__visual" aria-hidden="true">
                <CaptionPreview />
              </div>
            </article>

            <article className="bento__tile bento__tile--lg">
              <div className="bento__copy">
                <h3>One script tag. Anywhere.</h3>
                <p>
                  Drop the embed launcher on your site. Role-dialog, aria-expanded,
                  Esc to close, focus restored to launcher.
                </p>
                <Link href="/embed-demo" className="linklike">
                  See the embed demo <span aria-hidden="true">›</span>
                </Link>
              </div>
              <div className="bento__visual bento__visual--right" aria-hidden="true">
                <EmbedPreview />
              </div>
            </article>
          </div>
        </section>

        {/* CLOSER ------------------------------------------------ */}
        <section className="closer" aria-labelledby="closer-h">
          <h2 id="closer-h">Start a conversation.</h2>
          <p>
            Pick a bot. Try a real demo. Toggle every accessibility setting along
            the way.
          </p>
          <div className="closer__ctas">
            <Link href="/chat" className="btn btn--primary">
              Meet the bots
            </Link>
            <Link href="/dashboard" className="linklike">
              See the dashboard <span aria-hidden="true">›</span>
            </Link>
          </div>
        </section>

        <footer className="foot">
          <div>
            <p>© 2026 ClosrAI · FlowZint AI Hackathon</p>
            <p>
              <Link href="/accessibility">Accessibility</Link> ·{" "}
              <Link href="/dashboard">Dashboard</Link> ·{" "}
              <Link href="/embed-demo">Embed demo</Link>
            </p>
          </div>
        </footer>
      </main>

      <style>{`
        .landing { padding-bottom: 0; }

        .section-head { text-align: center; margin: 0 auto 64px; max-width: 720px; }
        .section-eyebrow {
          font-size: 0.85rem;
          font-weight: 500;
          color: oklch(0.45 0.14 252);
          margin: 0 0 12px;
          letter-spacing: -0.005em;
        }
        .section-head h2 {
          font-size: clamp(2.6rem, 5.2vw, 4.4rem);
          font-weight: 600;
          letter-spacing: -0.04em;
          line-height: 1.05;
        }

        /* HERO */
        .hero {
          padding: 64px 22px 0;
          text-align: center;
          background: var(--bg);
        }
        .hero__inner { max-width: 980px; margin: 0 auto; }
        .hero__eyebrow {
          font-size: 1rem;
          font-weight: 500;
          color: var(--ink);
          margin: 0 0 14px;
          letter-spacing: -0.005em;
        }
        .hero__title {
          font-size: clamp(3.4rem, 8vw, 6.6rem);
          font-weight: 600;
          letter-spacing: -0.045em;
          line-height: 0.98;
          margin: 0 0 22px;
          color: var(--ink);
        }
        .hero__sub {
          font-size: clamp(1.15rem, 1.8vw, 1.5rem);
          color: var(--ink-soft);
          max-width: 680px;
          margin: 0 auto 22px;
          line-height: 1.3;
          letter-spacing: -0.012em;
          font-weight: 400;
        }
        .hero__ctas {
          display: inline-flex; gap: 28px;
          margin-bottom: 36px;
          font-size: 1.1rem;
        }
        .hero__ctas .linklike { font-size: 1.1rem; }
        .hero__stage {
          position: relative;
          margin: 20px auto 0;
          width: min(720px, 100%);
          aspect-ratio: 16/9;
          display: grid; place-items: center;
        }
        .hero__plinth {
          position: absolute;
          bottom: 18%; left: 50%;
          transform: translateX(-50%);
          width: 60%; height: 26px;
          background: radial-gradient(ellipse at center, rgba(0,0,0,.28), transparent 70%);
          filter: blur(14px);
        }
        .hero__orb {
          position: relative;
          transform: translateY(-6%);
        }

        /* CLOSER */
        .closer {
          padding: 140px 22px;
          text-align: center;
          background: var(--bg);
        }
        .closer h2 {
          font-size: clamp(2.6rem, 5.2vw, 4rem);
          font-weight: 600;
          letter-spacing: -0.04em;
          margin: 0 0 14px;
        }
        .closer p {
          color: var(--ink-soft);
          font-size: 1.2rem;
          max-width: 540px;
          margin: 0 auto 28px;
        }
        .closer__ctas {
          display: inline-flex; gap: 22px;
          align-items: center;
          flex-wrap: wrap;
          justify-content: center;
        }

        /* BENTO */
        .bento {
          padding: 120px 22px;
          background: oklch(0.95 0.004 70);
        }
        .bento__grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 2fr 1fr;
          grid-auto-rows: minmax(280px, auto);
          gap: 14px;
        }
        .bento__tile {
          background: var(--surface);
          border-radius: 24px;
          padding: 32px;
          display: grid;
          grid-template-rows: auto 1fr;
          gap: 18px;
          overflow: hidden;
          position: relative;
        }
        .bento__tile:first-child { grid-row: span 2; }
        .bento__tile:nth-child(4) { grid-column: span 2; grid-template-columns: 1fr 1fr; grid-template-rows: auto; }
        .bento__tile--dark { background: oklch(0.13 0.005 60); color: oklch(0.95 0.005 60); }
        .bento__tile--dark h3, .bento__tile--dark p { color: inherit; }
        .bento__tile--dark p { color: oklch(0.75 0.005 60); }

        .bento__copy h3 {
          font-size: clamp(1.4rem, 2.4vw, 1.9rem);
          font-weight: 600;
          letter-spacing: -0.025em;
          margin: 0 0 8px;
        }
        .bento__copy p { color: var(--ink-soft); margin: 0 0 12px; max-width: 36ch; }
        .bento__visual { display: grid; place-items: center; min-height: 160px; }
        .bento__visual--right { justify-self: end; align-self: center; }

        @media (max-width: 820px) {
          .bento__grid { grid-template-columns: 1fr; }
          .bento__tile:first-child { grid-row: auto; }
          .bento__tile:nth-child(4) { grid-column: auto; grid-template-columns: 1fr; }
        }
        @media (max-width: 520px) {
          .hero {
            padding-top: 56px;
          }
          .hero__title {
            font-size: clamp(2.8rem, 14vw, 3.8rem);
          }
          .hero__ctas {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            margin-bottom: 28px;
          }
          .hero__ctas .linklike {
            font-size: 1rem;
          }
        }

        /* FOOTER */
        .foot {
          padding: 22px;
          background: var(--bg);
          border-top: 1px solid color-mix(in oklab, var(--ink) 8%, transparent);
        }
        .foot > div {
          max-width: 1024px;
          margin: 0 auto;
          display: flex; justify-content: space-between; flex-wrap: wrap;
          color: var(--ink-mute);
          font-size: 0.78rem;
          gap: 10px;
        }
        .foot p { margin: 0; }
        .foot a { color: var(--ink-mute); }
        .foot a:hover { color: var(--ink); }
      `}</style>
    </>
  );
}

interface ProductTileProps {
  kind: OrbKind;
  eyebrow: string;
  title: React.ReactNode;
  sub: string;
  theme: "light" | "dark";
  href: string;
}

function ProductTile({ kind, eyebrow, title, sub, theme, href }: ProductTileProps) {
  return (
    <section className={"ptile ptile--" + theme} aria-label={eyebrow}>
      <div className="ptile__inner">
        <p className="ptile__eyebrow">{eyebrow}</p>
        <h2 className="ptile__title">{title}</h2>
        <p className="ptile__sub">{sub}</p>
        <div className="ptile__ctas">
          <Link href={href} className="linklike">
            Try the demo <span aria-hidden="true">›</span>
          </Link>
          <Link href={href} className="linklike">
            Learn more <span aria-hidden="true">›</span>
          </Link>
        </div>

        <div className="ptile__stage" aria-hidden="true">
          <div className="ptile__plinth" />
          <Orb kind={kind} size={320} float={false} idle />
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
            }}
          >
            <OrbFace size={320} />
          </div>
        </div>
      </div>

      <style>{`
        .ptile {
          padding: 100px 22px 0;
          text-align: center;
        }
        .ptile--light {
          background: var(--bg);
          color: var(--ink);
        }
        .ptile--dark {
          background: oklch(0.10 0.005 60);
          color: oklch(0.96 0.005 60);
        }
        .ptile--dark .ptile__sub { color: oklch(0.75 0.005 60); }
        .ptile--dark .linklike { color: oklch(0.75 0.14 252); }
        .ptile__inner {
          max-width: 980px; margin: 0 auto;
        }
        .ptile__eyebrow {
          font-size: 0.95rem;
          font-weight: 500;
          margin: 0 0 12px;
          color: inherit;
          opacity: .8;
        }
        .ptile__title {
          font-size: clamp(2.6rem, 6vw, 5rem);
          font-weight: 600;
          letter-spacing: -0.04em;
          line-height: 1.0;
          margin: 0 0 22px;
        }
        .ptile__sub {
          font-size: clamp(1.1rem, 1.6vw, 1.35rem);
          line-height: 1.35;
          max-width: 600px;
          margin: 0 auto 22px;
          letter-spacing: -0.01em;
        }
        .ptile__ctas {
          display: inline-flex; gap: 28px;
          font-size: 1.05rem;
          margin-bottom: 16px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .ptile__stage {
          position: relative;
          margin: 28px auto 0;
          width: min(640px, 100%);
          aspect-ratio: 16/10;
          display: grid; place-items: center;
        }
        .ptile__plinth {
          position: absolute;
          bottom: 14%; left: 50%;
          transform: translateX(-50%);
          width: 60%; height: 22px;
          background: radial-gradient(ellipse at center, rgba(0,0,0,.32), transparent 70%);
          filter: blur(12px);
        }
      `}</style>
    </section>
  );
}

function A11yPreview() {
  const rows = [
    "High contrast",
    "Larger text",
    "Dyslexia font",
    "Reduce motion",
    "Underline links",
  ];
  return (
    <div className="a11y-prev">
      {rows.map((label, i) => (
        <div key={label} className="a11y-prev__row">
          <span>{label}</span>
          <span className={"a11y-prev__sw" + (i % 2 === 0 ? " is-on" : "")}>
            <i />
          </span>
        </div>
      ))}
      <style>{`
        .a11y-prev {
          width: 100%; max-width: 280px;
          background: oklch(0.18 0.005 60);
          border-radius: 18px;
          padding: 14px;
          display: flex; flex-direction: column; gap: 4px;
        }
        .a11y-prev__row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 8px 4px;
          font-size: 0.82rem;
          color: oklch(0.92 0.005 60);
          border-top: 1px solid oklch(0.25 0.005 60);
        }
        .a11y-prev__row:first-child { border-top: 0; }
        .a11y-prev__sw {
          width: 34px; height: 20px; border-radius: 999px;
          background: oklch(0.32 0.005 60);
          position: relative; transition: background .2s;
          display: inline-block;
        }
        .a11y-prev__sw i {
          position: absolute; top: 3px; left: 3px;
          width: 14px; height: 14px; border-radius: 50%;
          background: white;
          transition: left .2s;
        }
        .a11y-prev__sw.is-on { background: oklch(0.55 0.18 252); }
        .a11y-prev__sw.is-on i { left: 17px; }
      `}</style>
    </div>
  );
}

function RingPreview() {
  const c = 2 * Math.PI * 40;
  return (
    <div style={{ position: "relative", width: 130, height: 130 }}>
      <svg width="130" height="130" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="40" fill="none" stroke="oklch(0.92 0.004 70)" strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="oklch(0.55 0.16 32)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * 0.27}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          fontFamily: "var(--font-display)",
          fontWeight: 600,
          fontSize: "1.9rem",
          letterSpacing: "-0.03em",
        }}
      >
        73
      </div>
    </div>
  );
}

function CaptionPreview() {
  return (
    <div
      style={{
        background: "oklch(0.13 0.005 60)",
        color: "oklch(0.96 0.005 60)",
        padding: "12px 18px",
        borderRadius: 999,
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        fontSize: "0.88rem",
        maxWidth: "100%",
        boxShadow: "0 10px 28px -10px rgba(0,0,0,.3)",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "oklch(0.78 0.16 80)",
        }}
      />
      <span>&ldquo;Sure, here are our plans…&rdquo;</span>
    </div>
  );
}

function EmbedPreview() {
  return (
    <div
      style={{
        width: 140,
        height: 140,
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 30% 25%, oklch(0.78 0.16 50), oklch(0.50 0.20 30))",
        boxShadow:
          "0 28px 60px -20px oklch(0.50 0.20 30 / 0.5), inset 0 -8px 16px rgba(0,0,0,.22), inset 0 6px 14px rgba(255,255,255,.3)",
        display: "grid",
        placeItems: "center",
        color: "white",
      }}
    >
      <svg width="44" height="44" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 12c0-4.4 3.6-8 8-8s8 3.6 8 8c0 2-.7 3.8-2 5.2L19 21l-4-2.2c-1 .2-2 .2-3 0-4.4 0-8-3.6-8-8z"
          stroke="white"
          strokeWidth="1.7"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
