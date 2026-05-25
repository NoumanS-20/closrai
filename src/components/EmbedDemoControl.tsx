"use client";

import { useEffect, useState } from "react";
import { EmbedLoader } from "./EmbedLoader";

type Persona = "sales" | "support" | "care";

interface PersonaOption {
  id: Persona;
  label: string;
  description: string;
  swatch: string;
}

const OPTIONS: PersonaOption[] = [
  {
    id: "care",
    label: "Customer Care",
    description: "Order lookups, refunds, escalation",
    swatch: "linear-gradient(135deg, oklch(0.78 0.10 20), oklch(0.55 0.13 15))",
  },
  {
    id: "support",
    label: "Support",
    description: "Docs-grounded answers, human hand-off",
    swatch: "linear-gradient(135deg, oklch(0.80 0.15 80), oklch(0.55 0.15 60))",
  },
  {
    id: "sales",
    label: "Sales SDR",
    description: "Qualifies leads, books meetings",
    swatch: "linear-gradient(135deg, oklch(0.72 0.18 35), oklch(0.50 0.20 28))",
  },
];

interface Props {
  origin: string;
}

export function EmbedDemoControl({ origin }: Props) {
  const [persona, setPersona] = useState<Persona>("care");
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(false);

  // Pop the welcome bubble 2.5s after load. Auto-hide after 7s if the user
  // doesn't interact. Dismissed permanently if the user clicks the launcher.
  useEffect(() => {
    if (bubbleDismissed) return;
    const show = setTimeout(() => setBubbleVisible(true), 2500);
    const hide = setTimeout(() => setBubbleVisible(false), 2500 + 7000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, [bubbleDismissed]);

  // If the user clicks anywhere outside the bubble, hide it.
  useEffect(() => {
    if (!bubbleVisible) return;
    const onPointer = () => {
      setBubbleVisible(false);
      setBubbleDismissed(true);
    };
    const t = setTimeout(() => {
      document.addEventListener("pointerdown", onPointer, { once: true });
    }, 200);
    return () => {
      clearTimeout(t);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [bubbleVisible]);

  const snippet = `<script
  src="${origin}/embed.js"
  data-persona="${persona}"
  data-voice="1"
  defer
></script>`;

  return (
    <>
      <EmbedLoader persona={persona} />

      {/* Welcome bubble next to the launcher */}
      {bubbleVisible && (
        <div className="ed-bubble" role="status" aria-live="polite">
          <span aria-hidden="true">👋</span>
          <span>Tap the chat bubble &mdash; that&rsquo;s the entire integration.</span>
        </div>
      )}

      {/* Persona switcher */}
      <aside className="ed-switcher" aria-label="Switch embedded bot persona">
        <p className="ed-switcher__label">
          <span aria-hidden="true">↳ </span>Try a different persona
        </p>
        <div className="ed-switcher__chips" role="radiogroup" aria-label="Bot persona">
          {OPTIONS.map((o) => {
            const active = o.id === persona;
            return (
              <button
                key={o.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setPersona(o.id)}
                className={"ed-chip" + (active ? " is-active" : "")}
                title={o.description}
              >
                <span
                  aria-hidden="true"
                  className="ed-chip__swatch"
                  style={{ background: o.swatch }}
                />
                <span className="ed-chip__label">{o.label}</span>
              </button>
            );
          })}
        </div>
        <p className="ed-switcher__hint">
          The launcher in the corner updates in real time — same script, swap one
          attribute.
        </p>
      </aside>

      {/* Live script tag — shows the literal code this page is running */}
      <details className="ed-source">
        <summary>Show the actual script tag this page is using</summary>
        <pre>{snippet}</pre>
      </details>

      <style>{`
        .ed-bubble {
          position: fixed;
          right: 96px;
          bottom: 30px;
          z-index: 2147483645;
          background: var(--ink);
          color: var(--surface);
          padding: 12px 16px;
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lift);
          font-size: 0.88rem;
          max-width: 280px;
          display: flex; align-items: center; gap: 8px;
          animation: ed-bubble-in 320ms var(--ease, cubic-bezier(.2,.7,.2,1));
        }
        .ed-bubble::after {
          content: "";
          position: absolute;
          right: -7px;
          bottom: 16px;
          width: 14px;
          height: 14px;
          background: var(--ink);
          transform: rotate(45deg);
          border-radius: 2px;
        }
        @keyframes ed-bubble-in {
          0%   { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        .ed-switcher {
          max-width: 1120px;
          margin: 0 auto;
          padding: 48px 22px 0;
        }
        .ed-switcher__label {
          font-size: 0.85rem;
          color: var(--ink-mute);
          margin: 0 0 12px;
        }
        .ed-switcher__chips {
          display: flex; gap: 10px; flex-wrap: wrap;
        }
        .ed-chip {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 9px 14px 9px 9px;
          border-radius: 999px;
          border: 1px solid var(--line);
          background: var(--surface);
          cursor: pointer;
          font-size: 0.9rem;
          color: var(--ink-soft);
          transition: border-color var(--dur-fast, 140ms) ease,
                      background var(--dur-fast, 140ms) ease,
                      color var(--dur-fast, 140ms) ease;
        }
        .ed-chip:hover { color: var(--ink); border-color: var(--ink-mute); }
        .ed-chip.is-active {
          color: var(--ink);
          border-color: var(--ink);
          background: var(--surface-2);
          font-weight: 600;
        }
        .ed-chip__swatch {
          width: 22px; height: 22px; border-radius: 50%;
          box-shadow:
            inset 0 -3px 5px rgba(0,0,0,.2),
            inset 0 2px 3px rgba(255,255,255,.4);
          flex-shrink: 0;
        }
        .ed-chip__label { font-family: var(--font-display); }
        .ed-switcher__hint {
          font-size: 0.82rem;
          color: var(--ink-mute);
          margin: 12px 0 0;
        }

        .ed-source {
          max-width: 1120px;
          margin: 28px auto 0;
          padding: 0 22px;
        }
        .ed-source > summary {
          font-size: 0.85rem;
          color: var(--terracotta-deep);
          cursor: pointer;
          padding: 8px 0;
          font-weight: 500;
          width: fit-content;
        }
        .ed-source > summary:hover { text-decoration: underline; text-underline-offset: 3px; }
        .ed-source pre {
          background: var(--ink);
          color: var(--surface);
          font-family: var(--font-mono);
          font-size: 0.82rem;
          padding: 16px 20px;
          border-radius: var(--radius-md);
          margin: 8px 0 0;
          overflow-x: auto;
          line-height: 1.6;
        }
      `}</style>
    </>
  );
}
