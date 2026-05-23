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

function bar(label: string, value: number) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-16 text-zinc-400">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-zinc-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-sky-400 transition-all duration-500"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
      <span className="w-7 text-right text-zinc-300 tabular-nums">{value}</span>
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

  return (
    <div className={compact ? "flex items-center gap-3" : "space-y-3"}>
      <div className="relative" style={{ width: ringSize, height: ringSize }}>
        <svg width={ringSize} height={ringSize} className="-rotate-90">
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
        <div className={`absolute inset-0 flex items-center justify-center ${color(total)} font-semibold ${compact ? "text-base" : "text-2xl"}`}>
          {total}
        </div>
      </div>

      {!compact && (
        <div className="space-y-1.5">
          {bar("Need", iq?.need ?? 0)}
          {bar("Intent", iq?.intent ?? 0)}
          {bar("ICP Fit", iq?.icpFit ?? 0)}
          {bar("Authority", iq?.authority ?? 0)}
          {bar("Timing", iq?.timing ?? 0)}
          {bar("Budget", iq?.budget ?? 0)}
          {bar("Sentiment", iq?.sentiment ?? 0)}
        </div>
      )}

      {!compact && iq?.rationale && (
        <p className="text-xs text-zinc-400 italic leading-snug">{iq.rationale}</p>
      )}
    </div>
  );
}
