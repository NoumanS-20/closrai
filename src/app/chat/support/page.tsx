import Link from "next/link";
import { ChatWidget } from "@/components/ChatWidget";
import { A11yPanelButton } from "@/components/A11ySettings";

export default function SupportChatPage() {
  return (
    <main id="main" className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-8">
      <div className="max-w-5xl mx-auto flex items-center justify-between mb-4">
        <Link href="/chat" className="text-xs text-zinc-500 hover:text-zinc-200">
          ← All bots
        </Link>
        <A11yPanelButton />
      </div>
      <div className="max-w-5xl mx-auto mb-6 text-center space-y-2">
        <div className="text-[10px] uppercase tracking-wider text-sky-300">
          Support Chat Bot track
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Talk to ClosrSupport</h1>
        <p className="text-zinc-400 text-sm">
          Knowledge-base grounded · Resolution IQ scoring · Skeptic-vs-Closer on policy pushback · Clean human escalation
        </p>
      </div>
      <ChatWidget personaId="support" />
    </main>
  );
}
