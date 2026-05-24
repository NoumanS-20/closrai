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
  },
  support: {
    id: "support",
    label: "Support Agent",
    rep: "ClosrSupport",
    company: "Lumen Analytics",
    greeting:
      "Hi! I'm ClosrSupport from Lumen Analytics. I can help with product questions, troubleshooting, billing, integrations, or anything else. What's going on?",
    scoreLabel: "Resolution IQ",
  },
  care: {
    id: "care",
    label: "Customer Care",
    rep: "PlyoCare",
    company: "Plyo Mart",
    greeting:
      "Hi! I'm PlyoCare. I can help with order status, returns, exchanges, refunds, or anything about your account. What can I do for you?",
    scoreLabel: "Care IQ",
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
  const [voiceSessionActive, setVoiceSessionActive] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, busy]);

  useEffect(() => {
    if (!embed) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        window.parent?.postMessage({ type: "closrai:close" }, "*");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [embed]);

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

  const lastAssistantContent = messages.length > 0 && messages[messages.length - 1].role === "assistant"
    ? messages[messages.length - 1].content
    : undefined;

  const showOrder = ui.id === "care" && lead?.orderLookup;
  const showEscalation = lead?.escalation;
  const showMeeting = lead?.status === "meeting_booked" && lead?.meeting;

  return (
    <section
      className={"chat-widget" + (embed ? " chat-widget--embed" : "")}
      aria-label={`Conversation with ${ui.rep}`}
      aria-busy={busy}
    >
      <div className="chat-widget__main">
        <header className="chat-widget__head">
          <div className="chat-widget__id">
            <span
              className="chat-widget__orb"
              data-persona={ui.id}
              aria-hidden="true"
            />
            <div>
              <strong>{ui.rep}</strong>
              <span>{busy ? "Typing…" : `${ui.company} · ${ui.label}`}</span>
            </div>
          </div>
          {showMeeting && lead?.meeting && (
            <div className="chat-widget__status chat-widget__status--ok" role="status">
              <span aria-hidden="true">✓</span>
              <span>Meeting booked · {lead.meeting.confirmationCode}</span>
            </div>
          )}
          {showEscalation && lead?.escalation && (
            <div className="chat-widget__status chat-widget__status--warn" role="status">
              <span aria-hidden="true">⚠</span>
              <span>Escalated · {lead.escalation.ticketId}</span>
            </div>
          )}
          <span className="sr-only" aria-live="polite">
            {busy ? `${ui.rep} is thinking` : ""}
          </span>
        </header>

        <div
          ref={scrollRef}
          className="chat-widget__log"
          role="log"
          aria-live="polite"
          aria-relevant="additions text"
          aria-atomic="false"
          aria-label={`Conversation with ${ui.rep}`}
        >
          {messages.map((m) => (
            <article
              key={m.id}
              className={"msg msg--" + (m.role === "user" ? "user" : "bot")}
              aria-label={m.role === "user" ? "You said" : `${ui.rep} said`}
            >
              {m.role === "assistant" && showDebate && m.debate && (
                <DebatePanel trace={m.debate} />
              )}
              <div className="msg__bubble">{m.content}</div>
              {m.toolCalls && m.toolCalls.length > 0 && (
                <ul className="msg__tools" aria-label="Tools used for this reply">
                  {m.toolCalls.map((tc, i) => (
                    <li key={i}>
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
            <article className="msg msg--bot msg--thinking" aria-label={`${ui.rep} is thinking`}>
              <div className="msg__bubble">
                <span className="typing" aria-hidden="true">
                  <i />
                  <i />
                  <i />
                </span>
              </div>
            </article>
          )}
        </div>

        <form
          className="chat-widget__form"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          aria-label={`Send a message to ${ui.rep}`}
        >
          {voiceEnabled && (
            <VoiceButton
              disabled={busy}
              onTranscript={(text) => {
                setVoiceSessionActive(true);
                setInput("");
                send(text);
              }}
              speakingText={voiceSessionActive ? lastAssistantContent : undefined}
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
            placeholder="Type your message..."
            disabled={busy}
            autoComplete="off"
            aria-disabled={busy}
          />
          <button
            type="submit"
            disabled={busy || !input.trim()}
            aria-disabled={busy || !input.trim()}
            aria-label="Send message"
            className="chat-widget__send"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 12 L20 4 L13 20 L11 13 Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
            </svg>
            <span className="sr-only">Send</span>
          </button>
        </form>
      </div>

      {showSidebar && (
        <aside className="chat-widget__rail" aria-label={`${ui.label} signals`}>
          <section className="rail-card">
            <p className="eyebrow">Live {ui.scoreLabel}</p>
            <DealIQGauge iq={lead?.dealIq} personaId={ui.id} label={ui.scoreLabel} />
          </section>

          {showOrder && lead?.orderLookup && (
            <section className="rail-card">
              <p className="eyebrow">Order looked up</p>
              <div className="rail-row"><strong>{lead.orderLookup.orderId}</strong></div>
              <div className="rail-row rail-row--mute">
                Status: <span className="rail-cap">{lead.orderLookup.status.replace(/_/g, " ")}</span>
              </div>
              <div className="rail-row rail-row--mute">
                Total: ₹{lead.orderLookup.totalInr.toLocaleString("en-IN")}
              </div>
            </section>
          )}

          {lead?.enrichment && (
            <section className="rail-card">
              <p className="eyebrow">Enriched</p>
              <div className="rail-row"><strong>{lead.enrichment.domain}</strong></div>
              {lead.enrichment.industry && (
                <div className="rail-row rail-row--mute">Industry: {lead.enrichment.industry}</div>
              )}
            </section>
          )}

          {leadId && (
            <a href={`/dashboard/${leadId}`} target="_blank" rel="noreferrer" className="rail-link">
              View in founder dashboard →
            </a>
          )}
        </aside>
      )}

      <style>{`
        .chat-widget {
          display: grid;
          gap: 22px;
          grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
        }
        .chat-widget--embed { grid-template-columns: 1fr; }
        @media (max-width: 980px) {
          .chat-widget { grid-template-columns: 1fr; }
        }

        .chat-widget__main {
          display: flex; flex-direction: column;
          background: var(--surface);
          border: 1px solid var(--line-soft);
          border-radius: var(--radius-xl);
          overflow: hidden;
          box-shadow: var(--shadow-lift);
          height: clamp(460px, calc(100dvh - 285px), 640px);
        }
        .chat-widget--embed .chat-widget__main {
          height: calc(100dvh - 20px);
          min-height: 0;
        }

        .chat-widget__head {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid var(--line-soft);
          background: linear-gradient(180deg, var(--surface), oklch(0.97 0.025 75));
          gap: 12px;
          flex-wrap: wrap;
        }
        .chat-widget__id { display: flex; align-items: center; gap: 12px; }
        .chat-widget__id strong {
          display: block;
          font-family: var(--font-display);
          font-size: 1.05rem;
          font-weight: 600;
          letter-spacing: -0.015em;
        }
        .chat-widget__id span { color: var(--ink-mute); font-size: 0.8rem; }
        .chat-widget__orb {
          width: 36px; height: 36px; border-radius: 50%;
          box-shadow: 0 4px 10px -2px rgba(120,75,30,.4),
                      inset 0 -3px 5px rgba(0,0,0,.15),
                      inset 0 2px 3px rgba(255,255,255,.4);
          flex-shrink: 0;
        }
        .chat-widget__orb[data-persona="sales"] { background: radial-gradient(circle at 30% 25%, oklch(0.88 0.11 155), oklch(0.48 0.17 158)); }
        .chat-widget__orb[data-persona="support"] { background: radial-gradient(circle at 30% 25%, oklch(0.90 0.09 225), oklch(0.52 0.16 242)); }
        .chat-widget__orb[data-persona="care"] { background: radial-gradient(circle at 30% 25%, oklch(0.88 0.10 318), oklch(0.50 0.16 300)); }

        .chat-widget__status {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 0.78rem;
          padding: 4px 10px;
          border-radius: var(--radius-pill);
          background: var(--surface-2);
          border: 1px solid var(--line);
        }
        .chat-widget__status--ok { color: oklch(0.40 0.12 145); border-color: oklch(0.80 0.08 145); background: oklch(0.96 0.05 145); }
        .chat-widget__status--warn { color: oklch(0.40 0.14 60); border-color: oklch(0.80 0.10 70); background: oklch(0.96 0.06 75); }

        .chat-widget__log {
          flex: 1; overflow-y: auto;
          padding: 22px 20px;
          display: flex; flex-direction: column; gap: 12px;
          background: var(--bg);
          scroll-behavior: smooth;
        }

        .msg { max-width: 80%; }
        .msg--user { align-self: flex-end; }
        .msg__bubble {
          padding: 12px 16px;
          border-radius: 18px;
          font-size: 0.96rem;
          line-height: 1.45;
          white-space: pre-wrap;
        }
        .msg--user .msg__bubble {
          background: var(--ink);
          color: var(--surface);
          border-bottom-right-radius: 6px;
        }
        .msg--bot .msg__bubble {
          background: var(--surface);
          color: var(--ink);
          border: 1px solid var(--line-soft);
          border-bottom-left-radius: 6px;
        }
        .msg__tools {
          list-style: none; padding: 0; margin: 6px 0 0;
          display: flex; flex-wrap: wrap; gap: 4px;
        }
        .msg__tools li {
          font-family: var(--font-mono);
          font-size: 0.62rem;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 2px 8px;
          border-radius: var(--radius-pill);
          background: var(--surface-2);
          border: 1px solid var(--line);
          color: var(--ink-mute);
        }
        .msg--thinking .msg__bubble { padding: 14px 18px; }
        .typing { display: inline-flex; gap: 4px; }
        .typing i {
          width: 7px; height: 7px; border-radius: 50%;
          background: var(--ink-mute);
          animation: typing 1.2s ease-in-out infinite;
        }
        .typing i:nth-child(2) { animation-delay: .15s; }
        .typing i:nth-child(3) { animation-delay: .3s; }
        @keyframes typing {
          0%, 60%, 100% { opacity: .35; transform: translateY(0); }
          30%           { opacity: 1;   transform: translateY(-3px); }
        }

        .chat-widget__form {
          display: flex; gap: 10px; align-items: center;
          padding: 14px 16px;
          background: var(--surface);
          border-top: 1px solid var(--line-soft);
        }
        .chat-widget__form input {
          flex: 1; padding: 12px 16px;
          min-width: 0;
          border: 1px solid var(--line);
          border-radius: var(--radius-pill);
          background: var(--bg);
          color: var(--ink);
        }
        .chat-widget__form input::placeholder { color: var(--ink-mute); }
        .chat-widget__form input:focus-visible {
          outline: 3px solid var(--focus); outline-offset: 1px;
        }
        .chat-widget__form input:disabled { opacity: 0.55; }
        .chat-widget__send {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: linear-gradient(180deg, oklch(0.72 0.16 42), var(--terracotta));
          color: white; border: 1px solid var(--terracotta-deep);
          cursor: pointer;
          display: grid; place-items: center;
          flex-shrink: 0;
          transition: filter var(--dur-fast) var(--ease), transform var(--dur-fast) var(--ease);
        }
        .chat-widget__send:hover:not(:disabled) { filter: brightness(1.05); transform: translateY(-1px); }
        .chat-widget__send:disabled { opacity: 0.5; cursor: not-allowed; }

        /* RAIL */
        .chat-widget__rail {
          display: flex; flex-direction: column; gap: 16px;
        }
        .rail-card {
          background: var(--surface);
          border: 1px solid var(--line-soft);
          border-radius: var(--radius-lg);
          padding: 20px;
          box-shadow: var(--shadow-soft);
          display: flex; flex-direction: column; gap: 10px;
        }
        .rail-card h3 { font-size: 1.2rem; margin-top: 4px; }
        .rail-row {
          display: flex; gap: 6px; align-items: baseline;
          font-size: 0.9rem;
        }
        .rail-row--mute { color: var(--ink-soft); font-size: 0.82rem; }
        .rail-cap { text-transform: capitalize; }
        .rail-link {
          display: inline-block;
          padding: 8px 14px;
          font-size: 0.85rem;
          color: var(--terracotta-deep);
          text-align: center;
          border-radius: var(--radius-pill);
          border: 1px solid var(--line);
          background: var(--surface);
        }
        .rail-link:hover { background: var(--surface-2); text-decoration: none; }

        @media (max-width: 980px) {
          .chat-widget__main {
            height: clamp(500px, calc(100dvh - 320px), 600px);
          }
          .chat-widget--embed .chat-widget__main {
            height: calc(100dvh - 20px);
          }
        }
        @media (max-width: 620px) {
          .chat-widget {
            gap: 16px;
          }
          .chat-widget__main {
            height: 520px;
            border-radius: var(--radius-lg);
          }
          .chat-widget--embed .chat-widget__main {
            height: calc(100dvh - 20px);
          }
          .chat-widget__head {
            padding: 14px 16px;
          }
          .chat-widget__log {
            padding: 20px 16px;
          }
          .msg {
            max-width: 88%;
          }
          .chat-widget__form {
            padding: 12px;
          }
        }
      `}</style>
    </section>
  );
}
