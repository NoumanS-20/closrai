import { SiteHeader } from "@/components/SiteHeader";
import { ChatWidget } from "@/components/ChatWidget";
import { ChatPageHeader } from "@/components/ChatPageHeader";

export default function CareChatPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="chat-page">
        <div className="shell chat-page__inner">
          <ChatPageHeader
            persona="care"
            tag="Customer Care Bot track"
            title="Talk to PlyoCare"
            description="Live order lookup · Refunds within 14-day policy · Care IQ health scoring · Auto-escalation for damage cases"
          />
          <p className="chat-hint">
            Try: <code>PLY-12345</code> (out for delivery) or{" "}
            <code>PLY-99001</code> (delivered, in return window)
          </p>
          <ChatWidget personaId="care" />
        </div>

        <style>{`
          .chat-page { padding: 32px 0 100px; }
          .chat-page__inner { display: flex; flex-direction: column; gap: 22px; }
          .chat-hint {
            font-size: 0.85rem;
            color: var(--ink-mute);
            margin: 0;
          }
          .chat-hint code {
            font-family: var(--font-mono);
            font-size: 0.78rem;
            padding: 2px 6px;
            border-radius: 6px;
            background: var(--surface-2);
            border: 1px solid var(--line-soft);
            color: var(--ink);
          }
        `}</style>
      </main>
    </>
  );
}
