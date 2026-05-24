import Link from "next/link";
import { A11yPanelButton } from "@/components/A11ySettings";

export const metadata = {
  title: "Accessibility — ClosrAI Platform",
  description:
    "How ClosrAI Platform approaches accessibility: built-in display settings, ARIA, voice mode, keyboard navigation, reduced motion, and the honest limits of what we've tested.",
};

export default function AccessibilityPage() {
  return (
    <main id="main" className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-12">
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-200">
            ← Home
          </Link>
          <A11yPanelButton />
        </div>

        <header className="space-y-3">
          <div className="text-xs uppercase tracking-wider text-emerald-300">
            Accessibility commitments
          </div>
          <h1 className="text-4xl font-semibold tracking-tight">
            Built to be used by everyone.
          </h1>
          <p className="text-zinc-400 leading-relaxed">
            Accessibility isn&rsquo;t a checkbox at the end of a project — and a
            hackathon project pretending to be done is the worst place to ship
            inaccessible software. Here&rsquo;s what we built in, what we
            tested, and what we know we haven&rsquo;t.
          </p>
        </header>

        <section aria-labelledby="settings-heading" className="space-y-3">
          <h2 id="settings-heading" className="text-2xl font-semibold tracking-tight">
            Built-in display settings
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            Every page has an accessibility settings button in the header (the
            person-with-cane icon). Open it to flip:
          </p>
          <ul className="list-disc list-inside text-zinc-300 space-y-1">
            <li>
              <strong>High contrast</strong> — pushes the dark theme toward
              pure black/white for low-vision readability.
            </li>
            <li>
              <strong>Larger text</strong> — bumps base font size from 16px to
              18px.
            </li>
            <li>
              <strong>Dyslexia-friendly font</strong> — switches body text to a
              dyslexia-optimized font stack with looser tracking and line
              height.
            </li>
            <li>
              <strong>Reduce motion</strong> — disables animations and
              transitions site-wide. Also picked up automatically from your
              OS&rsquo;s{" "}
              <code className="text-emerald-300">prefers-reduced-motion</code>{" "}
              setting on first visit.
            </li>
            <li>
              <strong>Always underline links</strong> — adds explicit
              underlines instead of relying on color alone.
            </li>
          </ul>
          <p className="text-sm text-zinc-500">
            Settings persist in <code className="text-emerald-300">localStorage</code> on this
            device.
          </p>
        </section>

        <section aria-labelledby="screenreader-heading" className="space-y-3">
          <h2 id="screenreader-heading" className="text-2xl font-semibold tracking-tight">
            Screen reader support
          </h2>
          <ul className="list-disc list-inside text-zinc-300 space-y-1">
            <li>
              Every page has a{" "}
              <strong>Skip to main content</strong> link as its first focusable
              element (try pressing Tab on any page).
            </li>
            <li>
              The chat transcript is announced as a live{" "}
              <code className="text-emerald-300">role=&quot;log&quot;</code>{" "}
              region with{" "}
              <code className="text-emerald-300">aria-live=&quot;polite&quot;</code>,
              so new bot replies are read aloud automatically.
            </li>
            <li>
              Every message is wrapped in an{" "}
              <code className="text-emerald-300">{`<article>`}</code> with an{" "}
              <code className="text-emerald-300">aria-label</code> identifying
              the speaker (&ldquo;You said&rdquo; or &ldquo;ClosrAI
              said&rdquo;).
            </li>
            <li>
              The Live Deal IQ score exposes its full score via an{" "}
              <code className="text-emerald-300">aria-label</code> on the ring,
              individual bars use{" "}
              <code className="text-emerald-300">role=&quot;progressbar&quot;</code>{" "}
              with proper min/max/valuenow, and a screen-reader-only{" "}
              <code className="text-emerald-300">aria-live</code> region
              announces score changes with a one-sentence rationale.
            </li>
            <li>
              The internal Skeptic-vs-Closer debate panel is a labelled
              region with proper heading levels — screen readers can navigate
              between the two perspectives.
            </li>
            <li>
              Status badges (lead status, persona) carry{" "}
              <code className="text-emerald-300">sr-only</code> prefixes
              (&ldquo;Status:&rdquo;, &ldquo;Persona:&rdquo;) so the colored
              chips read sensibly without color cues.
            </li>
            <li>
              Dashboard filter pills use{" "}
              <code className="text-emerald-300">aria-current=&quot;page&quot;</code>{" "}
              on the active filter, and the leads table has an sr-only
              caption describing the current view.
            </li>
          </ul>
        </section>

        <section aria-labelledby="motor-heading" className="space-y-3">
          <h2 id="motor-heading" className="text-2xl font-semibold tracking-tight">
            Motor accessibility
          </h2>
          <ul className="list-disc list-inside text-zinc-300 space-y-1">
            <li>
              <strong>Full keyboard navigation</strong> — every interactive
              element is reachable with Tab. The accessibility settings dialog
              auto-focuses the first toggle when opened and traps Esc to close.
            </li>
            <li>
              <strong>Visible focus rings</strong> on every focusable element,
              styled with strong contrast (emerald outline + offset).
            </li>
            <li>
              <strong>Voice mode</strong> — instead of typing, tap the
              microphone button next to the input field to speak. The bot
              speaks its reply back. Built on the browser&rsquo;s native Web
              Speech API, so no external service required.
            </li>
            <li>
              <strong>Generous hit targets</strong> — all primary buttons are
              ≥40×40px (the WCAG 2.5.5 AAA target).
            </li>
            <li>
              The embedded chat launcher closes on{" "}
              <strong>Escape</strong> and restores focus to the launcher
              button.
            </li>
          </ul>
        </section>

        <section aria-labelledby="cognitive-heading" className="space-y-3">
          <h2 id="cognitive-heading" className="text-2xl font-semibold tracking-tight">
            Cognitive accessibility
          </h2>
          <ul className="list-disc list-inside text-zinc-300 space-y-1">
            <li>
              The chat agent is instructed to ask one focused question at a
              time — never interrogate. This is a system-prompt-level
              commitment baked into every persona.
            </li>
            <li>
              The dyslexia-friendly font toggle uses a font stack chosen for
              readability (OpenDyslexic if installed, otherwise Comic Neue,
              otherwise Trebuchet/Verdana).
            </li>
            <li>
              Reduce-motion mode disables all animations including the
              attention-grabbing pulse dot in the chat header.
            </li>
          </ul>
        </section>

        <section aria-labelledby="hearing-heading" className="space-y-3">
          <h2 id="hearing-heading" className="text-2xl font-semibold tracking-tight">
            Deaf / hard-of-hearing
          </h2>
          <ul className="list-disc list-inside text-zinc-300 space-y-1">
            <li>
              When voice mode is reading a reply aloud, a visible{" "}
              <strong>caption banner</strong> appears at the bottom of the
              screen showing the text being spoken — no information is
              audio-only.
            </li>
            <li>
              All bot replies live in the transcript permanently, so a user
              who can&rsquo;t hear can always scroll back and read.
            </li>
          </ul>
        </section>

        <section aria-labelledby="honest-heading" className="space-y-3">
          <h2 id="honest-heading" className="text-2xl font-semibold tracking-tight">
            What we haven&rsquo;t done
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            Honest disclosure: we have NOT yet run automated axe-core scans or
            tested with real screen readers (NVDA, VoiceOver, JAWS, TalkBack)
            end-to-end. The ARIA work follows WCAG patterns but full WCAG 2.2
            AA conformance would require dedicated manual testing we
            haven&rsquo;t completed.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            Color contrast is checked at the Tailwind palette level (zinc-100
            on zinc-950 passes AAA; zinc-400 on zinc-950 passes AA for large
            text) but not exhaustively for every accent combination,
            especially the muted text on amber/sky/violet backgrounds in the
            badge components.
          </p>
          <p className="text-zinc-400 leading-relaxed">
            Voice mode relies on the browser&rsquo;s Web Speech API, which has
            varying support — it works in Chrome, Edge, and Safari, but not
            Firefox. If voice isn&rsquo;t available, the mic button
            simply doesn&rsquo;t render — text input always works as a
            fallback.
          </p>
        </section>

        <section aria-labelledby="contact-heading" className="space-y-3">
          <h2 id="contact-heading" className="text-2xl font-semibold tracking-tight">
            Reporting accessibility issues
          </h2>
          <p className="text-zinc-400 leading-relaxed">
            This is a hackathon submission, not a maintained product — but if
            you&rsquo;re a judge or reviewer and notice something specific,
            file an issue on the{" "}
            <a
              href="https://github.com/NoumanS-20/closrai/issues"
              className="text-emerald-300 hover:text-emerald-200"
            >
              GitHub repo
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
