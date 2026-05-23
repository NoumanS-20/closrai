import { NextResponse } from "next/server";
import { z } from "zod";
import { runAgentTurn } from "@/agent/core";
import { emptyLead, getLead, upsertLead } from "@/lib/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  leadId: z.string().optional(),
  message: z.string().min(1).max(4000),
});

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid body", details: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  const { leadId, message } = parsed.data;
  const lead =
    (leadId ? await getLead(leadId) : undefined) ?? emptyLead();

  try {
    const { lead: nextLead, assistantMessage } = await runAgentTurn({
      lead,
      userMessage: message,
    });
    const saved = await upsertLead(nextLead);
    return NextResponse.json({
      leadId: saved.id,
      assistantMessage,
      lead: saved,
    });
  } catch (err) {
    console.error("[api/chat] agent failure", err);
    return NextResponse.json(
      { error: "Agent failed", detail: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
