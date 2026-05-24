import { SiteHeader } from "@/components/SiteHeader";
import { ChatWidget } from "@/components/ChatWidget";
import { ChatPageHeader } from "@/components/ChatPageHeader";

export default function SalesChatPage() {
  return (
    <>
      <SiteHeader />
      <main id="main" tabIndex={-1} className="chat-page">
        <div className="shell chat-page__inner">
          <ChatPageHeader
            persona="sales"
            tag="Sales Bot track"
            title="Talk to ClosrAI"
            description="Live Deal IQ scoring · Skeptic-vs-Closer objection debate · Auto meeting booking"
          />
          <ChatWidget personaId="sales" />
        </div>

        <style>{`
          .chat-page { padding: 32px 0 100px; }
          .chat-page__inner { display: flex; flex-direction: column; gap: 24px; }
        `}</style>
      </main>
    </>
  );
}
