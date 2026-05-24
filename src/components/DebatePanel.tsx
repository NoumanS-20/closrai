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
      className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3 my-2 text-xs space-y-2"
    >
      <div className="flex items-center gap-2 text-amber-300 font-medium">
        <span
          aria-hidden="true"
          className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400"
        />
        <span>Internal debate · objection routed</span>
      </div>
      <p className="text-zinc-400 italic">
        <span className="font-medium text-zinc-300">Objection:</span>{" "}
        <span className="text-zinc-200">&ldquo;{trace.objection}&rdquo;</span>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <article
          aria-label="Skeptic perspective"
          className="rounded-lg bg-zinc-900/60 border border-zinc-800 p-2"
        >
          <h3 className="text-rose-300 font-medium mb-1 text-xs">Skeptic</h3>
          <p className="text-zinc-300 leading-snug">{trace.skeptic}</p>
        </article>
        <article
          aria-label="Closer perspective"
          className="rounded-lg bg-zinc-900/60 border border-zinc-800 p-2"
        >
          <h3 className="text-emerald-300 font-medium mb-1 text-xs">Closer</h3>
          <p className="text-zinc-300 leading-snug">{trace.closer}</p>
        </article>
      </div>
    </section>
  );
}
