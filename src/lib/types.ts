export type Role = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  ts: number;
  dealIq?: DealIQ;
  debate?: DebateTrace;
  toolCalls?: ToolCallRecord[];
}

export interface DealIQ {
  total: number;
  budget: number;
  authority: number;
  need: number;
  timing: number;
  intent: number;
  sentiment: number;
  icpFit: number;
  rationale: string;
}

export interface DebateTrace {
  objection: string;
  skeptic: string;
  closer: string;
  resolution: string;
}

export interface ToolCallRecord {
  name: string;
  input: unknown;
  output: unknown;
}

export interface Lead {
  id: string;
  createdAt: number;
  updatedAt: number;
  name?: string;
  email?: string;
  company?: string;
  role?: string;
  companyWebsite?: string;
  enrichment?: CompanyEnrichment;
  dealIq?: DealIQ;
  status: "new" | "qualified" | "meeting_booked" | "disqualified";
  meeting?: BookedMeeting;
  followUpEmail?: string;
  transcript: ChatMessage[];
}

export interface CompanyEnrichment {
  domain: string;
  industry?: string;
  sizeEstimate?: string;
  techStack?: string[];
  summary: string;
  source: "live" | "stub";
}

export interface BookedMeeting {
  slotIso: string;
  attendee: string;
  topic: string;
  confirmationCode: string;
}

export interface AgentTurnRequest {
  leadId?: string;
  userMessage: string;
  history: ChatMessage[];
}

export interface AgentTurnResponse {
  leadId: string;
  assistantMessage: ChatMessage;
  lead: Lead;
}
