"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, Lead, PersonaId } from "@/lib/types";
import { DealIQGauge } from "./DealIQGauge";
import { DebatePanel } from "./DebatePanel";
import { VoiceButton } from "./VoiceButton";

interface PersonaUiConfig {
  id: PersonaId;
  label: string;
  rep: string;
  company: string;
  greeting: string;
  scoreLabel: string;
  accent: "emerald" | "sky" | "violet";
}

const PERSONA_UI: Record<PersonaId, PersonaUiConfig> = {
  sales: {
    id: "sales",
    label: "Sales SDR",
    rep: "ClosrAI",
    company: "Lumen Analytics",
    greeting:
      "Hey 👋 I'm ClosrAI from Lumen Analytics. We help SaaS and D2C teams cut churn with predictive retention playbooks. Mind if I ask what brought you here today?",
    scoreLabel: "Deal IQ",
    accent: "emerald",
  },
  support: {
    id: "support",
    label: "Support Agent",
    rep: "ClosrSupport",
    company: "Lumen Analytics",
    greeting:
      "Hi! I'm ClosrSupport from Lumen Analytics. I can help with product questions, troubleshooting, billing, integrations, or anything else. What's going on?",
    scoreLabel: "Resolution IQ",
    accent: "sky",
  },
  care: {
    id: "care",
    label: "Customer Care",
    rep: "PlyoCare",
    company: "Plyo Mart",
    greeting:
      "Hi! I'm PlyoCare. I can help with order status, returns, exchanges, refunds, or anything about your account. What can I do for you?",
    scoreLabel: "Care IQ",
    accent: "violet",
  },
};

const ACCENT_CLASSES: Record<PersonaUiConfig["accent"], { dot: string; bubble: string; button: string; ring: string; accentText: string }> = {
  emerald: {
    dot: "bg-emerald-400",
    bubble: "bg-emerald-500/10 border-emerald-500/20",
    button: "bg-emerald-500 hover:bg-emerald-400 text-zinc-950",
    ring: "shadow-emerald-500/5",
    accentText: "text-emerald-300",
  },
  sky: {
    dot: "bg-sky-400",
    bubble: "bg-sky-500/10 border-sky-500/20",
    button: "bg-sky-500 hover:bg-sky-400 text-zinc-950",
    ring: "shadow-sky-500/5",
    accentText: "text-sky-300",
  },
  violet: {
    dot: "bg-violet-400",
    bubble: "bg-violet-500/10 border-violet-500/20",
    button: "bg-violet-500 hover:bg-violet-400 text-zinc-950",
    ring: "shadow-violet-500/5",
    accentText: "text-violet-300",
  },
};

interface Props {
  personaId?: PersonaId;
  showSidebar?: boolean;
  showDebate?: boolean;
  embed?: boolean;
  voiceEnabled?: boolean;
}

export function ChatWidget({
  personaId = "sales",
  showSidebar = true,
  showDebate = true,
  embed = false,
  voiceEnabled = true,
}: Props) {
  const ui = PERSONA_UI[personaId];
  const accent = ACCENT_CLASSES[ui.accent];

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: `msg_open_${ui.id}`,
      role: "assistant",
      ts: Date.now(),
      content: ui.greeting,
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [leadId, setLeadId] = useState<string | undefined>();
  const [lead, setLead] = useState<Lead | undefined>();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, busy]);

  async function send(textOverride?: string) {
    const text = (textOverride ?? input).trim();
    if (!text || busy) return;
    setInput("");
    const userMsg: ChatMessage = {
      id: `local_${Date.now()}`,
      role: "user",
      content: text,
      ts: Date.now(),
    };
    setMessages((m) => [...m, userMsg]);
    setBusy(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ leadId, personaId: ui.id, message: text }),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = (await res.json()) as {
        leadId: string;
        assistantMessage: ChatMessage;
        lead: Lead;
      };
      setLeadId(data.leadId);
      setLead(data.lead);
      setMessages((m) => [...m, data.assistantMessage]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          ts: Date.now(),
          content:
            "Sorry — something hiccuped on my side. Mind trying that again? (Check that GROQ_API_KEY is set if you're running locally.)",
        },
      ]);
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  const showOrder = ui.id === "care" && lead?.orderLookup;
  const showEscalation = lead?.escalation;
  const showMeeting = lead?.status === "meeting_booked" && lead.meeting;

  return (
    <section
      aria-label={`${ui.rep} chat`}
      aria-busy={busy}
      className={`grid ${
        showSidebar ? "lg:grid-cols-[1fr_280px]" : ""
      } gap-4 w-full ${embed ? "" : "max-w-5xl mx-auto"}`}
    >
      <div
        className={`rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur flex flex-col h-[640px] overflow-hidden shadow-2xl ${accent.ring}`}
      >
        <header className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`w-2 h-2 rounded-full animate-pulse ${accent.dot}`}
            />
            <div className="text-sm font-medium text-zinc-100">{ui.rep}</div>
            <div className="text-xs text-zinc-500">
              · {ui.company} {ui.label}
            </div>
          </div>
          {showMeeting && lead?.meeting && (
            <div
              role="status"
              className={`text-xs ${accent.accentText}`}
            >
              <span aria-hidden="true">✓ </span>
              Meeting booked · {lead.meeting.confirmationCode}
            </div>
          )}
          {showEscalation && lead?.escalation && (
            <div role="status" className="text-xs text-amber-300">
              <span aria-hidden="true">⚠ </span>
              Escalated · {lead.escalation.ticketId}
            </div>
          )}
        </header>

        <div
          ref={scrollRef}
          role="log"
          aria-live="polite"
          aria-relevant="additions text"
          aria-atomic="false"
          aria-label={`Conversation with ${ui.rep}`}
          className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
        >
          {messages.map((m) => (
            <article
              key={m.id}
              aria-label={
                m.role === "user"
                  ? "You said"
                  : `${ui.rep} said`
              }
              className="space-y-1"
            >
              {m.role === "assistant" && showDebate && m.debate && (
                <DebatePanel trace={m.debate} />
              )}
              <div
                className={
                  m.role === "user"
                    ? `ml-auto max-w-[80%] border text-zinc-100 rounded-2xl rounded-br-sm px-4 py-2 text-sm ${accent.bubble}`
                    : "mr-auto max-w-[80%] bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-2xl rounded-bl-sm px-4 py-2 text-sm"
                }
              >
                {m.content}
              </div>
              {m.toolCalls && m.toolCalls.length > 0 && (
                <ul
                  aria-label="Tools used for this reply"
                  className="mt-1 ml-2 flex flex-wrap gap-1 list-none p-0"
                >
                  {m.toolCalls.map((tc, i) => (
                    <li
                      key={i}
                      className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-zinc-800 bg-zinc-900/60 text-zinc-400"
                    >
                      <span aria-hidden="true">🛠 </span>
                      <span className="sr-only">Tool: </span>
                      {tc.name}
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
          {busy && (
            <div
              role="status"
              aria-label={`${ui.rep} is thinking`}
              className="mr-auto bg-zinc-900 border border-zinc-800 rounded-2xl rounded-bl-sm px-4 py-2 text-sm text-zinc-400 flex gap-1"
            >
              <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" />
              <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:120ms]" />
              <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:240ms]" />
              <span className="sr-only">{ui.rep} is thinking…</span>
            </div>
          )}
        </div>

        <form
          className="border-t border-zinc-800 p-3"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          aria-label={`Send a message to ${ui.rep}`}
        >
          <div className="flex gap-2 items-center">
            {voiceEnabled && (
              <VoiceButton
                accent={ui.accent}
                disabled={busy}
                onTranscript={(text) => {
                  setInput("");
                  send(text);
                }}
                speakingText={
                  messages.length > 0 && messages[messages.length - 1].role === "assistant"
                    ? messages[messages.length - 1].content
                    : undefined
                }
              />
            )}
            <label htmlFor={`closrai-input-${ui.id}`} className="sr-only">
              Type your message to {ui.rep}
            </label>
            <input
              id={`closrai-input-${ui.id}`}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Type or tap the mic…"
              disabled={busy}
              autoComplete="off"
              aria-disabled={busy}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-zinc-600"
            />
            <button
              type="submit"
              disabled={busy || !input.trim()}
              aria-disabled={busy || !input.trim()}
              aria-label="Send message"
              className={`px-4 py-2 rounded-xl disabled:bg-zinc-800 disabled:text-zinc-500 font-medium text-sm transition-colors ${accent.button}`}
            >
              Send
            </button>
          </div>
        </form>
      </div>

      {showSidebar && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur p-4 h-fit lg:sticky lg:top-4 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
              Live {ui.scoreLabel}
            </div>
            <DealIQGauge iq={lead?.dealIq} />
          </div>

          {showOrder && lead?.orderLookup && (
            <div className="pt-3 border-t border-zinc-800 space-y-1">
              <div className="text-xs uppercase tracking-wider text-zinc-500">
                Order looked up
              </div>
              <div className="text-sm text-zinc-200">{lead.orderLookup.orderId}</div>
              <div className="text-xs text-zinc-400 capitalize">
                Status: {lead.orderLookup.status.replace(/_/g, " ")}
              </div>
              <div className="text-xs text-zinc-400">
                Total: ₹{lead.orderLookup.totalInr.toLocaleString("en-IN")}
              </div>
            </div>
          )}

          {lead?.enrichment && (
            <div className="pt-3 border-t border-zinc-800 space-y-1">
              <div className="text-xs uppercase tracking-wider text-zinc-500">
                Enriched
              </div>
              <div className="text-sm text-zinc-200">{lead.enrichment.domain}</div>
              {lead.enrichment.industry && (
                <div className="text-xs text-zinc-400">
                  Industry: {lead.enrichment.industry}
                </div>
              )}
            </div>
          )}

          {leadId && (
            <a
              href={`/dashboard/${leadId}`}
              target="_blank"
              rel="noreferrer"
              className={`block text-center text-xs transition-colors ${accent.accentText} hover:opacity-80`}
            >
              View in founder dashboard →
            </a>
          )}
        </div>
      )}
    </section>
  );
}
