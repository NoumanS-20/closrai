import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata = {
  title: "Accessibility — ClosrAI",
  description:
    "How ClosrAI approaches accessibility: built-in display settings, ARIA, voice mode, keyboard navigation, reduced motion, and the honest limits of what we've tested.",
};

export default function AccessibilityPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="ax">
        <div className="shell ax__inner">
          <header className="ax__head">
            <p className="eyebrow">Accessibility statement</p>
            <h1>Built to be used by everyone.</h1>
            <p>
              Accessibility isn&rsquo;t a checkbox at the end of a project. Here&rsquo;s
              what we built in, what we tested, and what we know we haven&rsquo;t.
            </p>
          </header>

          <Section title="Built-in display settings">
            <p>
              Every page has an accessibility settings button in the header. Open it to flip:
            </p>
            <ul>
              <li>
                <strong>High contrast</strong> — pushes the theme toward
                pure black/white for low-vision readability.
              </li>
              <li>
                <strong>Text size</strong> — three-step scale: default (16 px),
                large (18 px), x-large (20 px).
              </li>
              <li>
                <strong>Dyslexia-friendly font</strong> — switches body text to{" "}
                <em>Atkinson Hyperlegible</em>, designed for readability.
              </li>
              <li>
                <strong>Reduce motion</strong> — disables animations site-wide. Picks up{" "}
                <code>prefers-reduced-motion</code> from your OS by default.
              </li>
              <li>
                <strong>Underline links</strong> — adds explicit underlines instead of relying on color alone.
              </li>
            </ul>
            <p className="ax__note">
              Settings persist in <code>localStorage</code> on this device.
            </p>
          </Section>

          <Section title="Screen reader support">
            <ul>
              <li>
                <strong>Skip to main content</strong> as the first focusable element on every page (try pressing Tab).
              </li>
              <li>
                The chat transcript uses <code>role=&quot;log&quot;</code> +{" "}
                <code>aria-live=&quot;polite&quot;</code> so new replies are read aloud automatically.
              </li>
              <li>
                Every message is wrapped in an <code>&lt;article&gt;</code> with an <code>aria-label</code> identifying the speaker.
              </li>
              <li>
                The Live Deal IQ score is <code>role=&quot;img&quot;</code> with full score in{" "}
                <code>aria-label</code>; breakdown bars use{" "}
                <code>role=&quot;progressbar&quot;</code> with min/max/valuenow/valuetext.
              </li>
              <li>
                The Skeptic-vs-Closer debate panel is a labelled <code>&lt;section role=&quot;region&quot;&gt;</code> with{" "}
                <code>&lt;h3&gt;</code> for each perspective.
              </li>
              <li>
                Status and persona badges carry <code>sr-only</code> &ldquo;Status:&rdquo;/&ldquo;Persona:&rdquo; prefixes so
                colored chips read sensibly without color cues.
              </li>
              <li>
                Dashboard filter pills use <code>aria-current=&quot;page&quot;</code>; the leads table has an{" "}
                <code>sr-only</code> caption.
              </li>
            </ul>
          </Section>

          <Section title="Motor & input">
            <ul>
              <li>
                <strong>Full keyboard navigation</strong> — every interactive element reachable via Tab. The accessibility settings dialog auto-focuses the first toggle and traps Escape to close.
              </li>
              <li>
                <strong>Visible focus rings</strong> on every focusable element, with strong contrast against the warm background.
              </li>
              <li>
                <strong>Voice mode</strong> — tap the microphone next to the input to speak. The bot speaks its reply back. Web Speech API; no external service required.
              </li>
              <li>
                <strong>Generous hit targets</strong> — primary buttons are 40 × 40 px or larger.
              </li>
              <li>
                The embedded chat launcher closes on <strong>Escape</strong> and restores focus to the launcher button.
              </li>
            </ul>
          </Section>

          <Section title="Hearing">
            <ul>
              <li>
                When voice mode reads a reply aloud, the spoken text is{" "}
                <em>already visible</em> in the transcript above — the message bubble is the caption.
              </li>
              <li>
                A polite <code>aria-live</code> announcement (&ldquo;Reading aloud&rdquo;) fires for screen reader users without showing duplicate text on screen.
              </li>
              <li>
                All bot replies live in the transcript permanently, so a user who can&rsquo;t hear can always scroll back and read.
              </li>
            </ul>
          </Section>

          <Section title="What we haven't done">
            <p>
              Honest disclosure: we haven&rsquo;t yet run automated{" "}
              <code>axe-core</code> scans or tested with real screen readers (NVDA, VoiceOver, JAWS, TalkBack) end-to-end. The ARIA work follows WCAG patterns but full WCAG 2.2 AA conformance would require dedicated manual testing we haven&rsquo;t completed.
            </p>
            <p>
              Color contrast was tuned at the design-token level (warm cream background, near-black ink — passes AAA for body text) but not exhaustively for every accent combination, especially on amber/sky/violet badges.
            </p>
            <p>
              Voice mode relies on the browser&rsquo;s Web Speech API, which has varying support — works in Chrome, Edge, and Safari; not Firefox. If voice isn&rsquo;t available, the mic button hides itself and text input always works as a fallback.
            </p>
          </Section>

          <Section title="Reporting accessibility issues">
            <p>
              This is a hackathon submission, not a maintained product — but if you&rsquo;re a judge or reviewer and notice something specific, file an issue on the{" "}
              <a href="https://github.com/NoumanS-20/closrai/issues">GitHub repo</a>.
            </p>
            <div className="ax__cta">
              <Link href="/chat" className="btn btn--primary">
                Try a bot
              </Link>
              <Link href="/" className="linklike">
                Back to overview <span aria-hidden="true">›</span>
              </Link>
            </div>
          </Section>
        </div>

        <style>{`
          .ax { padding: 56px 0 120px; }
          .ax__inner {
            max-width: 760px; margin: 0 auto;
            display: flex; flex-direction: column; gap: 44px;
          }
          .ax__head h1 {
            font-size: clamp(2.4rem, 5vw, 3.6rem);
            font-weight: 600;
            letter-spacing: -0.04em;
            line-height: 1.05;
            margin: 12px 0 16px;
          }
          .ax__head p {
            color: var(--ink-soft);
            font-size: 1.15rem;
            line-height: 1.45;
            margin: 0;
          }
          .ax__sec { display: flex; flex-direction: column; gap: 12px; }
          .ax__sec h2 {
            font-size: clamp(1.5rem, 2.4vw, 1.9rem);
            font-weight: 600;
            letter-spacing: -0.025em;
            margin: 0 0 4px;
          }
          .ax__sec p { margin: 0; color: var(--ink); line-height: 1.5; }
          .ax__sec ul {
            margin: 0; padding-left: 22px;
            display: flex; flex-direction: column; gap: 8px;
            color: var(--ink);
            line-height: 1.5;
          }
          .ax__sec code {
            font-family: var(--font-mono);
            font-size: 0.85em;
            padding: 1px 5px;
            border-radius: 4px;
            background: var(--surface-2);
            border: 1px solid var(--line-soft);
            color: var(--terracotta-deep);
          }
          .ax__note { color: var(--ink-mute); font-size: 0.9rem; }
          .ax__cta {
            display: flex; gap: 18px; align-items: center;
            margin-top: 12px;
            flex-wrap: wrap;
          }
        `}</style>
      </main>
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="ax__sec" aria-labelledby={"ax-" + title.toLowerCase().replace(/\W+/g, "-")}>
      <h2 id={"ax-" + title.toLowerCase().replace(/\W+/g, "-")}>{title}</h2>
      {children}
    </section>
  );
}
