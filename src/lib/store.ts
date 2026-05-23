import fs from "node:fs/promises";
import path from "node:path";
import { Redis } from "@upstash/redis";
import type { Lead } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");
const REDIS_INDEX_KEY = "closrai:leads:index";
const REDIS_LEAD_PREFIX = "closrai:lead:";

interface StoreBackend {
  list(): Promise<Lead[]>;
  get(id: string): Promise<Lead | undefined>;
  upsert(lead: Lead): Promise<Lead>;
}

let cached: StoreBackend | undefined;

function makeMemoryBackend(): StoreBackend {
  const map = new Map<string, Lead>();
  return {
    async list() {
      return Array.from(map.values());
    },
    async get(id) {
      return map.get(id);
    },
    async upsert(lead) {
      const next = { ...lead, updatedAt: Date.now() };
      map.set(next.id, next);
      return next;
    },
  };
}

function makeRedisBackend(): StoreBackend {
  const redis = Redis.fromEnv();
  return {
    async list() {
      const ids = (await redis.smembers(REDIS_INDEX_KEY)) as string[];
      if (ids.length === 0) return [];
      const leads = await Promise.all(
        ids.map((id) => redis.get<Lead>(`${REDIS_LEAD_PREFIX}${id}`)),
      );
      return leads.filter((l): l is Lead => Boolean(l));
    },
    async get(id) {
      const lead = await redis.get<Lead>(`${REDIS_LEAD_PREFIX}${id}`);
      return lead ?? undefined;
    },
    async upsert(lead) {
      const next = { ...lead, updatedAt: Date.now() };
      await redis.set(`${REDIS_LEAD_PREFIX}${next.id}`, next);
      await redis.sadd(REDIS_INDEX_KEY, next.id);
      return next;
    },
  };
}

function makeFileBackend(): StoreBackend {
  async function ensureFile(): Promise<void> {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(LEADS_FILE);
    } catch {
      await fs.writeFile(LEADS_FILE, "[]", "utf8");
    }
  }
  async function readAll(): Promise<Lead[]> {
    await ensureFile();
    const raw = await fs.readFile(LEADS_FILE, "utf8");
    try {
      return JSON.parse(raw) as Lead[];
    } catch {
      return [];
    }
  }
  async function writeAll(leads: Lead[]): Promise<void> {
    await fs.writeFile(LEADS_FILE, JSON.stringify(leads, null, 2), "utf8");
  }
  return {
    list: readAll,
    async get(id) {
      const leads = await readAll();
      return leads.find((l) => l.id === id);
    },
    async upsert(lead) {
      const leads = await readAll();
      const next = { ...lead, updatedAt: Date.now() };
      const idx = leads.findIndex((l) => l.id === lead.id);
      if (idx >= 0) leads[idx] = next;
      else leads.push(next);
      await writeAll(leads);
      return next;
    },
  };
}

function pickBackend(): StoreBackend {
  if (cached) return cached;
  const hasUpstash =
    Boolean(process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL) &&
    Boolean(process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN);
  if (hasUpstash) {
    try {
      cached = makeRedisBackend();
      return cached;
    } catch (err) {
      console.error("[store] failed to init Upstash, falling back", err);
    }
  }
  const isServerlessReadOnly = process.env.VERCEL === "1";
  cached = isServerlessReadOnly ? makeMemoryBackend() : makeFileBackend();
  return cached;
}

export async function listLeads(): Promise<Lead[]> {
  return pickBackend().list();
}

export async function getLead(id: string): Promise<Lead | undefined> {
  return pickBackend().get(id);
}

export async function upsertLead(lead: Lead): Promise<Lead> {
  return pickBackend().upsert(lead);
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
