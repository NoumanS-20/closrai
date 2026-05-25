"use client";

import type { CSSProperties } from "react";

export type OrbKind = "sales" | "support" | "care" | "plum" | "sage";

const PALETTES: Record<OrbKind, { base: string; glow: string; ring: string }> = {
  sales: {
    base: "linear-gradient(180deg, oklch(0.78 0.15 155), oklch(0.48 0.17 158))",
    glow: "oklch(0.88 0.11 155)",
    ring: "oklch(0.58 0.15 158)",
  },
  support: {
    base: "linear-gradient(180deg, oklch(0.82 0.12 230), oklch(0.52 0.16 242))",
    glow: "oklch(0.90 0.09 225)",
    ring: "oklch(0.62 0.14 235)",
  },
  care: {
    base: "linear-gradient(180deg, oklch(0.78 0.13 315), oklch(0.50 0.16 300))",
    glow: "oklch(0.88 0.10 318)",
    ring: "oklch(0.60 0.14 305)",
  },
  plum: {
    base: "linear-gradient(180deg, oklch(0.65 0.15 340), oklch(0.42 0.14 330))",
    glow: "oklch(0.80 0.13 345)",
    ring: "oklch(0.55 0.14 335)",
  },
  sage: {
    base: "linear-gradient(180deg, oklch(0.78 0.08 150), oklch(0.50 0.10 145))",
    glow: "oklch(0.88 0.08 155)",
    ring: "oklch(0.62 0.10 150)",
  },
};

interface OrbProps {
  kind?: OrbKind;
  size?: number;
  float?: boolean;
  idle?: boolean;
  style?: CSSProperties;
}

export function Orb({
  kind = "sales",
  size = 220,
  float = true,
  idle = false,
  style,
}: OrbProps) {
  const palette = PALETTES[kind];
  return (
    <div
      className={
        "orb-3d" + (float ? " orb-3d--float" : "") + (idle ? " orb-3d--idle" : "")
      }
      style={{
        width: size,
        height: size,
        background: palette.base,
        ...style,
      }}
      aria-hidden="true"
    >
      <div
        className="orb-3d__halo"
        style={{
          background: `radial-gradient(circle, ${palette.glow} 0%, transparent 70%)`,
        }}
      />
      <div className="orb-3d__ring" style={{ borderColor: palette.ring }} />
      <div
        className="orb-3d__ring orb-3d__ring--2"
        style={{ borderColor: palette.ring }}
      />
      <div className="orb-3d__highlight" />
      <div className="orb-3d__shadow" />
      <style>{`
        .orb-3d {
          position: relative;
          border-radius: 50%;
          box-shadow:
            0 30px 60px -20px rgba(140, 70, 30, 0.4),
            0 12px 24px -10px rgba(140, 70, 30, 0.25),
            inset 0 -16px 30px rgba(40, 10, 0, 0.25),
            inset 0 8px 20px rgba(255, 255, 255, 0.2);
          isolation: isolate;
          transform-style: preserve-3d;
          /* Orbs are purely decorative — never block clicks on links/buttons
             that sit underneath the halo/ring overhang. */
          pointer-events: none;
        }
        .orb-3d * { pointer-events: none; }
        .orb-3d__halo {
          position: absolute;
          inset: -30%;
          z-index: -1;
          opacity: .55;
          filter: blur(20px);
          border-radius: 50%;
        }
        .orb-3d__ring {
          position: absolute;
          inset: -14%;
          border: 1px solid;
          border-radius: 50%;
          opacity: .35;
          transform: rotateX(70deg);
        }
        .orb-3d__ring--2 {
          inset: -22%;
          opacity: .2;
          transform: rotateX(70deg) rotateZ(40deg);
        }
        .orb-3d__highlight {
          position: absolute;
          inset: 6% 8% auto auto;
          width: 32%;
          height: 32%;
          background: radial-gradient(
            ellipse at 30% 30%,
            rgba(255, 255, 255, .95) 0%,
            rgba(255, 255, 255, .3) 30%,
            transparent 60%
          );
          border-radius: 50%;
          filter: blur(2px);
        }
        .orb-3d__shadow {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: radial-gradient(
            ellipse at 75% 80%,
            rgba(0, 0, 0, 0.35) 0%,
            transparent 50%
          );
        }
        @keyframes orb-bob {
          0%, 100% { transform: translateY(0) rotate(0); }
          50%      { transform: translateY(-12px) rotate(2deg); }
        }
        .orb-3d--float { animation: orb-bob 8s ease-in-out infinite; }
        @keyframes orb-idle {
          0%, 100% { transform: scale(1); }
          50%      { transform: scale(1.02); }
        }
        .orb-3d--idle { animation: orb-idle 4s ease-in-out infinite; }
      `}</style>
    </div>
  );
}

interface OrbFaceProps {
  size?: number;
  mood?: "smile" | "neutral";
}

export function OrbFace({ size = 220, mood = "smile" }: OrbFaceProps) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      <div style={{ display: "flex", gap: size * 0.13, alignItems: "center" }}>
        <span
          style={{
            width: size * 0.08,
            height: size * 0.1,
            borderRadius: "50%",
            background: "oklch(0.20 0.02 50)",
            boxShadow: "inset 2px 2px 0 rgba(255,255,255,.4)",
          }}
        />
        <span
          style={{
            width: size * 0.08,
            height: size * 0.1,
            borderRadius: "50%",
            background: "oklch(0.20 0.02 50)",
            boxShadow: "inset 2px 2px 0 rgba(255,255,255,.4)",
          }}
        />
      </div>
      {mood === "smile" && (
        <svg
          width={size * 0.3}
          height={size * 0.18}
          viewBox="0 0 30 18"
          style={{ position: "absolute", top: "55%" }}
          aria-hidden="true"
        >
          <path
            d="M3 4 Q15 18 27 4"
            stroke="oklch(0.20 0.02 50)"
            strokeWidth="2.4"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      )}
    </div>
  );
}
