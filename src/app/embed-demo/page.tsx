import Link from "next/link";
import Script from "next/script";

export const metadata = {
  title: "Acme Wellness — Embed Demo",
  description:
    "Simulated third-party customer site demonstrating the one-line ClosrAI embed.",
};

export default function EmbedDemoPage() {
  return (
    <main className="min-h-screen bg-white text-zinc-900">
      <Script src="/embed.js" data-persona="care" strategy="afterInteractive" />

      <div className="bg-zinc-100 border-b border-zinc-200 text-xs text-zinc-600 px-4 py-2 flex items-center justify-between">
        <span>
          🧪 This is a <strong>simulated third-party site</strong> showing the ClosrAI embed in
          the wild — the launcher in the bottom-right is loaded via one{" "}
          <code className="bg-zinc-200 px-1 rounded">&lt;script&gt;</code> tag.
        </span>
        <Link href="/" className="text-emerald-700 hover:text-emerald-900 underline">
          ← Back to ClosrAI
        </Link>
      </div>

      <nav className="border-b border-zinc-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-rose-400" />
            <span className="font-semibold tracking-tight text-zinc-900">
              Acme Wellness
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-zinc-600">
            <span>Shop</span>
            <span>Recipes</span>
            <span>Support</span>
            <span className="font-medium text-zinc-900">Cart (0)</span>
          </div>
        </div>
      </nav>

      <section className="max-w-6xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-5">
          <div className="text-xs uppercase tracking-wider text-amber-700">
            Premium kitchenware · Made in India
          </div>
          <h1 className="text-5xl font-semibold tracking-tight leading-[1.05] text-zinc-900">
            Cookware your grandmother would approve of.
          </h1>
          <p className="text-lg text-zinc-600 leading-relaxed">
            Cast iron, brass, and copper essentials forged in Khurja and Moradabad.
            Free shipping above ₹999. 14-day no-questions returns.
          </p>
          <div className="flex gap-3">
            <button className="px-5 py-2.5 rounded-xl bg-zinc-900 text-white font-medium">
              Shop the collection
            </button>
            <button className="px-5 py-2.5 rounded-xl border border-zinc-300 text-zinc-700">
              Browse recipes
            </button>
          </div>
        </div>
        <div className="aspect-square rounded-2xl bg-gradient-to-br from-amber-100 via-rose-100 to-amber-200 flex items-center justify-center text-7xl">
          🍳
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-16 border-t border-zinc-200">
        <h2 className="text-sm uppercase tracking-wider text-zinc-500 mb-6">
          How the embed works
        </h2>
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div className="space-y-3 text-zinc-700">
            <p>
              This page is a fake customer site. The chat launcher in the bottom-right
              corner is the entire ClosrAI integration. Open it and you&rsquo;ll see
              the <strong>PlyoCare</strong> persona, configured for D2C post-purchase
              support — order lookups, refund/return policy, escalation for damaged
              goods.
            </p>
            <p>
              The only line of code Acme had to add is this:
            </p>
          </div>
          <div className="rounded-xl bg-zinc-950 text-zinc-100 p-4 font-mono text-xs leading-relaxed overflow-x-auto">
            <div className="text-zinc-500 mb-1">{"<!-- in your site's <head> or <body> -->"}</div>
            <pre className="whitespace-pre-wrap">
{`<script
  src="https://closrai-nine.vercel.app/embed.js"
  data-persona="care"
  data-voice="1"
  defer
></script>`}
            </pre>
          </div>
        </div>
        <p className="mt-6 text-sm text-zinc-500 leading-relaxed">
          Swap{" "}
          <code className="bg-zinc-100 text-zinc-800 px-1 rounded">data-persona</code>{" "}
          for <code className="bg-zinc-100 text-zinc-800 px-1 rounded">sales</code>{" "}
          if you&rsquo;re a SaaS pricing page, or{" "}
          <code className="bg-zinc-100 text-zinc-800 px-1 rounded">support</code> if you
          want the KB-grounded support agent. Same script, three bots.
        </p>
      </section>

      <footer className="border-t border-zinc-200 mt-16">
        <div className="max-w-6xl mx-auto px-6 py-8 text-xs text-zinc-500 flex justify-between">
          <div>© Acme Wellness — fictional demo site</div>
          <div>Embed powered by ClosrAI Platform</div>
        </div>
      </footer>
    </main>
  );
}
