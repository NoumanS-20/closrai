"use client";

import type { DealIQ } from "@/lib/types";

interface Props {
  iq?: DealIQ;
  compact?: boolean;
}

function color(total: number): string {
  if (total >= 75) return "text-emerald-400";
  if (total >= 50) return "text-amber-400";
  if (total >= 25) return "text-orange-400";
  return "text-zinc-500";
}

function tier(total: number): string {
  if (total >= 75) return "hot";
  if (total >= 50) return "warm";
  if (total >= 25) return "cool";
  return "cold";
}

function Bar({ label, value }: { label: string; value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-16 text-zinc-400" id={`bar-label-${label.toLowerCase().replace(/\s+/g, "-")}`}>
        {label}
      </span>
      <div
        className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden"
        role="progressbar"
        aria-labelledby={`bar-label-${label.toLowerCase().replace(/\s+/g, "-")}`}
        aria-valuenow={v}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${v} out of 100`}
      >
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-sky-400 transition-all duration-500"
          style={{ width: `${v}%` }}
        />
      </div>
      <span className="w-7 text-right text-zinc-300 tabular-nums" aria-hidden="true">
        {v}
      </span>
    </div>
  );
}

export function DealIQGauge({ iq, compact }: Props) {
  const total = iq?.total ?? 0;
  const ringSize = compact ? 56 : 96;
  const stroke = compact ? 6 : 8;
  const radius = (ringSize - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (total / 100) * circ;

  const summary = iq
    ? `Score ${total} out of 100, ${tier(total)} lead. ${iq.rationale ?? ""}`
    : "Score not yet available.";

  return (
    <div
      className={compact ? "flex items-center gap-3" : "space-y-3"}
      role="group"
      aria-label="Lead score breakdown"
    >
      <div
        className="relative"
        style={{ width: ringSize, height: ringSize }}
        role="img"
        aria-label={`Score ${total} out of 100`}
      >
        <svg width={ringSize} height={ringSize} className="-rotate-90" aria-hidden="true">
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            stroke="rgb(39 39 42)"
            strokeWidth={stroke}
            fill="transparent"
          />
          <circle
            cx={ringSize / 2}
            cy={ringSize / 2}
            r={radius}
            stroke="url(#iqGrad)"
            strokeWidth={stroke}
            fill="transparent"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
          <defs>
            <linearGradient id="iqGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
        </svg>
        <div
          aria-hidden="true"
          className={`absolute inset-0 flex items-center justify-center ${color(total)} font-semibold ${compact ? "text-base" : "text-2xl"}`}
        >
          {total}
        </div>
      </div>

      {/* Always-present, sr-only live summary for screen readers */}
      <p className="sr-only" aria-live="polite">
        {summary}
      </p>

      {!compact && (
        <div className="space-y-1.5">
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
        <p className="text-xs text-zinc-400 italic leading-snug" aria-hidden="true">
          {iq.rationale}
        </p>
      )}
    </div>
  );
}
