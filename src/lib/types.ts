export type Role = "user" | "assistant" | "system";

export type PersonaId = "sales" | "support" | "care";

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

export type LeadStatus =
  | "new"
  | "qualified"
  | "meeting_booked"
  | "disqualified"
  | "resolved"
  | "escalated";

export interface Lead {
  id: string;
  personaId: PersonaId;
  createdAt: number;
  updatedAt: number;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  role?: string;
  companyWebsite?: string;
  enrichment?: CompanyEnrichment;
  dealIq?: DealIQ;
  status: LeadStatus;
  meeting?: BookedMeeting;
  followUpEmail?: string;
  escalation?: EscalationTicket;
  resolvedSummary?: string;
  orderLookup?: OrderRecord;
  transcript: ChatMessage[];
}

export interface EscalationTicket {
  ticketId: string;
  priority: "low" | "normal" | "high";
  reason: string;
  createdAtIso: string;
}

export interface OrderRecord {
  orderId: string;
  status:
    | "placed"
    | "packed"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "returned"
    | "refunded"
    | "cancelled";
  items: Array<{ name: string; qty: number; priceInr: number }>;
  totalInr: number;
  placedIso: string;
  expectedDeliveryIso?: string;
  trackingUrl?: string;
  shippingPincode?: string;
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
