import Link from "next/link";
import { notFound } from "next/navigation";
import { getLead } from "@/lib/store";
import { DealIQGauge } from "@/components/DealIQGauge";
import { DebatePanel } from "@/components/DebatePanel";
import type { PersonaId } from "@/lib/types";

export const dynamic = "force-dynamic";

const PERSONA_LABEL: Record<PersonaId, { label: string; accent: string }> = {
  sales: { label: "Sales SDR", accent: "text-emerald-300" },
  support: { label: "Support Agent", accent: "text-sky-300" },
  care: { label: "Customer Care", accent: "text-violet-300" },
};

const SCORE_LABEL: Record<PersonaId, string> = {
  sales: "Deal IQ",
  support: "Resolution IQ",
  care: "Care IQ",
};

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) notFound();

  const personaMeta = PERSONA_LABEL[lead.personaId];
  const scoreLabel = SCORE_LABEL[lead.personaId];

  return (
    <main id="main" className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link
          href="/dashboard"
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          ← Back to dashboard
        </Link>

        <header className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className={`text-xs uppercase tracking-wider ${personaMeta.accent} mb-1`}>
              {personaMeta.label}
            </div>
            <h1 className="text-2xl font-semibold">
              {lead.name ?? <span className="text-zinc-500 italic">Anonymous</span>}
            </h1>
            <div className="text-sm text-zinc-400 mt-1">
              {[lead.role, lead.company].filter(Boolean).join(" · ")}
              {lead.email && <span className="ml-2 text-zinc-500">{lead.email}</span>}
              {lead.phone && <span className="ml-2 text-zinc-500">{lead.phone}</span>}
            </div>
          </div>
          {lead.meeting && (
            <div className="rounded-xl border border-sky-500/30 bg-sky-500/5 px-4 py-2 text-sm">
              <div className="text-sky-300 font-medium">Meeting booked</div>
              <div className="text-xs text-zinc-300">
                {new Date(lead.meeting.slotIso).toLocaleString("en-IN")}
              </div>
              <div className="text-xs text-zinc-500">Code: {lead.meeting.confirmationCode}</div>
            </div>
          )}
          {lead.escalation && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-2 text-sm">
              <div className="text-amber-300 font-medium">
                Escalated · {lead.escalation.priority}
              </div>
              <div className="text-xs text-zinc-300">{lead.escalation.reason}</div>
              <div className="text-xs text-zinc-500">Ticket: {lead.escalation.ticketId}</div>
            </div>
          )}
        </header>

        {lead.resolvedSummary && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm">
            <div className="text-emerald-300 text-xs uppercase tracking-wider mb-1">
              Resolution summary
            </div>
            <div className="text-zinc-200">{lead.resolvedSummary}</div>
          </div>
        )}

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          <div className="space-y-6">
            <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <h2 className="text-sm uppercase tracking-wider text-zinc-500 mb-3">
                Transcript
              </h2>
              <div className="space-y-3">
                {lead.transcript.map((m) => (
                  <div key={m.id}>
                    {m.role === "assistant" && m.debate && (
                      <DebatePanel trace={m.debate} />
                    )}
                    <div
                      className={
                        m.role === "user"
                          ? "ml-auto max-w-[80%] bg-emerald-500/10 border border-emerald-500/20 rounded-2xl rounded-br-sm px-4 py-2 text-sm"
                          : "mr-auto max-w-[80%] bg-zinc-900 border border-zinc-800 rounded-2xl rounded-bl-sm px-4 py-2 text-sm"
                      }
                    >
                      {m.content}
                    </div>
                    {m.toolCalls && m.toolCalls.length > 0 && (
                      <div className="mt-1 ml-2 flex flex-wrap gap-1">
                        {m.toolCalls.map((tc, i) => (
                          <span
                            key={i}
                            className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900/60 text-zinc-400"
                          >
                            🛠 {tc.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>

            {lead.followUpEmail && (
              <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
                <h2 className="text-sm uppercase tracking-wider text-emerald-300 mb-3">
                  Auto-drafted follow-up email
                </h2>
                <pre className="whitespace-pre-wrap text-sm font-mono text-zinc-200 leading-relaxed">
                  {lead.followUpEmail}
                </pre>
              </section>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
              <div className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
                {scoreLabel}
              </div>
              <DealIQGauge iq={lead.dealIq} />
            </div>

            {lead.orderLookup && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
                <div className="text-xs uppercase tracking-wider text-zinc-500">
                  Order lookup
                </div>
                <div className="text-sm text-zinc-200">{lead.orderLookup.orderId}</div>
                <div className="text-xs text-zinc-400 capitalize">
                  Status: {lead.orderLookup.status.replace(/_/g, " ")}
                </div>
                <div className="text-xs text-zinc-400">
                  Total: ₹{lead.orderLookup.totalInr.toLocaleString("en-IN")}
                </div>
                <div className="text-xs text-zinc-500 italic">
                  Placed{" "}
                  {new Date(lead.orderLookup.placedIso).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                  })}
                </div>
                <ul className="pt-2 border-t border-zinc-800 text-xs text-zinc-400 space-y-1">
                  {lead.orderLookup.items.map((it, i) => (
                    <li key={i}>
                      {it.qty}× {it.name}{" "}
                      <span className="text-zinc-500">
                        — ₹{it.priceInr.toLocaleString("en-IN")}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {lead.enrichment && (
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-2">
                <div className="text-xs uppercase tracking-wider text-zinc-500">
                  Company enrichment
                </div>
                <div className="text-sm text-zinc-200">{lead.enrichment.domain}</div>
                {lead.enrichment.industry && (
                  <div className="text-xs text-zinc-400">
                    Industry: {lead.enrichment.industry}
                  </div>
                )}
                {lead.enrichment.techStack && lead.enrichment.techStack.length > 0 && (
                  <div className="text-xs text-zinc-400">
                    Stack: {lead.enrichment.techStack.join(", ")}
                  </div>
                )}
                <p className="text-xs text-zinc-500 italic leading-snug">
                  {lead.enrichment.summary}
                </p>
                <div className="text-[10px] uppercase tracking-wider text-zinc-600 pt-1">
                  Source: {lead.enrichment.source}
                </div>
              </div>
            )}

            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 space-y-1 text-xs">
              <div className="text-zinc-500 uppercase tracking-wider mb-2">Meta</div>
              <div className="text-zinc-400">
                Persona: <span className="text-zinc-200">{personaMeta.label}</span>
              </div>
              <div className="text-zinc-400">
                Status: <span className="text-zinc-200">{lead.status}</span>
              </div>
              <div className="text-zinc-400">
                Messages: <span className="text-zinc-200">{lead.transcript.length}</span>
              </div>
              <div className="text-zinc-400">
                Created:{" "}
                <span className="text-zinc-200">
                  {new Date(lead.createdAt).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
