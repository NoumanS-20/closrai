import Link from "next/link";
import { notFound } from "next/navigation";
import { getLead } from "@/lib/store";
import { DealIQGauge } from "@/components/DealIQGauge";
import { DebatePanel } from "@/components/DebatePanel";
import { SiteHeader } from "@/components/SiteHeader";
import type { PersonaId } from "@/lib/types";

export const dynamic = "force-dynamic";

const PERSONA_LABEL: Record<PersonaId, string> = {
  sales: "Sales SDR",
  support: "Support Agent",
  care: "Customer Care",
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

  const personaLabel = PERSONA_LABEL[lead.personaId];
  const scoreLabel = SCORE_LABEL[lead.personaId];

  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="lead">
        <div className="shell lead__inner">
          <Link href="/dashboard" className="lead__back">
            ← Back to dashboard
          </Link>

          <header className="lead__head">
            <div>
              <p className="eyebrow">{personaLabel}</p>
              <h1>
                {lead.name ?? <span className="lead__anon">Anonymous</span>}
              </h1>
              <p className="lead__meta">
                {[lead.role, lead.company].filter(Boolean).join(" · ")}
                {lead.email && <span className="lead__sep">{lead.email}</span>}
                {lead.phone && <span className="lead__sep">{lead.phone}</span>}
              </p>
            </div>
            <div className="lead__head-tags">
              {lead.meeting && (
                <div className="status-tile status-tile--info">
                  <div className="status-tile__label">Meeting booked</div>
                  <div>{new Date(lead.meeting.slotIso).toLocaleString("en-IN")}</div>
                  <div className="status-tile__code">Code: {lead.meeting.confirmationCode}</div>
                </div>
              )}
              {lead.escalation && (
                <div className="status-tile status-tile--warn">
                  <div className="status-tile__label">
                    Escalated · {lead.escalation.priority}
                  </div>
                  <div>{lead.escalation.reason}</div>
                  <div className="status-tile__code">
                    Ticket: {lead.escalation.ticketId}
                  </div>
                </div>
              )}
            </div>
          </header>

          {lead.resolvedSummary && (
            <div className="resolved">
              <p className="eyebrow">Resolution summary</p>
              <p>{lead.resolvedSummary}</p>
            </div>
          )}

          <div className="lead__grid">
            <div className="lead__main">
              <section className="card lead__transcript">
                <h2 className="eyebrow">Transcript</h2>
                <div className="lead__messages">
                  {lead.transcript.map((m) => (
                    <article
                      key={m.id}
                      className={"msg msg--" + (m.role === "user" ? "user" : "bot")}
                      aria-label={m.role === "user" ? "Visitor said" : "Bot said"}
                    >
                      {m.role === "assistant" && m.debate && (
                        <DebatePanel trace={m.debate} />
                      )}
                      <div className="msg__bubble">{m.content}</div>
                      {m.toolCalls && m.toolCalls.length > 0 && (
                        <ul className="msg__tools">
                          {m.toolCalls.map((tc, i) => (
                            <li key={i}>🛠 {tc.name}</li>
                          ))}
                        </ul>
                      )}
                    </article>
                  ))}
                </div>
              </section>

              {lead.followUpEmail && (
                <section className="card lead__email">
                  <h2 className="eyebrow">Auto-drafted follow-up email</h2>
                  <pre>{lead.followUpEmail}</pre>
                </section>
              )}
            </div>

            <aside className="lead__rail" aria-label="Signals">
              <section className="card rail-card">
                <p className="eyebrow">{scoreLabel}</p>
                <DealIQGauge iq={lead.dealIq} />
              </section>

              {lead.orderLookup && (
                <section className="card rail-card">
                  <p className="eyebrow">Order lookup</p>
                  <div className="rail-row"><strong>{lead.orderLookup.orderId}</strong></div>
                  <div className="rail-row rail-row--mute">
                    Status: <span className="rail-cap">{lead.orderLookup.status.replace(/_/g, " ")}</span>
                  </div>
                  <div className="rail-row rail-row--mute">
                    Total: ₹{lead.orderLookup.totalInr.toLocaleString("en-IN")}
                  </div>
                  <div className="rail-row rail-row--mute">
                    Placed{" "}
                    {new Date(lead.orderLookup.placedIso).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </div>
                  <ul className="rail-items">
                    {lead.orderLookup.items.map((it, i) => (
                      <li key={i}>
                        {it.qty}× {it.name}{" "}
                        <span className="rail-row--mute">
                          — ₹{it.priceInr.toLocaleString("en-IN")}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {lead.enrichment && (
                <section className="card rail-card">
                  <p className="eyebrow">Company enrichment</p>
                  <div className="rail-row"><strong>{lead.enrichment.domain}</strong></div>
                  {lead.enrichment.industry && (
                    <div className="rail-row rail-row--mute">
                      Industry: {lead.enrichment.industry}
                    </div>
                  )}
                  {lead.enrichment.techStack && lead.enrichment.techStack.length > 0 && (
                    <div className="rail-row rail-row--mute">
                      Stack: {lead.enrichment.techStack.join(", ")}
                    </div>
                  )}
                  <p className="rail-summary">{lead.enrichment.summary}</p>
                  <p className="eyebrow rail-source">Source: {lead.enrichment.source}</p>
                </section>
              )}

              <section className="card rail-card">
                <p className="eyebrow">Meta</p>
                <div className="rail-row rail-row--mute">Persona: <strong>{personaLabel}</strong></div>
                <div className="rail-row rail-row--mute">Status: <strong>{lead.status}</strong></div>
                <div className="rail-row rail-row--mute">Messages: <strong>{lead.transcript.length}</strong></div>
                <div className="rail-row rail-row--mute">
                  Created:{" "}
                  <strong>{new Date(lead.createdAt).toLocaleString("en-IN")}</strong>
                </div>
              </section>
            </aside>
          </div>
        </div>

        <style>{`
          .lead { padding: 32px 0 100px; }
          .lead__inner { display: flex; flex-direction: column; gap: 20px; }
          .lead__back {
            font-size: 0.85rem;
            color: var(--ink-soft);
          }
          .lead__head {
            display: flex; justify-content: space-between; align-items: flex-start;
            gap: 18px; flex-wrap: wrap;
            padding-bottom: 20px;
            border-bottom: 1px solid var(--line-soft);
          }
          .lead__head h1 { font-size: clamp(1.8rem, 3.2vw, 2.2rem); margin: 6px 0 4px; }
          .lead__anon { color: var(--ink-mute); font-style: italic; font-weight: 400; }
          .lead__meta { color: var(--ink-soft); margin: 0; font-size: 0.95rem; }
          .lead__sep { margin-left: 12px; color: var(--ink-mute); }
          .lead__head-tags { display: flex; gap: 10px; flex-wrap: wrap; }

          .status-tile {
            background: var(--surface);
            border: 1px solid var(--line);
            border-radius: var(--radius-md);
            padding: 12px 16px;
            font-size: 0.85rem;
            min-width: 200px;
          }
          .status-tile__label { font-weight: 600; font-size: 0.9rem; margin-bottom: 2px; }
          .status-tile__code { color: var(--ink-mute); font-size: 0.78rem; margin-top: 2px; }
          .status-tile--info {
            border-color: oklch(0.80 0.10 252);
            background: oklch(0.97 0.04 252);
            color: oklch(0.30 0.14 252);
          }
          .status-tile--warn {
            border-color: oklch(0.80 0.10 70);
            background: oklch(0.97 0.05 75);
            color: oklch(0.35 0.14 60);
          }

          .resolved {
            background: oklch(0.96 0.05 145);
            border: 1px solid oklch(0.80 0.08 145);
            border-radius: var(--radius-md);
            padding: 12px 16px;
            color: oklch(0.30 0.10 145);
          }
          .resolved p:last-child { margin: 4px 0 0; color: var(--ink); }

          .lead__grid {
            display: grid;
            grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
            gap: 22px;
          }
          @media (max-width: 1080px) { .lead__grid { grid-template-columns: 1fr; } }

          .lead__main { display: flex; flex-direction: column; gap: 18px; }

          .lead__transcript { padding: 22px; }
          .lead__transcript h2 { margin-bottom: 14px; }
          .lead__messages { display: flex; flex-direction: column; gap: 12px; }
          .lead__messages .msg { max-width: 80%; }
          .lead__messages .msg--user { align-self: flex-end; }
          .msg__bubble {
            padding: 12px 16px;
            border-radius: 18px;
            font-size: 0.95rem;
            line-height: 1.45;
            white-space: pre-wrap;
          }
          .msg--user .msg__bubble {
            background: var(--ink);
            color: var(--surface);
            border-bottom-right-radius: 6px;
          }
          .msg--bot .msg__bubble {
            background: var(--surface-2);
            color: var(--ink);
            border: 1px solid var(--line-soft);
            border-bottom-left-radius: 6px;
          }
          .msg__tools {
            list-style: none; padding: 0; margin: 6px 0 0;
            display: flex; flex-wrap: wrap; gap: 4px;
          }
          .msg__tools li {
            font-family: var(--font-mono);
            font-size: 0.62rem;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            padding: 2px 8px;
            border-radius: var(--radius-pill);
            background: var(--surface);
            border: 1px solid var(--line);
            color: var(--ink-mute);
          }

          .lead__email { padding: 22px; }
          .lead__email pre {
            font-family: var(--font-mono);
            white-space: pre-wrap;
            font-size: 0.9rem;
            line-height: 1.55;
            margin: 10px 0 0;
            color: var(--ink);
          }

          .lead__rail { display: flex; flex-direction: column; gap: 14px; }
          .rail-card { padding: 18px 20px; display: flex; flex-direction: column; gap: 8px; }
          .rail-row { display: flex; gap: 6px; align-items: baseline; font-size: 0.9rem; }
          .rail-row--mute { color: var(--ink-soft); font-size: 0.82rem; }
          .rail-row--mute strong { color: var(--ink); }
          .rail-cap { text-transform: capitalize; }
          .rail-items {
            list-style: none; padding: 0; margin: 8px 0 0;
            display: flex; flex-direction: column; gap: 4px;
            border-top: 1px solid var(--line-soft);
            padding-top: 10px;
            font-size: 0.82rem;
            color: var(--ink-soft);
          }
          .rail-summary {
            color: var(--ink-mute);
            font-size: 0.82rem;
            font-style: italic;
            margin: 4px 0 0;
            line-height: 1.4;
          }
          .rail-source {
            font-size: 0.68rem !important;
            margin-top: 4px !important;
          }
        `}</style>
      </main>
    </>
  );
}
