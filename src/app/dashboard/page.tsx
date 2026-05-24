import Link from "next/link";
import { listLeads } from "@/lib/store";
import type { Lead, PersonaId } from "@/lib/types";
import { A11yPanelButton } from "@/components/A11ySettings";

export const dynamic = "force-dynamic";

const PERSONA_META: Record<PersonaId, { label: string; tagBg: string; tagText: string; tagBorder: string }> = {
  sales: {
    label: "Sales",
    tagBg: "bg-emerald-500/10",
    tagText: "text-emerald-300",
    tagBorder: "border-emerald-500/30",
  },
  support: {
    label: "Support",
    tagBg: "bg-sky-500/10",
    tagText: "text-sky-300",
    tagBorder: "border-sky-500/30",
  },
  care: {
    label: "Care",
    tagBg: "bg-violet-500/10",
    tagText: "text-violet-300",
    tagBorder: "border-violet-500/30",
  },
};

function statusBadge(status: string) {
  const map: Record<string, string> = {
    new: "bg-zinc-800 text-zinc-300 border-zinc-700",
    qualified: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    meeting_booked: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    resolved: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    escalated: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    disqualified: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  };
  const cls = map[status] ?? map.new;
  const labelText = status.replace(/_/g, " ");
  return (
    <span
      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${cls}`}
    >
      <span className="sr-only">Status: </span>
      {labelText}
    </span>
  );
}

function personaBadge(personaId: PersonaId) {
  const meta = PERSONA_META[personaId];
  return (
    <span
      className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${meta.tagBg} ${meta.tagText} ${meta.tagBorder}`}
    >
      <span className="sr-only">Persona: </span>
      {meta.label}
    </span>
  );
}

function iqColor(total: number): string {
  if (total >= 75) return "text-emerald-300";
  if (total >= 50) return "text-amber-300";
  if (total >= 25) return "text-orange-300";
  return "text-zinc-500";
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
    (l: Lead) => l.status === "qualified" || l.status === "meeting_booked" || l.status === "resolved",
  ).length;
  const booked = leads.filter((l: Lead) => l.status === "meeting_booked").length;
  const escalated = leads.filter((l: Lead) => l.status === "escalated").length;

  return (
    <main id="main" className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Founder Dashboard</h1>
            <p className="text-sm text-zinc-400">
              ClosrAI Platform · unified inbox across Sales, Support, and Customer Care
            </p>
          </div>
          <div className="flex items-center gap-2">
            <A11yPanelButton />
            <Link
              href="/"
              className="text-sm text-zinc-400 hover:text-zinc-200 px-3 py-1.5"
            >
              Home
            </Link>
            <Link
              href="/chat"
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-medium transition-colors"
            >
              Open bot picker ↗
            </Link>
          </div>
        </header>

        <nav aria-label="Filter leads by persona" className="flex gap-2 flex-wrap">
          <FilterPill href="/dashboard" label={`All · ${counts.all}`} active={!personaFilter} />
          <FilterPill href="/dashboard?persona=sales" label={`Sales · ${counts.sales}`} active={personaFilter === "sales"} accent="emerald" />
          <FilterPill href="/dashboard?persona=support" label={`Support · ${counts.support}`} active={personaFilter === "support"} accent="sky" />
          <FilterPill href="/dashboard?persona=care" label={`Care · ${counts.care}`} active={personaFilter === "care"} accent="violet" />
        </nav>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" role="group" aria-label="Pipeline summary">
          <Stat label="Total" value={leads.length} />
          <Stat label="Qualified / resolved" value={qualified} accent="emerald" />
          <Stat label="Meetings booked" value={booked} accent="sky" />
          <Stat label="Escalated" value={escalated} accent="amber" />
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
          <table className="w-full text-sm">
            <caption className="sr-only">
              Leads {personaFilter ? `filtered to ${personaFilter} persona` : "across all personas"}, sorted by most recently updated.
            </caption>
            <thead className="bg-zinc-900/50 text-zinc-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-2.5">Lead</th>
                <th className="text-left px-4 py-2.5">Persona</th>
                <th className="text-left px-4 py-2.5">Company / Order</th>
                <th className="text-left px-4 py-2.5">Status</th>
                <th className="text-right px-4 py-2.5">Score</th>
                <th className="text-right px-4 py-2.5">Updated</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-zinc-500">
                    No leads in this view. Open the bot picker to seed the pipeline.
                  </td>
                </tr>
              )}
              {leads.map((l) => (
                <tr
                  key={l.id}
                  className="border-t border-zinc-800/80 hover:bg-zinc-900/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/${l.id}`}
                      className="text-zinc-100 hover:text-emerald-300 transition-colors"
                    >
                      {l.name ?? <span className="text-zinc-500 italic">Anonymous</span>}
                    </Link>
                    {l.email && <div className="text-xs text-zinc-500">{l.email}</div>}
                  </td>
                  <td className="px-4 py-3">{personaBadge(l.personaId)}</td>
                  <td className="px-4 py-3 text-zinc-300">
                    {l.company ?? l.orderLookup?.orderId ?? (
                      <span className="text-zinc-600">—</span>
                    )}
                    {l.enrichment?.industry && (
                      <div className="text-xs text-zinc-500">{l.enrichment.industry}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">{statusBadge(l.status)}</td>
                  <td
                    className={`px-4 py-3 text-right tabular-nums font-medium ${iqColor(l.dealIq?.total ?? 0)}`}
                  >
                    {l.dealIq?.total ?? 0}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-zinc-500 tabular-nums">
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
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent?: "emerald" | "sky" | "amber";
}) {
  const colors: Record<string, string> = {
    emerald: "text-emerald-300",
    sky: "text-sky-300",
    amber: "text-amber-300",
  };
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
      <div className="text-xs uppercase tracking-wider text-zinc-500">{label}</div>
      <div
        className={`text-2xl font-semibold mt-1 ${
          accent ? colors[accent] : "text-zinc-100"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function FilterPill({
  href,
  label,
  active,
  accent,
}: {
  href: string;
  label: string;
  active: boolean;
  accent?: "emerald" | "sky" | "violet";
}) {
  const baseColor = active
    ? accent === "sky"
      ? "border-sky-500/60 text-sky-200 bg-sky-500/10"
      : accent === "violet"
      ? "border-violet-500/60 text-violet-200 bg-violet-500/10"
      : "border-emerald-500/60 text-emerald-200 bg-emerald-500/10"
    : "border-zinc-800 text-zinc-400 hover:text-zinc-200";
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${baseColor}`}
    >
      {active && <span className="sr-only">Current filter: </span>}
      {label}
    </Link>
  );
}
