import { ChatWidget } from "@/components/ChatWidget";
import type { PersonaId } from "@/lib/types";

export const dynamic = "force-dynamic";

function coercePersona(raw: string | string[] | undefined): PersonaId {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "sales" || v === "support" || v === "care") return v;
  return "sales";
}

export default async function EmbedPage({
  searchParams,
}: {
  searchParams: Promise<{ persona?: string; voice?: string }>;
}) {
  const { persona: personaRaw, voice } = await searchParams;
  const personaId = coercePersona(personaRaw);
  const voiceEnabled = voice !== "0" && voice !== "false";

  return (
    <main className="min-h-screen bg-transparent text-zinc-100 p-2">
      <ChatWidget
        personaId={personaId}
        showSidebar={false}
        voiceEnabled={voiceEnabled}
        embed
      />
    </main>
  );
}
