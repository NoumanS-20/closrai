import { ChatWidget } from "@/components/ChatWidget";

export default function SupportChatPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-8">
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
