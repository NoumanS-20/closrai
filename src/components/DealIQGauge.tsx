"use client";

import type { DealIQ, PersonaId } from "@/lib/types";

interface Props {
  iq?: DealIQ;
  compact?: boolean;
  personaId?: PersonaId;
  label?: string;
}

type MetricKey = keyof Omit<DealIQ, "total" | "rationale">;

interface MetricConfig {
  key: MetricKey;
  label: string;
  polarity?: "positive" | "risk";
}

const METRICS: Record<PersonaId, MetricConfig[]> = {
  sales: [
    { key: "need", label: "Need" },
    { key: "intent", label: "Intent" },
    { key: "icpFit", label: "ICP Fit" },
    { key: "authority", label: "Authority" },
    { key: "timing", label: "Timing" },
    { key: "budget", label: "Budget" },
    { key: "sentiment", label: "Sentiment" },
  ],
  support: [
    { key: "intent", label: "Resolution" },
    { key: "need", label: "KB coverage" },
    { key: "budget", label: "Clarity" },
    { key: "authority", label: "Specificity" },
    { key: "timing", label: "Urgency" },
    { key: "icpFit", label: "Escalation risk", polarity: "risk" },
    { key: "sentiment", label: "Sentiment" },
  ],
  care: [
    { key: "budget", label: "Satisfaction" },
    { key: "intent", label: "Resolution" },
    { key: "authority", label: "Loyalty risk", polarity: "risk" },
    { key: "need", label: "Complexity", polarity: "risk" },
    { key: "timing", label: "Urgency" },
    { key: "sentiment", label: "Sentiment" },
  ],
};

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

function Bar({
  label,
  value,
  polarity = "positive",
}: {
  label: string;
  value: number;
  polarity?: "positive" | "risk";
}) {
  const v = Math.max(0, Math.min(100, value));
  const slug = label.toLowerCase().replace(/\s+/g, "-");
  const valueText =
    polarity === "risk"
      ? `${v} out of 100, lower is better`
      : `${v} out of 100`;
  return (
    <div className={"dq-bar" + (polarity === "risk" ? " dq-bar--risk" : "")}>
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
        aria-valuetext={valueText}
      >
        <div className="dq-bar__fill" style={{ width: `${v}%` }} />
      </div>
      <span className="dq-bar__value" aria-hidden="true">
        {v}
      </span>
    </div>
  );
}

export function DealIQGauge({
  iq,
  compact,
  personaId = "sales",
  label = "Lead score",
}: Props) {
  const total = iq?.total ?? 0;
  const ringSize = compact ? 56 : 110;
  const stroke = compact ? 6 : 9;
  const radius = (ringSize - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (total / 100) * circ;

  const summary = iq
    ? `${label} ${total} out of 100, ${tier(total)} tier. ${iq.rationale ?? ""}`
    : "Score not yet available.";

  const ringColor = ringStroke(total);

  return (
    <div
      className={"dq-gauge" + (compact ? " dq-gauge--compact" : "")}
      role="group"
      aria-label={`${label} breakdown`}
    >
      <div
        className="dq-gauge__ring"
        style={{ width: ringSize, height: ringSize }}
        role="img"
        aria-label={`${label} ${total} out of 100`}
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
          {METRICS[personaId].map((metric) => (
            <Bar
              key={metric.key}
              label={metric.label}
              value={iq?.[metric.key] ?? 0}
              polarity={metric.polarity}
            />
          ))}
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
        .dq-bar--risk .dq-bar__fill {
          background: linear-gradient(90deg, oklch(0.72 0.14 62), oklch(0.60 0.17 28));
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
