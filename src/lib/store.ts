import fs from "node:fs/promises";
import path from "node:path";
import type { Lead } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");

async function ensureFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(LEADS_FILE);
  } catch {
    await fs.writeFile(LEADS_FILE, "[]", "utf8");
  }
}

export async function listLeads(): Promise<Lead[]> {
  await ensureFile();
  const raw = await fs.readFile(LEADS_FILE, "utf8");
  try {
    return JSON.parse(raw) as Lead[];
  } catch {
    return [];
  }
}

export async function getLead(id: string): Promise<Lead | undefined> {
  const leads = await listLeads();
  return leads.find((l) => l.id === id);
}

export async function upsertLead(lead: Lead): Promise<Lead> {
  const leads = await listLeads();
  const idx = leads.findIndex((l) => l.id === lead.id);
  const next: Lead = { ...lead, updatedAt: Date.now() };
  if (idx >= 0) {
    leads[idx] = next;
  } else {
    leads.push(next);
  }
  await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), "utf8");
  return next;
}

export function newLeadId(): string {
  return `lead_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function emptyLead(): Lead {
  const now = Date.now();
  return {
    id: newLeadId(),
    createdAt: now,
    updatedAt: now,
    status: "new",
    transcript: [],
  };
}
