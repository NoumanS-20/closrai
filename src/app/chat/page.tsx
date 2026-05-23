import { ChatWidget } from "@/components/ChatWidget";

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-8">
      <div className="max-w-5xl mx-auto mb-6 text-center space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          Talk to ClosrAI
        </h1>
        <p className="text-zinc-400 text-sm">
          Live Deal IQ scoring · Skeptic-vs-Closer objection handling · Auto meeting booking
        </p>
      </div>
      <ChatWidget />
    </main>
  );
}
