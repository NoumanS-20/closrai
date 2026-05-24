"use client";

import type { DealIQ } from "@/lib/types";

interface Props {
  iq?: DealIQ;
  compact?: boolean;
}

function ringStroke(total: number): string {
  if (total >= 75) return "oklch(0.50 0.16 145)";
  if (total >= 50) return "oklch(0.66 0.155 38)";
  if (total >= 25) return "oklch(0.62 0.16 60)";
  return "oklch(0.55 0.005 60)";
}

function tier(total: number): string {
  if (total >= 75) return "hot";
  if (total >= 50) return "warm";
  if (total >= 25) return "cool";
  return "cold";
}

function Bar({ label, value }: { label: string; value: number }) {
  const v = Math.max(0, Math.min(100, value));
  const slug = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <div className="dq-bar">
      <span className="dq-bar__label" id={`bar-label-${slug}`}>
        {label}
      </span>
      <div
        className="dq-bar__track"
        role="progressbar"
        aria-labelledby={`bar-label-${slug}`}
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${v} out of 100`}
      >
        <div className="dq-bar__fill" style={{ width: `${v}%` }} />
      </div>
      <span className="dq-bar__value" aria-hidden="true">
        {v}
      </span>
    </div>
  );
}

export function DealIQGauge({ iq, compact }: Props) {
  const total = iq?.total ?? 0;
  const ringSize = compact ? 56 : 110;
  const stroke = compact ? 6 : 9;
  const radius = (ringSize - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (total / 100) * circ;

  const summary = iq
    ? `Score ${total} out of 100, ${tier(total)} lead. ${iq.rationale ?? ""}`
    : "Score not yet available.";

  const ringColor = ringStroke(total);

  return (
    <div
      className={"dq-gauge" + (compact ? " dq-gauge--compact" : "")}
      role="group"
      aria-label="Lead score breakdown"
    >
      <div
        className="dq-gauge__ring"
        style={{ width: ringSize, height: ringSize }}
        role="img"
        aria-label={`Score ${total} out of 100`}
      >
        <svg
          width={ringSize}
          height={ringSize}
          viewBox={`0 0 ${ringSize} ${ringSize}`}
          aria-hidden="true"
        >
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke="oklch(0.92 0.004 70)"
            strokeWidth={stroke}
          />
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            fill="none"
            stroke={ringColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
            style={{ transition: "stroke-dashoffset 700ms cubic-bezier(.2,.7,.2,1)" }}
          />
        </svg>
        <div className="dq-gauge__num" aria-hidden="true">
          {total}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {summary}
      </p>

      {!compact && (
        <div className="dq-gauge__bars">
          <Bar label="Need" value={iq?.need ?? 0} />
          <Bar label="Intent" value={iq?.intent ?? 0} />
          <Bar label="ICP Fit" value={iq?.icpFit ?? 0} />
          <Bar label="Authority" value={iq?.authority ?? 0} />
          <Bar label="Timing" value={iq?.timing ?? 0} />
          <Bar label="Budget" value={iq?.budget ?? 0} />
          <Bar label="Sentiment" value={iq?.sentiment ?? 0} />
        </div>
      )}

      {!compact && iq?.rationale && (
        <p className="dq-gauge__rationale" aria-hidden="true">
          {iq.rationale}
        </p>
      )}

      <style>{`
        .dq-gauge { display: flex; flex-direction: column; gap: 14px; align-items: stretch; }
        .dq-gauge--compact { flex-direction: row; align-items: center; gap: 12px; }
        .dq-gauge__ring {
          position: relative;
          margin: 0 auto;
        }
        .dq-gauge__num {
          position: absolute;
          inset: 0;
          display: grid; place-items: center;
          font-family: var(--font-display);
          font-weight: 600;
          font-size: 1.9rem;
          letter-spacing: -0.03em;
          color: var(--ink);
        }
        .dq-gauge--compact .dq-gauge__num { font-size: 1.05rem; }

        .dq-gauge__bars {
          display: flex; flex-direction: column; gap: 8px;
        }
        .dq-bar {
          display: grid;
          grid-template-columns: 78px 1fr 28px;
          gap: 10px; align-items: center;
        }
        .dq-bar__label {
          font-size: 0.78rem;
          color: var(--ink-soft);
        }
        .dq-bar__track {
          height: 6px;
          border-radius: 999px;
          background: var(--surface-2);
          border: 1px solid var(--line-soft);
          overflow: hidden;
        }
        .dq-bar__fill {
          height: 100%;
          border-radius: 999px;
          background: linear-gradient(90deg, oklch(0.66 0.155 38), oklch(0.80 0.13 80));
          transition: width 500ms var(--ease);
        }
        .dq-bar__value {
          font-family: var(--font-mono);
          font-size: 0.78rem;
          color: var(--ink);
          text-align: right;
        }

        .dq-gauge__rationale {
          font-size: 0.82rem;
          color: var(--ink-mute);
          font-style: italic;
          margin: 0;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
}
