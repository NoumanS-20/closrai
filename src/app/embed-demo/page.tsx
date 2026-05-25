import Link from "next/link";
import { EmbedLoader } from "@/components/EmbedLoader";

export const metadata = {
  title: "Acme Wellness — Embed Demo",
  description:
    "Simulated third-party customer site demonstrating the one-line ClosrAI embed.",
};

export default function EmbedDemoPage() {
  return (
    <main id="main" tabIndex={-1} className="ed">
      <EmbedLoader persona="care" />

      <div className="ed__banner">
        <span>
          🧪 Simulated third-party site showing the ClosrAI embed in the wild —
          the launcher in the bottom-right is loaded via one{" "}
          <code>&lt;script&gt;</code> tag.
        </span>
        <Link href="/" className="ed__back">
          ← Back to ClosrAI
        </Link>
      </div>

      <nav className="ed__nav" aria-label="Acme Wellness">
        <div className="ed__nav-row">
          <div className="ed__brand">
            <span className="ed__brand-mark" aria-hidden="true" />
            <span>Acme Wellness</span>
          </div>
          <div className="ed__nav-items">
            <span>Shop</span>
            <span>Recipes</span>
            <span>Support</span>
            <strong>Cart (0)</strong>
          </div>
        </div>
      </nav>

      <section className="ed__hero">
        <div className="ed__hero-inner">
          <div className="ed__hero-copy">
            <p className="ed__eyebrow">Premium kitchenware · Made in India</p>
            <h1>Cookware your grandmother would approve of.</h1>
            <p className="ed__sub">
              Cast iron, brass, and copper essentials forged in Khurja and
              Moradabad. Free shipping above ₹999. 14-day no-questions returns.
            </p>
            <div className="ed__ctas">
              <button className="ed__btn ed__btn--primary">
                Shop the collection
              </button>
              <button className="ed__btn ed__btn--ghost">Browse recipes</button>
            </div>
          </div>
          <div className="ed__hero-art" aria-hidden="true">
            🍳
          </div>
        </div>
      </section>

      <section className="ed__explain">
        <h2>How the embed works</h2>
        <div className="ed__explain-grid">
          <div>
            <p>
              This page is a fake customer site. The chat launcher in the
              bottom-right corner is the entire ClosrAI integration. Open it and
              you&rsquo;ll see the <strong>PlyoCare</strong> persona, configured
              for D2C post-purchase support — order lookups, refund/return
              policy, escalation for damaged goods.
            </p>
            <p>The only line of code Acme had to add is this:</p>
          </div>
          <pre className="ed__snippet">
{`<script
  src="https://closrai-nine.vercel.app/embed.js"
  data-persona="care"
  data-voice="1"
  defer
></script>`}
          </pre>
        </div>
        <p className="ed__hint">
          Swap <code>data-persona</code> for <code>sales</code> if you&rsquo;re a
          SaaS pricing page, or <code>support</code> if you want the KB-grounded
          support agent. Same script, three bots.
        </p>
      </section>

      <footer className="ed__foot">
        <span>© Acme Wellness — fictional demo site</span>
        <span>Embed powered by ClosrAI Platform</span>
      </footer>

      <style>{`
        .ed { background: oklch(0.99 0.003 70); min-height: 100vh; color: var(--ink); }
        .ed__banner {
          background: var(--surface-2);
          border-bottom: 1px solid var(--line-soft);
          font-size: 0.78rem;
          color: var(--ink-soft);
          padding: 8px 18px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; flex-wrap: wrap;
        }
        .ed__banner code {
          font-family: var(--font-mono);
          background: var(--surface);
          padding: 1px 5px;
          border-radius: 4px;
          border: 1px solid var(--line);
        }
        .ed__back { color: var(--terracotta-deep); }

        .ed__nav { border-bottom: 1px solid var(--line-soft); background: var(--surface); }
        .ed__nav-row {
          max-width: 1120px; margin: 0 auto;
          padding: 14px 22px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .ed__brand {
          display: inline-flex; align-items: center; gap: 10px;
          font-weight: 600;
        }
        .ed__brand-mark {
          width: 24px; height: 24px;
          border-radius: 6px;
          background: linear-gradient(135deg, oklch(0.80 0.13 80), oklch(0.70 0.13 22));
        }
        .ed__nav-items { display: flex; align-items: center; gap: 20px; font-size: 0.9rem; color: var(--ink-soft); }
        .ed__nav-items strong { color: var(--ink); }

        .ed__hero { padding: 64px 22px; }
        .ed__hero-inner {
          max-width: 1120px; margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 36px;
          align-items: center;
        }
        @media (max-width: 900px) { .ed__hero-inner { grid-template-columns: 1fr; } }
        .ed__eyebrow {
          font-size: 0.78rem;
          font-weight: 600;
          color: oklch(0.40 0.14 60);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin: 0 0 14px;
        }
        .ed__hero-copy h1 {
          font-size: clamp(2.4rem, 4.5vw, 3.4rem);
          font-weight: 600;
          letter-spacing: -0.04em;
          line-height: 1.05;
          margin: 0 0 14px;
        }
        .ed__sub {
          font-size: 1.1rem;
          color: var(--ink-soft);
          line-height: 1.45;
          margin: 0 0 22px;
        }
        .ed__ctas { display: flex; gap: 12px; }
        .ed__btn {
          padding: 11px 20px;
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          border: 1px solid;
        }
        .ed__btn--primary {
          background: var(--ink);
          color: white;
          border-color: var(--ink);
        }
        .ed__btn--ghost {
          background: transparent;
          color: var(--ink);
          border-color: var(--line);
        }
        .ed__hero-art {
          aspect-ratio: 1/1;
          border-radius: var(--radius-xl);
          background: linear-gradient(135deg, oklch(0.95 0.05 80), oklch(0.88 0.08 22));
          display: grid; place-items: center;
          font-size: 6rem;
          box-shadow: var(--shadow-lift);
        }

        .ed__explain {
          max-width: 1120px; margin: 0 auto;
          padding: 80px 22px;
          border-top: 1px solid var(--line-soft);
        }
        .ed__explain h2 {
          font-size: clamp(1.8rem, 3vw, 2.2rem);
          margin: 0 0 22px;
          font-weight: 600;
          letter-spacing: -0.025em;
        }
        .ed__explain-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 36px;
          align-items: start;
        }
        @media (max-width: 900px) { .ed__explain-grid { grid-template-columns: 1fr; } }
        .ed__explain-grid p { color: var(--ink-soft); line-height: 1.5; }
        .ed__snippet {
          background: var(--ink);
          color: var(--surface);
          font-family: var(--font-mono);
          font-size: 0.85rem;
          padding: 18px 22px;
          border-radius: var(--radius-md);
          margin: 0;
          overflow-x: auto;
          line-height: 1.55;
        }
        .ed__hint {
          margin-top: 22px;
          font-size: 0.92rem;
          color: var(--ink-mute);
        }
        .ed__hint code {
          font-family: var(--font-mono);
          background: var(--surface-2);
          padding: 1px 6px;
          border-radius: 4px;
          color: var(--terracotta-deep);
        }

        .ed__foot {
          border-top: 1px solid var(--line-soft);
          padding: 22px;
          max-width: 1120px;
          margin: 0 auto;
          display: flex; justify-content: space-between;
          font-size: 0.78rem;
          color: var(--ink-mute);
          flex-wrap: wrap;
          gap: 10px;
        }
      `}</style>
    </main>
  );
}
