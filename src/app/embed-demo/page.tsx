import Link from "next/link";
import { EmbedDemoControl } from "@/components/EmbedDemoControl";

export const metadata = {
  title: "Acme Wellness — Embed Demo",
  description:
    "Simulated third-party customer site demonstrating the one-line ClosrAI embed.",
};

const PRODUCTS = [
  {
    name: "Cast-Iron Tawa",
    tagline: "Hand-forged in Khurja · 11\"",
    price: 1490,
    badge: "Bestseller",
    grad: "linear-gradient(135deg, oklch(0.42 0.06 30), oklch(0.20 0.04 30))",
    emoji: "🫓",
  },
  {
    name: "Brass Kalash",
    tagline: "Polished · 1.2L",
    price: 2890,
    badge: null,
    grad: "linear-gradient(135deg, oklch(0.78 0.13 75), oklch(0.55 0.13 60))",
    emoji: "🪔",
  },
  {
    name: "Copper Water Bottle",
    tagline: "Ayurvedic · 750ml",
    price: 990,
    badge: "Restocked",
    grad: "linear-gradient(135deg, oklch(0.70 0.15 35), oklch(0.45 0.16 30))",
    emoji: "💧",
  },
  {
    name: "Stone Mortar & Pestle",
    tagline: "Granite · 7\" bowl",
    price: 1690,
    badge: null,
    grad: "linear-gradient(135deg, oklch(0.62 0.02 60), oklch(0.32 0.02 60))",
    emoji: "🌶️",
  },
];

const REVIEWS = [
  {
    name: "Anita S.",
    location: "Bengaluru",
    quote:
      "The cast-iron tawa is heavier than I expected — in the best way. My rotis come out the way Amma used to make them.",
    rating: 5,
  },
  {
    name: "Vikram R.",
    location: "Pune",
    quote:
      "Returns process was painless. Damaged item arrived, replacement in 3 days. That's rare for D2C in India.",
    rating: 5,
  },
  {
    name: "Priya K.",
    location: "Chennai",
    quote:
      "Brass kalash is a beauty. Acme's chat bot helped me pick the right size for my pooja shelf in 30 seconds.",
    rating: 5,
  },
];

export default function EmbedDemoPage() {
  const origin = "https://closrai-nine.vercel.app";

  return (
    <main id="main" tabIndex={-1} className="ed">
      <div className="ed__banner">
        <span>
          🧪 Simulated third-party site demonstrating the one-line ClosrAI
          embed. The chat launcher in the bottom-right is the entire
          integration.
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
            <span>Journal</span>
            <span>Support</span>
            <strong>Cart (0)</strong>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="ed__hero">
        <div className="ed__hero-inner">
          <div className="ed__hero-copy">
            <p className="ed__eyebrow">Premium kitchenware · Made in India</p>
            <h1>Cookware your grandmother would approve of.</h1>
            <p className="ed__sub">
              Cast iron from Khurja. Brass from Moradabad. Copper from Pune.
              Forged by hand, designed for daily use. Free shipping above ₹999.
              14-day no-questions returns.
            </p>
            <div className="ed__ctas">
              <button className="ed__btn ed__btn--primary" type="button">
                Shop the collection
              </button>
              <button className="ed__btn ed__btn--ghost" type="button">
                Browse recipes
              </button>
            </div>
            <p className="ed__credit">
              Featured in <em>Mint Lounge</em> · <em>The Hindu Weekend</em> ·{" "}
              <em>Condé Nast Traveller India</em>
            </p>
          </div>
          <div className="ed__hero-art" aria-hidden="true">
            <div className="ed__hero-stack">
              <div className="ed__stack-card ed__stack-card--1">
                <span>🫓</span>
                <strong>Cast Iron</strong>
              </div>
              <div className="ed__stack-card ed__stack-card--2">
                <span>🪔</span>
                <strong>Brass</strong>
              </div>
              <div className="ed__stack-card ed__stack-card--3">
                <span>💧</span>
                <strong>Copper</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="ed__products" aria-labelledby="products-h">
        <header className="ed__section-head">
          <p className="ed__small-eyebrow">Featured</p>
          <h2 id="products-h">This week&rsquo;s shelf</h2>
        </header>
        <div className="ed__product-grid">
          {PRODUCTS.map((p) => (
            <article key={p.name} className="ed__product">
              <div
                className="ed__product-art"
                aria-hidden="true"
                style={{ background: p.grad }}
              >
                <span>{p.emoji}</span>
                {p.badge && <em className="ed__product-badge">{p.badge}</em>}
              </div>
              <div className="ed__product-meta">
                <strong>{p.name}</strong>
                <span>{p.tagline}</span>
              </div>
              <div className="ed__product-foot">
                <span className="ed__product-price">
                  ₹{p.price.toLocaleString("en-IN")}
                </span>
                <button type="button" className="ed__product-add">
                  Add to cart
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* REVIEWS */}
      <section className="ed__reviews" aria-labelledby="reviews-h">
        <div className="ed__reviews-inner">
          <header className="ed__section-head ed__section-head--centered">
            <p className="ed__small-eyebrow">From our customers</p>
            <h2 id="reviews-h">A few thousand happy kitchens.</h2>
          </header>
          <div className="ed__reviews-grid">
            {REVIEWS.map((r) => (
              <figure key={r.name} className="ed__review">
                <div
                  className="ed__review-stars"
                  aria-label={`${r.rating} out of 5 stars`}
                >
                  {"★".repeat(r.rating)}
                  <span className="sr-only">out of 5</span>
                </div>
                <blockquote>
                  <p>“{r.quote}”</p>
                </blockquote>
                <figcaption>
                  <strong>{r.name}</strong>
                  <span>{r.location}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* EMBED CONTROL — live persona switcher + script source */}
      <section className="ed__embed" aria-labelledby="embed-h">
        <header className="ed__section-head">
          <p className="ed__small-eyebrow">Live integration</p>
          <h2 id="embed-h">This whole chat experience is one script tag.</h2>
          <p className="ed__section-sub">
            Acme Wellness embedded ClosrAI with one line of code in their site
            header. Try switching the persona below — the launcher in the
            bottom-right updates in real time.
          </p>
        </header>
        <EmbedDemoControl origin={origin} />
      </section>

      {/* FOOTER */}
      <footer className="ed__foot" aria-label="Site footer">
        <div className="ed__foot-inner">
          <div className="ed__foot-col ed__foot-col--brand">
            <div className="ed__brand">
              <span className="ed__brand-mark" aria-hidden="true" />
              <span>Acme Wellness</span>
            </div>
            <p>
              Hand-forged kitchenware from artisan clusters across India. Built
              to last a lifetime — and the one after.
            </p>
          </div>
          <div className="ed__foot-col">
            <strong>Shop</strong>
            <ul>
              <li>Cast iron</li>
              <li>Brass</li>
              <li>Copper</li>
              <li>Stoneware</li>
              <li>Gift sets</li>
            </ul>
          </div>
          <div className="ed__foot-col">
            <strong>Help</strong>
            <ul>
              <li>Track an order</li>
              <li>Returns & refunds</li>
              <li>Care instructions</li>
              <li>Contact</li>
            </ul>
          </div>
          <div className="ed__foot-col">
            <strong>About</strong>
            <ul>
              <li>Our artisans</li>
              <li>Press</li>
              <li>Journal</li>
              <li>Careers</li>
            </ul>
          </div>
        </div>
        <div className="ed__foot-bar">
          <span>© Acme Wellness · Fictional demo site</span>
          <span>Chat embed powered by ClosrAI Platform</span>
        </div>
      </footer>

      <style>{`
        .ed { background: oklch(0.99 0.003 70); min-height: 100vh; color: var(--ink); }

        /* TOP BANNER (the "this is a demo" strip) */
        .ed__banner {
          background: var(--ink);
          color: oklch(0.85 0.005 60);
          font-size: 0.78rem;
          padding: 9px 22px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; flex-wrap: wrap;
        }
        .ed__back { color: oklch(0.80 0.14 60); }
        .ed__back:hover { color: var(--honey); text-decoration: underline; text-underline-offset: 3px; }

        /* NAV */
        .ed__nav { border-bottom: 1px solid var(--line-soft); background: var(--surface); position: sticky; top: 0; z-index: 40; backdrop-filter: blur(8px); }
        .ed__nav-row {
          max-width: 1200px; margin: 0 auto;
          padding: 16px 22px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .ed__brand {
          display: inline-flex; align-items: center; gap: 10px;
          font-weight: 600;
          font-family: var(--font-display);
          letter-spacing: -0.01em;
        }
        .ed__brand-mark {
          width: 24px; height: 24px;
          border-radius: 6px;
          background: linear-gradient(135deg, oklch(0.80 0.13 80), oklch(0.70 0.13 22));
          box-shadow: inset 0 -1.5px 2px rgba(0,0,0,.18), inset 0 1.5px 1.5px rgba(255,255,255,.4);
        }
        .ed__nav-items { display: flex; align-items: center; gap: 22px; font-size: 0.9rem; color: var(--ink-soft); }
        .ed__nav-items strong { color: var(--ink); font-weight: 500; }

        /* HERO */
        .ed__hero { padding: 72px 22px 88px; }
        .ed__hero-inner {
          max-width: 1200px; margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
        }
        @media (max-width: 940px) { .ed__hero-inner { grid-template-columns: 1fr; gap: 36px; } }
        .ed__eyebrow {
          font-size: 0.78rem;
          font-weight: 600;
          color: oklch(0.40 0.14 60);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin: 0 0 14px;
        }
        .ed__hero-copy h1 {
          font-size: clamp(2.4rem, 4.5vw, 3.6rem);
          font-weight: 600;
          letter-spacing: -0.04em;
          line-height: 1.05;
          margin: 0 0 18px;
        }
        .ed__sub {
          font-size: 1.1rem;
          color: var(--ink-soft);
          line-height: 1.5;
          margin: 0 0 24px;
        }
        .ed__ctas { display: flex; gap: 12px; flex-wrap: wrap; }
        .ed__btn {
          padding: 12px 22px;
          border-radius: var(--radius-md);
          font-weight: 600;
          font-size: 0.95rem;
          cursor: pointer;
          border: 1px solid;
          font-family: inherit;
        }
        .ed__btn--primary {
          background: var(--ink);
          color: white;
          border-color: var(--ink);
        }
        .ed__btn--primary:hover { background: oklch(0.28 0.005 60); }
        .ed__btn--ghost {
          background: transparent;
          color: var(--ink);
          border-color: var(--line);
        }
        .ed__btn--ghost:hover { background: var(--surface-2); }
        .ed__credit {
          margin: 22px 0 0;
          font-size: 0.78rem;
          color: var(--ink-mute);
          letter-spacing: 0.01em;
        }
        .ed__credit em { font-style: normal; color: var(--ink-soft); font-weight: 500; }

        /* HERO ART — 3 stacked product cards */
        .ed__hero-art {
          aspect-ratio: 1/1;
          display: grid;
          place-items: center;
          position: relative;
        }
        .ed__hero-stack {
          position: relative;
          width: min(100%, 440px);
          aspect-ratio: 1/1;
        }
        .ed__stack-card {
          position: absolute;
          width: 65%;
          aspect-ratio: 3/4;
          border-radius: var(--radius-lg);
          display: flex; flex-direction: column;
          justify-content: space-between;
          padding: 18px 20px;
          box-shadow:
            0 30px 60px -20px rgba(80, 40, 10, 0.35),
            0 12px 24px -10px rgba(80, 40, 10, 0.2);
          color: white;
        }
        .ed__stack-card span { font-size: 3.2rem; line-height: 1; }
        .ed__stack-card strong { font-family: var(--font-display); font-size: 1.15rem; letter-spacing: -0.02em; }
        .ed__stack-card--1 {
          top: 5%; left: 0;
          background: linear-gradient(135deg, oklch(0.45 0.05 30), oklch(0.22 0.04 30));
          transform: rotate(-7deg);
          z-index: 1;
        }
        .ed__stack-card--2 {
          top: 12%; right: 5%;
          background: linear-gradient(135deg, oklch(0.78 0.13 75), oklch(0.50 0.14 60));
          transform: rotate(6deg);
          z-index: 3;
        }
        .ed__stack-card--3 {
          bottom: 0; left: 18%;
          background: linear-gradient(135deg, oklch(0.70 0.15 35), oklch(0.42 0.16 30));
          transform: rotate(-2deg);
          z-index: 2;
        }

        /* SHARED SECTION HEAD */
        .ed__section-head {
          margin-bottom: 36px;
        }
        .ed__section-head--centered {
          text-align: center;
          max-width: 640px;
          margin-left: auto; margin-right: auto;
        }
        .ed__section-head h2 {
          font-size: clamp(1.8rem, 3vw, 2.4rem);
          font-weight: 600;
          letter-spacing: -0.03em;
          margin: 0;
        }
        .ed__section-sub {
          margin: 14px 0 0;
          color: var(--ink-soft);
          line-height: 1.5;
          max-width: 560px;
        }
        .ed__small-eyebrow {
          font-size: 0.78rem;
          font-weight: 600;
          color: oklch(0.40 0.14 60);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin: 0 0 10px;
        }

        /* PRODUCT GRID */
        .ed__products {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 22px;
        }
        .ed__product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }
        @media (max-width: 940px) { .ed__product-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .ed__product-grid { grid-template-columns: 1fr; } }
        .ed__product {
          background: var(--surface);
          border: 1px solid var(--line-soft);
          border-radius: var(--radius-lg);
          padding: 12px;
          display: flex; flex-direction: column;
          transition: transform var(--dur-fast, 140ms) ease, box-shadow var(--dur-fast, 140ms) ease;
        }
        .ed__product:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lift);
        }
        .ed__product-art {
          aspect-ratio: 4/5;
          border-radius: var(--radius-md);
          position: relative;
          display: grid; place-items: center;
          font-size: 4rem;
          color: white;
          box-shadow: inset 0 -8px 30px rgba(0,0,0,.15);
        }
        .ed__product-badge {
          position: absolute;
          top: 10px; left: 10px;
          background: var(--surface);
          color: var(--ink);
          font-size: 0.65rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          font-style: normal;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: 999px;
        }
        .ed__product-meta {
          padding: 14px 6px 8px;
          display: flex; flex-direction: column; gap: 2px;
        }
        .ed__product-meta strong {
          font-family: var(--font-display);
          font-size: 1.05rem;
          letter-spacing: -0.015em;
        }
        .ed__product-meta span {
          color: var(--ink-mute);
          font-size: 0.82rem;
        }
        .ed__product-foot {
          padding: 0 6px 6px;
          margin-top: auto;
          display: flex; align-items: center; justify-content: space-between;
        }
        .ed__product-price {
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 1.05rem;
        }
        .ed__product-add {
          padding: 7px 12px;
          border-radius: 999px;
          border: 1px solid var(--line);
          background: var(--surface);
          color: var(--ink);
          font-size: 0.78rem;
          font-weight: 500;
          cursor: pointer;
        }
        .ed__product-add:hover { background: var(--ink); color: white; border-color: var(--ink); }

        /* REVIEWS */
        .ed__reviews {
          background: oklch(0.96 0.012 70);
          padding: 80px 22px;
          border-top: 1px solid var(--line-soft);
          border-bottom: 1px solid var(--line-soft);
        }
        .ed__reviews-inner { max-width: 1200px; margin: 0 auto; }
        .ed__reviews-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }
        @media (max-width: 940px) { .ed__reviews-grid { grid-template-columns: 1fr; } }
        .ed__review {
          background: var(--surface);
          border: 1px solid var(--line-soft);
          border-radius: var(--radius-lg);
          padding: 22px;
          margin: 0;
          display: flex; flex-direction: column; gap: 12px;
          box-shadow: var(--shadow-soft);
        }
        .ed__review-stars {
          color: oklch(0.70 0.15 75);
          letter-spacing: 0.1em;
          font-size: 1rem;
        }
        .ed__review blockquote { margin: 0; }
        .ed__review blockquote p {
          margin: 0;
          font-size: 0.98rem;
          line-height: 1.5;
          color: var(--ink);
        }
        .ed__review figcaption {
          margin-top: auto;
          display: flex; flex-direction: column;
          gap: 1px;
          font-size: 0.82rem;
        }
        .ed__review figcaption strong { color: var(--ink); font-weight: 600; }
        .ed__review figcaption span { color: var(--ink-mute); }

        /* EMBED SECTION */
        .ed__embed {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 22px 100px;
        }

        /* FOOTER */
        .ed__foot {
          background: var(--ink);
          color: oklch(0.85 0.005 60);
          padding: 56px 22px 22px;
        }
        .ed__foot-inner {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.4fr repeat(3, 1fr);
          gap: 32px;
        }
        @media (max-width: 760px) { .ed__foot-inner { grid-template-columns: 1fr 1fr; } }
        @media (max-width: 460px) { .ed__foot-inner { grid-template-columns: 1fr; } }
        .ed__foot-col strong {
          font-family: var(--font-display);
          font-size: 0.95rem;
          color: white;
          display: block;
          margin-bottom: 14px;
        }
        .ed__foot-col p {
          margin: 14px 0 0;
          font-size: 0.85rem;
          color: oklch(0.75 0.005 60);
          line-height: 1.5;
          max-width: 36ch;
        }
        .ed__foot-col ul {
          list-style: none;
          padding: 0; margin: 0;
          display: flex; flex-direction: column; gap: 8px;
        }
        .ed__foot-col li {
          font-size: 0.85rem;
          color: oklch(0.78 0.005 60);
          cursor: pointer;
        }
        .ed__foot-col li:hover { color: white; }
        .ed__foot-col--brand .ed__brand { color: white; font-size: 1.05rem; }
        .ed__foot-bar {
          margin: 48px auto 0;
          max-width: 1200px;
          padding-top: 22px;
          border-top: 1px solid oklch(0.25 0.005 60);
          display: flex; justify-content: space-between;
          font-size: 0.78rem;
          color: oklch(0.55 0.005 60);
          flex-wrap: wrap;
          gap: 10px;
        }
      `}</style>
    </main>
  );
}
