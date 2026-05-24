"use client";

import type { DebateTrace } from "@/lib/types";

interface Props {
  trace: DebateTrace;
}

export function DebatePanel({ trace }: Props) {
  return (
    <section
      role="region"
      aria-label="Internal Skeptic versus Closer debate trace"
      className="debate"
    >
      <header className="debate__head">
        <span aria-hidden="true" className="debate__dot" />
        <span>Internal debate · objection routed</span>
      </header>
      <p className="debate__obj">
        <span className="debate__obj-label">Objection:</span>{" "}
        <span>&ldquo;{trace.objection}&rdquo;</span>
      </p>
      <div className="debate__grid">
        <article aria-label="Skeptic perspective" className="debate__col debate__col--skeptic">
          <h3>Skeptic</h3>
          <p>{trace.skeptic}</p>
        </article>
        <article aria-label="Closer perspective" className="debate__col debate__col--closer">
          <h3>Closer</h3>
          <p>{trace.closer}</p>
        </article>
      </div>

      <style>{`
        .debate {
          background: oklch(0.97 0.04 80);
          border: 1px solid oklch(0.88 0.06 75);
          border-radius: var(--radius-md);
          padding: 12px 14px;
          margin-bottom: 8px;
          font-size: 0.82rem;
        }
        .debate__head {
          display: inline-flex; align-items: center; gap: 8px;
          font-family: var(--font-mono);
          font-size: 0.66rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: oklch(0.45 0.14 60);
          margin-bottom: 8px;
        }
        .debate__dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: oklch(0.66 0.155 38);
        }
        .debate__obj {
          color: var(--ink-soft);
          font-style: italic;
          margin: 0 0 10px;
          line-height: 1.4;
        }
        .debate__obj-label {
          font-style: normal;
          font-weight: 600;
          color: var(--ink);
        }
        .debate__grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        @media (max-width: 600px) {
          .debate__grid { grid-template-columns: 1fr; }
        }
        .debate__col {
          background: var(--surface);
          border: 1px solid var(--line-soft);
          border-radius: var(--radius-sm);
          padding: 10px 12px;
        }
        .debate__col h3 {
          font-size: 0.74rem;
          letter-spacing: 0;
          font-weight: 600;
          margin: 0 0 4px;
        }
        .debate__col--skeptic h3 { color: oklch(0.50 0.16 24); }
        .debate__col--closer h3 { color: oklch(0.45 0.14 145); }
        .debate__col p {
          margin: 0;
          font-size: 0.82rem;
          line-height: 1.4;
          color: var(--ink);
        }
      `}</style>
    </section>
  );
}
