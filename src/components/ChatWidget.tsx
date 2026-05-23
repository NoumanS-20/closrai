"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatMessage, Lead } from "@/lib/types";
import { DealIQGauge } from "./DealIQGauge";
import { DebatePanel } from "./DebatePanel";

interface Props {
  showDealIq?: boolean;
  showDebate?: boolean;
}

const OPENING: ChatMessage = {
  id: "msg_open",
  role: "assistant",
  ts: Date.now(),
  content:
    "Hey 👋 I'm ClosrAI from Lumen Analytics. We help SaaS and D2C teams cut churn with predictive retention playbooks. Mind if I ask what brought you here today?",
};

export function ChatWidget({ showDealIq = true, showDebate = true }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([OPENING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [leadId, setLeadId] = useState<string | undefined>();
  const [lead, setLead] = useState<Lead | undefined>();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, busy]);

  async function send() {
    const text = input.trim();
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
        body: JSON.stringify({ leadId, message: text }),
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
            "Sorry — something hiccuped on my side. Mind trying that again? (Check that ANTHROPIC_API_KEY is set if you're running locally.)",
        },
      ]);
      console.error(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-4 w-full max-w-5xl mx-auto">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur flex flex-col h-[640px] overflow-hidden shadow-2xl shadow-emerald-500/5">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <div className="text-sm font-medium text-zinc-100">ClosrAI</div>
            <div className="text-xs text-zinc-500">· Lumen Analytics SDR</div>
          </div>
          {lead?.status === "meeting_booked" && lead.meeting && (
            <div className="text-xs text-emerald-300">
              ✓ Meeting booked · {lead.meeting.confirmationCode}
            </div>
          )}
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className="space-y-1">
              {m.role === "assistant" && showDebate && m.debate && (
                <DebatePanel trace={m.debate} />
              )}
              <div
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[80%] bg-emerald-500/10 border border-emerald-500/20 text-zinc-100 rounded-2xl rounded-br-sm px-4 py-2 text-sm"
                    : "mr-auto max-w-[80%] bg-zinc-900 border border-zinc-800 text-zinc-100 rounded-2xl rounded-bl-sm px-4 py-2 text-sm"
                }
              >
                {m.content}
              </div>
            </div>
          ))}
          {busy && (
            <div className="mr-auto bg-zinc-900 border border-zinc-800 rounded-2xl rounded-bl-sm px-4 py-2 text-sm text-zinc-400 flex gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:120ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 animate-bounce [animation-delay:240ms]" />
            </div>
          )}
        </div>

        <div className="border-t border-zinc-800 p-3">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Type your message…"
              disabled={busy}
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:border-emerald-500/50"
            />
            <button
              onClick={send}
              disabled={busy || !input.trim()}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-zinc-800 disabled:text-zinc-500 text-zinc-950 font-medium text-sm transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      </div>

      {showDealIq && (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 backdrop-blur p-4 h-fit lg:sticky lg:top-4">
          <div className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
            Live Deal IQ
          </div>
          <DealIQGauge iq={lead?.dealIq} />
          {lead?.enrichment && (
            <div className="mt-4 pt-4 border-t border-zinc-800 space-y-1">
              <div className="text-xs uppercase tracking-wider text-zinc-500">
                Enriched
              </div>
              <div className="text-sm text-zinc-200">{lead.enrichment.domain}</div>
              {lead.enrichment.industry && (
                <div className="text-xs text-zinc-400">
                  Industry: {lead.enrichment.industry}
                </div>
              )}
              {lead.enrichment.techStack && lead.enrichment.techStack.length > 0 && (
                <div className="text-xs text-zinc-400">
                  Stack: {lead.enrichment.techStack.join(", ")}
                </div>
              )}
              <p className="text-xs text-zinc-500 leading-snug italic mt-1">
                {lead.enrichment.summary}
              </p>
            </div>
          )}
          {leadId && (
            <a
              href={`/dashboard/${leadId}`}
              target="_blank"
              rel="noreferrer"
              className="mt-4 block text-center text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              View in founder dashboard →
            </a>
          )}
        </div>
      )}
    </div>
  );
}
