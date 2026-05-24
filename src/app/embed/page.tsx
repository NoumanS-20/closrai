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
    <main id="main" tabIndex={-1} className="embed-shell">
      <ChatWidget
        personaId={personaId}
        showSidebar={false}
        voiceEnabled={voiceEnabled}
        embed
      />
      <style>{`
        .embed-shell {
          padding: 10px;
          min-height: 100vh;
          background: var(--bg);
        }
      `}</style>
    </main>
  );
}
