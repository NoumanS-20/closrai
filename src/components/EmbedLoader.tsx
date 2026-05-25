"use client";

import { useEffect } from "react";

interface Props {
  persona?: "sales" | "support" | "care";
  voice?: boolean;
}

declare global {
  interface Window {
    __closrAiEmbedLoaded?: boolean;
    __closrAiEmbedTeardown?: () => void;
  }
}

/**
 * Loads /embed.js on mount and tears the launcher down on unmount.
 *
 * Without the teardown the floating chat bubble would persist on every
 * subsequent SPA-navigation page (landing, dashboard, etc.) because the
 * script appends DOM nodes directly to document.body — outside React's
 * tree, so React's unmount doesn't touch them.
 */
export function EmbedLoader({ persona = "care", voice = true }: Props) {
  useEffect(() => {
    // Inject the script tag.
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-closrai-embed="true"]',
    );
    let scriptEl = existing;
    if (!scriptEl) {
      scriptEl = document.createElement("script");
      scriptEl.src = "/embed.js";
      scriptEl.dataset.closraiEmbed = "true";
      scriptEl.dataset.persona = persona;
      scriptEl.dataset.voice = voice ? "1" : "0";
      scriptEl.async = true;
      document.head.appendChild(scriptEl);
    }

    return () => {
      // Tear down the launcher + panel + listeners.
      try {
        window.__closrAiEmbedTeardown?.();
      } catch {
        /* noop */
      }
      // Remove our injected script tag so the next mount re-runs cleanly.
      try {
        scriptEl?.parentNode?.removeChild(scriptEl);
      } catch {
        /* noop */
      }
    };
  }, [persona, voice]);

  return null;
}
