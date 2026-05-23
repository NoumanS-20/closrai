"use client";

import type { DebateTrace } from "@/lib/types";

interface Props {
  trace: DebateTrace;
}

export function DebatePanel({ trace }: Props) {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 my-2 text-xs space-y-2">
      <div className="flex items-center gap-2 text-amber-300 font-medium">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
        Internal debate · objection routed
      </div>
      <div className="text-zinc-400 italic">
        Objection: <span className="text-zinc-200">&ldquo;{trace.objection}&rdquo;</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 p-2">
          <div className="text-rose-300 font-medium mb-1">Skeptic</div>
          <div className="text-zinc-300 leading-snug">{trace.skeptic}</div>
        </div>
        <div className="rounded-lg bg-zinc-900/60 border border-zinc-800 p-2">
          <div className="text-emerald-300 font-medium mb-1">Closer</div>
          <div className="text-zinc-300 leading-snug">{trace.closer}</div>
        </div>
      </div>
    </div>
  );
}
