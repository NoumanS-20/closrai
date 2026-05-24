import Link from "next/link";
import { Orb, OrbFace, type OrbKind } from "./Orb";

interface Props {
  persona: OrbKind;
  tag: string;
  title: string;
  description: string;
}

export function ChatPageHeader({ persona, tag, title, description }: Props) {
  return (
    <>
      <Link href="/chat" className="chat-back">
        ← All bots
      </Link>
      <header className="chat-hd">
        <div className="chat-hd__id">
          <div className="chat-hd__orb">
            <Orb kind={persona} size={84} float={false} idle />
            <OrbFace size={84} />
          </div>
          <div>
            <p className="eyebrow">{tag}</p>
            <h1>{title}</h1>
            <p className="chat-hd__desc">{description}</p>
          </div>
        </div>
      </header>

      <style>{`
        .chat-back {
          font-size: 0.85rem;
          color: var(--ink-soft);
          margin-bottom: 4px;
          display: inline-block;
        }
        .chat-back:hover { color: var(--ink); }

        .chat-hd {
          padding-bottom: 22px;
          border-bottom: 1px solid var(--line-soft);
        }
        .chat-hd__id {
          display: flex; gap: 22px; align-items: center;
        }
        .chat-hd__orb { position: relative; flex-shrink: 0; width: 84px; height: 84px; }
        .chat-hd__id h1 {
          font-size: clamp(1.8rem, 3.2vw, 2.4rem);
          margin: 4px 0;
        }
        .chat-hd__desc {
          color: var(--ink-soft);
          margin: 0;
          font-size: 0.95rem;
        }
        @media (max-width: 600px) {
          .chat-hd__id { gap: 16px; }
          .chat-hd__orb { width: 64px; height: 64px; }
        }
      `}</style>
    </>
  );
}
