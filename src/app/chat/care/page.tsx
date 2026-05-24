import { ChatWidget } from "@/components/ChatWidget";

export default function CareChatPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 px-4 py-8">
      <div className="max-w-5xl mx-auto mb-6 text-center space-y-2">
        <div className="text-[10px] uppercase tracking-wider text-violet-300">
          Customer Care Bot track
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Talk to PlyoCare</h1>
        <p className="text-zinc-400 text-sm">
          Live order lookup · Refunds within 14-day policy · Care IQ health scoring · Auto-escalation for damage cases
        </p>
        <p className="text-zinc-500 text-xs">
          Try: <code className="text-zinc-300">PLY-12345</code> (out for delivery) or{" "}
          <code className="text-zinc-300">PLY-99001</code> (delivered, in return window)
        </p>
      </div>
      <ChatWidget personaId="care" />
    </main>
  );
}
