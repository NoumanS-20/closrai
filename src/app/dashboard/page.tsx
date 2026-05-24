import Link from "next/link";
import { listLeads } from "@/lib/store";
import type { Lead, PersonaId } from "@/lib/types";
import { SiteHeader } from "@/components/SiteHeader";

export const dynamic = "force-dynamic";

const PERSONA_LABEL: Record<PersonaId, string> = {
  sales: "Sales",
  support: "Support",
  care: "Care",
};

function statusLabel(status: string): string {
  return status.replace(/_/g, " ");
}

function statusClass(status: string): string {
  if (status === "qualified" || status === "resolved") return "status status--ok";
  if (status === "meeting_booked") return "status status--info";
  if (status === "escalated") return "status status--warn";
  if (status === "disqualified") return "status status--bad";
  return "status status--new";
}

function dqColor(total: number): string {
  if (total >= 75) return "oklch(0.50 0.16 145)";
  if (total >= 50) return "oklch(0.66 0.155 38)";
  if (total >= 25) return "oklch(0.62 0.16 60)";
  return "oklch(0.55 0.005 60)";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ persona?: string }>;
}) {
  const { persona: personaFilter } = await searchParams;
  const all = (await listLeads()).sort((a, b) => b.updatedAt - a.updatedAt);
  const leads = personaFilter
    ? all.filter((l) => l.personaId === personaFilter)
    : all;

  const counts = {
    all: all.length,
    sales: all.filter((l) => l.personaId === "sales").length,
    support: all.filter((l) => l.personaId === "support").length,
    care: all.filter((l) => l.personaId === "care").length,
  };

  const qualified = leads.filter(
    (l: Lead) =>
      l.status === "qualified" ||
      l.status === "meeting_booked" ||
      l.status === "resolved",
  ).length;
  const booked = leads.filter((l: Lead) => l.status === "meeting_booked").length;
  const escalated = leads.filter((l: Lead) => l.status === "escalated").length;

  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="dash">
        <div className="shell dash__inner">
          <header className="dash__head">
            <div>
              <p className="eyebrow">Operations</p>
              <h1>Today&rsquo;s conversations</h1>
              <p className="dash__sub">
                ClosrAI Platform · unified inbox across Sales, Support, and
                Customer Care
              </p>
            </div>
            <div className="dash__actions">
              <Link href="/chat" className="btn btn--ghost">
                Bot picker
              </Link>
            </div>
          </header>

          <div className="dash__stats" role="list" aria-label="Top-line metrics">
            <Stat label="Total leads" value={leads.length} />
            <Stat label="Qualified / resolved" value={qualified} accent="ok" />
            <Stat label="Meetings booked" value={booked} accent="info" />
            <Stat label="Escalated" value={escalated} accent="warn" />
          </div>

          <section className="dash__main">
            <header className="dash__main-head">
              <div>
                <h2>Conversations</h2>
                <p>
                  {leads.length} of {all.length} shown
                </p>
              </div>
              <nav aria-label="Filter conversations">
                <ul className="filter-pills">
                  <FilterPill href="/dashboard" label={`All · ${counts.all}`} active={!personaFilter} />
                  <FilterPill
                    href="/dashboard?persona=sales"
                    label={`Sales · ${counts.sales}`}
                    active={personaFilter === "sales"}
                  />
                  <FilterPill
                    href="/dashboard?persona=support"
                    label={`Support · ${counts.support}`}
                    active={personaFilter === "support"}
                  />
                  <FilterPill
                    href="/dashboard?persona=care"
                    label={`Care · ${counts.care}`}
                    active={personaFilter === "care"}
                  />
                </ul>
              </nav>
            </header>

            <div className="dash__table-wrap">
              <table className="dash__table">
                <caption className="sr-only">
                  Leads {personaFilter ? `filtered to ${personaFilter} persona` : "across all personas"},
                  sorted by most recently updated.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Lead</th>
                    <th scope="col">Persona</th>
                    <th scope="col">Company / Order</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="num">Score</th>
                    <th scope="col" className="num">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.length === 0 && (
                    <tr>
                      <td colSpan={6} className="dash__empty">
                        No leads in this view. Open the bot picker to seed the pipeline.
                      </td>
                    </tr>
                  )}
                  {leads.map((l) => (
                    <tr key={l.id}>
                      <td>
                        <Link href={`/dashboard/${l.id}`} className="lead-link">
                          {l.name ?? <span className="muted">Anonymous</span>}
                        </Link>
                        {l.email && <div className="muted-sm">{l.email}</div>}
                      </td>
                      <td>
                        <span className={"persona-tag persona-tag--" + l.personaId}>
                          <span className="sr-only">Persona: </span>
                          {PERSONA_LABEL[l.personaId]}
                        </span>
                      </td>
                      <td>
                        {l.company ?? l.orderLookup?.orderId ?? (
                          <span className="muted">—</span>
                        )}
                        {l.enrichment?.industry && (
                          <div className="muted-sm">{l.enrichment.industry}</div>
                        )}
                      </td>
                      <td>
                        <span className={statusClass(l.status)}>
                          <span className="sr-only">Status: </span>
                          {statusLabel(l.status)}
                        </span>
                      </td>
                      <td className="num">
                        <span
                          className="dq-cell"
                          style={{ color: dqColor(l.dealIq?.total ?? 0) }}
                        >
                          {l.dealIq?.total ?? 0}
                        </span>
                      </td>
                      <td className="num muted-sm">
                        {new Date(l.updatedAt).toLocaleString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "2-digit",
                          month: "short",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <style>{`
          .dash { padding: 40px 0 100px; }
          .dash__inner { display: flex; flex-direction: column; gap: 28px; }
          .dash__head {
            display: flex; justify-content: space-between; align-items: flex-end;
            gap: 20px; flex-wrap: wrap;
          }
          .dash__head h1 { font-size: clamp(2rem, 3.5vw, 2.6rem); margin: 8px 0 4px; }
          .dash__head p.dash__sub { color: var(--ink-soft); margin: 0; font-size: 0.95rem; }
          .dash__actions { display: flex; gap: 10px; }

          .dash__stats {
            display: grid; grid-template-columns: repeat(4, 1fr);
            gap: 14px;
            list-style: none; padding: 0; margin: 0;
          }
          @media (max-width: 760px) { .dash__stats { grid-template-columns: 1fr 1fr; } }

          .dash__stat {
            background: var(--surface);
            border: 1px solid var(--line-soft);
            border-radius: var(--radius-lg);
            padding: 18px 20px;
            display: flex; flex-direction: column; gap: 4px;
            box-shadow: var(--shadow-soft);
          }
          .dash__stat strong {
            font-family: var(--font-display); font-size: 2.2rem; line-height: 1;
            letter-spacing: -0.03em;
            margin-top: 2px;
          }
          .dash__stat--ok strong { color: oklch(0.40 0.14 145); }
          .dash__stat--info strong { color: oklch(0.42 0.14 252); }
          .dash__stat--warn strong { color: oklch(0.45 0.16 60); }

          .dash__main {
            background: var(--surface);
            border: 1px solid var(--line-soft);
            border-radius: var(--radius-lg);
            box-shadow: var(--shadow-soft);
            overflow: hidden;
          }
          .dash__main-head {
            padding: 20px;
            display: flex; justify-content: space-between; flex-wrap: wrap;
            gap: 18px; align-items: flex-end;
            border-bottom: 1px solid var(--line-soft);
          }
          .dash__main-head h2 { font-size: 1.35rem; margin: 0 0 2px; }
          .dash__main-head p { color: var(--ink-mute); margin: 0; font-size: 0.85rem; }

          .filter-pills {
            list-style: none; padding: 0; margin: 0;
            display: flex; gap: 6px; flex-wrap: wrap;
          }
          .filter-pill {
            padding: 6px 14px;
            border-radius: var(--radius-pill);
            border: 1px solid var(--line);
            font-size: 0.84rem;
            color: var(--ink-soft);
            cursor: pointer;
            background: var(--surface);
            text-decoration: none;
            display: inline-block;
          }
          .filter-pill:hover { background: var(--surface-2); color: var(--ink); text-decoration: none; }
          .filter-pill.is-active {
            background: var(--ink);
            color: var(--surface);
            border-color: var(--ink);
          }

          .dash__table-wrap { overflow-x: auto; }
          .dash__table {
            width: 100%;
            border-collapse: collapse;
            font-size: 0.92rem;
          }
          .dash__table th {
            text-align: left;
            font-weight: 500;
            font-size: 0.74rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: var(--ink-mute);
            padding: 14px 20px;
            border-bottom: 1px solid var(--line-soft);
            background: var(--surface-2);
          }
          .dash__table th.num { text-align: right; }
          .dash__table td {
            padding: 14px 20px;
            border-bottom: 1px solid var(--line-soft);
            vertical-align: top;
          }
          .dash__table td.num { text-align: right; font-variant-numeric: tabular-nums; }
          .dash__table tr:last-child td { border-bottom: 0; }
          .dash__table tr:hover { background: oklch(0.99 0.004 70); }

          .lead-link { color: var(--ink); font-weight: 500; }
          .lead-link:hover { color: var(--terracotta-deep); text-decoration: none; }

          .muted { color: var(--ink-mute); font-style: italic; }
          .muted-sm { color: var(--ink-mute); font-size: 0.78rem; margin-top: 2px; }

          .dash__empty {
            text-align: center;
            padding: 60px 20px;
            color: var(--ink-mute);
          }

          .persona-tag {
            display: inline-block;
            padding: 3px 10px;
            border-radius: var(--radius-pill);
            font-size: 0.72rem;
            font-weight: 500;
            border: 1px solid;
            text-transform: capitalize;
          }
          .persona-tag--sales {
            color: oklch(0.34 0.13 158);
            border-color: oklch(0.80 0.09 158);
            background: oklch(0.96 0.04 158);
          }
          .persona-tag--support {
            color: oklch(0.36 0.13 238);
            border-color: oklch(0.80 0.08 235);
            background: oklch(0.96 0.035 235);
          }
          .persona-tag--care {
            color: oklch(0.38 0.13 305);
            border-color: oklch(0.80 0.08 305);
            background: oklch(0.96 0.035 305);
          }

          .status {
            display: inline-block;
            padding: 3px 10px;
            border-radius: var(--radius-pill);
            font-size: 0.72rem;
            font-weight: 500;
            border: 1px solid;
            text-transform: capitalize;
          }
          .status--ok { color: oklch(0.40 0.12 145); border-color: oklch(0.80 0.08 145); background: oklch(0.96 0.05 145); }
          .status--info { color: oklch(0.40 0.14 252); border-color: oklch(0.80 0.10 252); background: oklch(0.96 0.04 252); }
          .status--warn { color: oklch(0.40 0.14 60); border-color: oklch(0.80 0.10 70); background: oklch(0.96 0.06 75); }
          .status--bad { color: oklch(0.40 0.16 25); border-color: oklch(0.80 0.10 25); background: oklch(0.97 0.04 25); }
          .status--new { color: var(--ink-soft); border-color: var(--line); background: var(--surface-2); }

          .dq-cell { font-family: var(--font-mono); font-weight: 600; font-size: 1rem; }
        `}</style>
      </main>
    </>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "ok" | "info" | "warn";
}) {
  return (
    <div className={"dash__stat" + (accent ? " dash__stat--" + accent : "")} role="listitem">
      <span className="eyebrow">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function FilterPill({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={"filter-pill" + (active ? " is-active" : "")}
      >
        {active && <span className="sr-only">Current filter: </span>}
        {label}
      </Link>
    </li>
  );
}
