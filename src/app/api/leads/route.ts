import { NextResponse } from "next/server";
import { listLeads } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const leads = await listLeads();
  const sorted = [...leads].sort((a, b) => b.updatedAt - a.updatedAt);
  return NextResponse.json({ leads: sorted });
}
