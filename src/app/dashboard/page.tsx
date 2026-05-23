import Link from "next/link";
import { listLeads } from "@/lib/store";

export const dynamic = "force-dynamic";

function statusBadge(status: string) {
  const map: Record<string, string> = {
    new: "bg-zinc-800 text-zinc-300 border-zinc-700",
    qualified: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    meeting_booked: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    disqualified: "bg-rose-500/10 text-rose-300 border-rose-500/30",
  };
  const cls = map[status] ?? map.new;
  return (
    <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${cls}`}>
      {status.replace("_", " ")}
    </span>
  );
}

function iqColor(total: number): string {
  if (total >= 75) return "text-emerald-300";
  if (total >= 50) return "text-amber-300";
  if (total >= 25) return "text-orange-300";
  return "text-zinc-500";
}

export default async function DashboardPage() {
  const leads = (await listLeads()).sort((a, b) => b.updatedAt - a.updatedAt);
  const qualified = leads.filter((l) => l.status === "qualified" || l.status === "meeting_booked").length;
  const booked = leads.filter((l) => l.status === "meeting_booked").length;
  const avgIq =
    leads.length > 0
      ? Math.round(
          leads.reduce((acc, l) => acc + (l.dealIq?.total ?? 0), 0) / leads.length,
        )
      : 0;

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Founder Dashboard</h1>
            <p className="text-sm text-zinc-400">
              Lumen Analytics · ClosrAI auto-qualified pipeline
            </p>
          </div>
          <Link
            href="/chat"
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-sm font-medium transition-colors"
          >
            Open visitor chat ↗
          </Link>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Total leads" value={leads.length} />
          <Stat label="Qualified" value={qualified} accent="emerald" />
          <Stat label="Meetings booked" value={booked} accent="sky" />
          <Stat label="Avg Deal IQ" value={avgIq} accent="amber" />
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900/50 text-zinc-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-4 py-2.5">Lead</th>
                <th className="text-left px-4 py-2.5">Company</th>
                <th className="text-left px-4 py-2.5">Status</th>
                <th className="text-right px-4 py-2.5">Deal IQ</th>
                <th className="text-right px-4 py-2.5">Updated</th>
              </tr>
            </thead>
            <tbody>
              {leads.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-zinc-500">
                    No leads yet. Open the visitor chat to seed the pipeline.
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
                      {l.name ?? <span className="text-zinc-500 italic">Anonymous visitor</span>}
                    </Link>
                    {l.email && (
                      <div className="text-xs text-zinc-500">{l.email}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-zinc-300">
                    {l.company ?? <span className="text-zinc-600">—</span>}
                    {l.enrichment?.industry && (
                      <div className="text-xs text-zinc-500">{l.enrichment.industry}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">{statusBadge(l.status)}</td>
                  <td className={`px-4 py-3 text-right tabular-nums font-medium ${iqColor(l.dealIq?.total ?? 0)}`}>
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
      <div className={`text-2xl font-semibold mt-1 ${accent ? colors[accent] : "text-zinc-100"}`}>
        {value}
      </div>
    </div>
  );
}
