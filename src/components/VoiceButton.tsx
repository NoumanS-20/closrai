"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

interface Props {
  onTranscript: (text: string) => void;
  speakingText?: string;
  disabled?: boolean;
}

interface BrowserSpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult:
    | ((ev: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void)
    | null;
  onerror: ((ev: { error: string }) => void) | null;
  onend: (() => void) | null;
}

type SpeechCtor = new () => BrowserSpeechRecognition;

declare global {
  interface Window {
    SpeechRecognition?: SpeechCtor;
    webkitSpeechRecognition?: SpeechCtor;
  }
}

function getSpeechCtor(): SpeechCtor | undefined {
  if (typeof window === "undefined") return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

function subscribeNoop(): () => void {
  return () => {};
}

/**
 * Pick the smoothest available TTS voice.
 *
 * Honest constraint: Web Speech API quality depends entirely on the OS/browser
 * voices installed. On Windows the LOCAL Microsoft voices (David / Zira / Mark
 * / Hazel) sound robotic and mispronounce common words. The "Online" / "Natural"
 * voices that ship with modern Edge / Chrome are dramatically better. We
 * explicitly exclude the bad local Microsoft voices and rank what's left.
 */
const BAD_VOICE_NAMES = [
  "Microsoft David",
  "Microsoft Mark",
  "Microsoft Zira",
  "Microsoft Hazel",
  "Microsoft Heera",
  "Microsoft Ravi",
  "Microsoft Sean",
  "Microsoft James",
  "Microsoft Catherine",
];

function isBadVoice(v: SpeechSynthesisVoice): boolean {
  return BAD_VOICE_NAMES.some((bad) => v.name.startsWith(bad));
}

function scoreVoice(v: SpeechSynthesisVoice): number {
  let score = 0;
  const name = v.name;

  // Strongly prefer the new Microsoft "Online (Natural)" neural voices
  if (/Online \(Natural\)/i.test(name)) score += 100;
  // Generic "Natural" / "Neural" / "Online" / "Premium" / "Enhanced" hints
  if (/\bnatural\b/i.test(name)) score += 60;
  if (/\bneural\b/i.test(name)) score += 60;
  if (/\bonline\b/i.test(name)) score += 50;
  if (/\bpremium\b/i.test(name)) score += 50;
  if (/\benhanced\b/i.test(name)) score += 40;

  // Known-good named voices across platforms
  if (/^Google\b/i.test(name)) score += 70;
  if (/^Samantha$/i.test(name)) score += 70; // macOS / iOS
  if (/^Karen$/i.test(name)) score += 60; // macOS AU
  if (/^Daniel$/i.test(name)) score += 60; // macOS GB
  if (/^Aria$/i.test(name)) score += 60;
  if (/^Jenny$/i.test(name)) score += 60;
  if (/^Sonia$/i.test(name)) score += 60;
  if (/^Libby$/i.test(name)) score += 60;
  if (/^Neerja$/i.test(name)) score += 60; // Indian English

  // Locale preference (en-IN > en-GB > en-US > other en)
  if (v.lang === "en-IN") score += 12;
  else if (v.lang === "en-GB") score += 8;
  else if (v.lang === "en-US") score += 6;
  else if (v.lang.startsWith("en")) score += 3;

  return score;
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  const candidates = voices
    .filter((v) => v.lang.startsWith("en"))
    .filter((v) => !isBadVoice(v));

  if (candidates.length === 0) {
    // All English voices were filtered out — fall back to any English voice
    return voices.find((v) => v.lang.startsWith("en")) ?? null;
  }

  candidates.sort((a, b) => scoreVoice(b) - scoreVoice(a));
  return candidates[0];
}

/**
 * Strip content that screen-to-speech engines either skip, mis-read, or read
 * literally ("waving hand", "smiling face with smiling eyes", etc.). We sanitize
 * ONLY the text passed to TTS — the on-screen message keeps its emoji.
 *
 * The regex matches Unicode "Symbol" + "Pictograph" + "Emoji_Component" ranges
 * via the \p{...} script class. Then collapses any whitespace the removal
 * leaves behind.
 */
// All regexes are built from STRINGS with explicit \u escape sequences so the
// source file stays pure ASCII. Previously, literal emoji characters were
// pasted into character classes and got mangled by Git CRLF normalization,
// causing the sanitizer to silently strip legitimate text and break voice
// playback entirely.

const EMOJI_PROPERTY_RE: RegExp | null = (() => {
  try {
    return new RegExp("\\p{Extended_Pictographic}", "gu");
  } catch {
    return null;
  }
})();

// Fallback for engines without property escapes. Covers:
//   U+2600 – U+27BF    Miscellaneous Symbols + Dingbats
//   U+D83C – U+D83E    high surrogates for the U+1F000–U+1FAFF emoji planes
const EMOJI_RANGE_RE = new RegExp(
  "[\\u2600-\\u27BF]|[\\uD83C-\\uD83E][\\uDC00-\\uDFFF]",
  "g",
);

// Invisible joiners and selectors that often follow emoji:
//   FE0F variation selector 16
//   200D zero-width joiner
//   200B zero-width space
//   2060 word-joiner
const INVISIBLES_RE = new RegExp("[\\uFE0F\\u200D\\u200B\\u2060]", "g");

const WHITESPACE_RE = /\s+/g;

function sanitizeForSpeech(text: string): string {
  if (!text) return text;
  let out = text;
  if (EMOJI_PROPERTY_RE) {
    out = out.replace(EMOJI_PROPERTY_RE, "");
  } else {
    out = out.replace(EMOJI_RANGE_RE, "");
  }
  out = out.replace(INVISIBLES_RE, "");
  out = out.replace(WHITESPACE_RE, " ").trim();
  return out;
}

// Module-load self-test: if the sanitizer ever destroys plain text, log loudly
// AND fall back to a no-op so voice never silently goes dark again.
const SANITIZER_BROKEN = (() => {
  try {
    if (sanitizeForSpeech("Hello world") !== "Hello world") return true;
    if (
      sanitizeForSpeech("Plan starts at $19 a month") !==
      "Plan starts at $19 a month"
    ) {
      return true;
    }
    if (
      sanitizeForSpeech("Three bots, made for everyone.") !==
      "Three bots, made for everyone."
    ) {
      return true;
    }
    return false;
  } catch {
    return true;
  }
})();

if (SANITIZER_BROKEN) {
  console.error(
    "[voice] sanitizeForSpeech self-test failed — falling back to identity",
  );
}

function safeSpeechText(text: string): string {
  return SANITIZER_BROKEN ? text : sanitizeForSpeech(text);
}

/* ------------------------------------------------------------------
 * Browser autoplay gating
 *
 * Modern browsers reject `speechSynthesis.speak()` until the page has
 * received a user gesture. There is NO way around this on the very first
 * ever load — it's enforced by the browser engine, not the spec.
 *
 * What we CAN do: remember in localStorage that the user has interacted
 * with this site before. On subsequent visits, the gate starts open,
 * autoplay works immediately, and the greeting speaks the moment the
 * page renders.
 *
 * We also still listen for the first live gesture so the FIRST visit
 * unlocks as soon as the user clicks anything (which then drains the
 * pending speech queue and writes the localStorage flag for next time).
 * ------------------------------------------------------------------ */

const INTERACTION_KEY = "closrai.voice.interacted";

function hasPriorInteractionInStorage(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(INTERACTION_KEY) === "1";
  } catch {
    return false;
  }
}

let hasUserInteracted = hasPriorInteractionInStorage();
const pendingSpeech: Array<() => void> = [];
const interactionListeners = new Set<() => void>();

function notifyInteraction() {
  if (!hasUserInteracted) {
    hasUserInteracted = true;
    try {
      window.localStorage.setItem(INTERACTION_KEY, "1");
    } catch {
      /* ignore */
    }
    console.info(
      "[voice] first user interaction — autoplay unlocked for this and future visits",
    );
  }
  // Drain any queued speech in order.
  while (pendingSpeech.length > 0) {
    const next = pendingSpeech.shift();
    try {
      next?.();
    } catch (err) {
      console.warn("[voice] queued speech failed", err);
    }
  }
  interactionListeners.forEach((l) => l());
  interactionListeners.clear();
}

if (typeof window !== "undefined") {
  const handler = () => notifyInteraction();
  window.addEventListener("pointerdown", handler, { once: true, capture: true });
  window.addEventListener("keydown", handler, { once: true, capture: true });
  window.addEventListener("touchstart", handler, { once: true, capture: true });
  if (hasUserInteracted) {
    console.info(
      "[voice] prior interaction found in localStorage — greeting will autoplay",
    );
  } else {
    console.info(
      "[voice] no prior interaction — greeting queued until first click/keypress",
    );
  }
}

/* ------------------------------------------------------------------
 * Engine priming
 *
 * Chrome's speechSynthesis pipeline cold-starts SLOW — the first
 * speak() of the session loses 200-400ms of audio at the start (the
 * "first words cut off" symptom). Workaround: fire a silent priming
 * utterance once per session BEFORE the first real one. By the time
 * we speak the real text, the audio pipeline is already warmed up
 * and onstart fires cleanly.
 *
 * We resolve the returned promise when priming completes (onend fires,
 * or 1.2s safety timeout — whichever first). All real speech awaits
 * this primingDone before queueing.
 * ------------------------------------------------------------------ */

let primingDone: Promise<void> | null = null;

function primeEngine(): Promise<void> {
  if (primingDone) return primingDone;
  if (typeof window === "undefined" || !window.speechSynthesis) {
    primingDone = Promise.resolve();
    return primingDone;
  }
  primingDone = new Promise<void>((resolve) => {
    const synth = window.speechSynthesis;
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      console.info("[voice] engine primed");
      resolve();
    };
    try {
      // ". " — short, has a leading silence + something to actually voice
      // so the engine commits to spinning up the pipeline. volume=0 keeps
      // it inaudible to the user.
      const primer = new SpeechSynthesisUtterance(". ");
      primer.volume = 0;
      primer.rate = 1;
      primer.pitch = 1;
      primer.onend = finish;
      primer.onerror = finish;
      synth.speak(primer);
      // Safety: if onend never fires (some browsers silently skip
      // volume=0 utterances), unblock after 1.2s anyway.
      setTimeout(finish, 1200);
    } catch (err) {
      console.warn("[voice] priming failed", err);
      finish();
    }
  });
  return primingDone;
}

type VoiceStatus = "idle" | "listening" | "speaking" | "network-error";

interface BuildRecognitionDeps {
  Ctor: SpeechCtor;
  onTranscriptRef: React.RefObject<(text: string) => void>;
  onStatus: (s: VoiceStatus | ((prev: VoiceStatus) => VoiceStatus)) => void;
  rebuild: () => void;
}

function buildRecognition(deps: BuildRecognitionDeps): BrowserSpeechRecognition {
  const { Ctor, onTranscriptRef, onStatus, rebuild } = deps;
  const rec = new Ctor();
  rec.continuous = false;
  rec.interimResults = false;
  rec.lang = "en-IN";
  rec.onresult = (ev) => {
    const transcript = Array.from(
      { length: ev.results.length },
      (_, i) => ev.results[i][0].transcript,
    ).join(" ");
    if (transcript.trim().length > 0) {
      onTranscriptRef.current?.(transcript.trim());
    }
  };
  rec.onerror = (ev) => {
    console.warn("[voice] recognition error", ev.error);
    if (ev.error === "network") {
      onStatus("network-error");
    } else {
      onStatus("idle");
    }
    try {
      rec.abort();
    } catch {
      /* noop */
    }
    // Force-rebuild so the next click starts from a clean instance.
    rebuild();
  };
  rec.onend = () => onStatus((prev) => (prev === "listening" ? "idle" : prev));
  return rec;
}

export function VoiceButton({ onTranscript, speakingText, disabled }: Props) {
  const supported = useSyncExternalStore(
    subscribeNoop,
    () => Boolean(getSpeechCtor()),
    () => false,
  );

  const [status, setStatus] = useState<VoiceStatus>("idle");
  const recognitionRef = useRef<BrowserSpeechRecognition | null>(null);
  const lastSpokenRef = useRef<string | null>(null);
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    if (!supported) return;
    const Ctor = getSpeechCtor();
    if (!Ctor) return;
    const rebuild = () => {
      const fresh = buildRecognition({
        Ctor,
        onTranscriptRef,
        onStatus: setStatus,
        rebuild,
      });
      recognitionRef.current = fresh;
    };
    rebuild();
    return () => {
      try {
        recognitionRef.current?.abort();
      } catch {
        /* noop */
      }
      recognitionRef.current = null;
    };
  }, [supported]);

  // TTS — speak each new assistant message exactly once.
  useEffect(() => {
    if (typeof window === "undefined" || !speakingText) return;
    if (lastSpokenRef.current === speakingText) return;
    lastSpokenRef.current = speakingText;

    const synth = window.speechSynthesis;
    if (!synth) return;

    const cleaned = safeSpeechText(speakingText);
    if (!cleaned) {
      console.warn("[voice] sanitized text was empty, not speaking");
      return;
    }

    /* Chrome clips the first ~150ms of an utterance when:
     *   (a) synth.cancel() was called right before synth.speak(), OR
     *   (b) the engine is warming up on first ever use.
     * Workarounds:
     *   - Prefix with a leading space so the clipping eats whitespace.
     *   - Only call cancel() if synth is *actually* speaking (avoid the
     *     gratuitous cancel that warmer browsers handle badly).
     *   - On cold-start, fire a near-silent priming utterance first,
     *     then speak the real one immediately after.
     */
    const speak = () => {
      const utter = new SpeechSynthesisUtterance(" " + cleaned);
      const voice = pickVoice();
      if (voice) {
        utter.voice = voice;
        utter.lang = voice.lang;
      } else {
        utter.lang = "en-IN";
      }
      utter.rate = 0.92;
      utter.pitch = 1.0;
      utter.volume = 1;
      utter.onstart = () => setStatus("speaking");
      utter.onend = () =>
        setStatus((prev) => (prev === "speaking" ? "idle" : prev));
      utter.onerror = (e) => {
        // Chrome fires onerror with "interrupted" / "canceled" whenever
        // we explicitly cancel — that's not a real failure.
        const realError = e.error && e.error !== "interrupted" && e.error !== "canceled";
        if (realError) console.warn("[voice] utterance error", e.error);
        setStatus((prev) => (prev === "speaking" ? "idle" : prev));
      };

      // Only cancel if something is currently playing AND it's stale —
      // skip the eager cancel that causes clipping on subsequent speaks.
      if (synth.speaking || synth.pending) {
        try {
          synth.cancel();
        } catch {
          /* noop */
        }
        // Give the engine a beat to settle after cancel.
        setTimeout(() => synth.speak(utter), 80);
      } else {
        synth.speak(utter);
      }
    };

    /**
     * Prime the engine first (silent warm-up), then a short natural pause,
     * then speak. This is what fixes "first words clipped" — by the time
     * `speak()` runs, the audio pipeline is already streaming so onstart
     * lines up with real audio output.
     *
     * 220ms gap reads as natural conversational latency (the bot "thought
     * for a moment"), not awkward silence.
     */
    const speakWhenReady = () => {
      const startSpeaking = () => {
        primeEngine().then(() => {
          setTimeout(speak, 220);
        });
      };

      if (synth.getVoices().length > 0) {
        startSpeaking();
        return;
      }
      let fired = false;
      const handler = () => {
        if (fired) return;
        fired = true;
        synth.removeEventListener?.("voiceschanged", handler);
        startSpeaking();
      };
      synth.addEventListener?.("voiceschanged", handler);
    };

    // Browsers reject speak() without a prior user gesture. If we haven't
    // had one yet, queue this speech so it fires on the first interaction.
    if (!hasUserInteracted) {
      pendingSpeech.push(speakWhenReady);
      return;
    }
    speakWhenReady();
  }, [speakingText]);

  if (!supported) return null;

  const listening = status === "listening";
  const speaking = status === "speaking";
  const errored = status === "network-error";

  const toggleListen = () => {
    // Belt-and-braces: ensure the autoplay gate is open even if the
    // global pointerdown listener missed this click for any reason.
    notifyInteraction();
    if (errored) {
      // Clear the error state on next click; user can try again.
      setStatus("idle");
    }
    if (listening) {
      try {
        recognitionRef.current?.stop();
      } catch {
        /* noop */
      }
      setStatus("idle");
      return;
    }
    const rec = recognitionRef.current;
    if (!rec) return;
    try {
      rec.start();
      setStatus("listening");
    } catch (err) {
      // "already started" — abort, rebuild a fresh recognition object, retry once.
      console.warn("[voice] start failed, rebuilding", err);
      try {
        rec.abort();
      } catch {
        /* noop */
      }
      const Ctor = getSpeechCtor();
      if (!Ctor) {
        setStatus("idle");
        return;
      }
      const localRebuild = () => {
        const next = buildRecognition({
          Ctor,
          onTranscriptRef,
          onStatus: setStatus,
          rebuild: localRebuild,
        });
        recognitionRef.current = next;
      };
      localRebuild();
      try {
        recognitionRef.current?.start();
        setStatus("listening");
      } catch (err2) {
        console.warn("[voice] rebuild + start still failed", err2);
        setStatus("idle");
      }
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={toggleListen}
        disabled={disabled}
        aria-pressed={listening}
        aria-label={
          errored
            ? "Voice input unavailable — network blocked it. Click to dismiss."
            : listening
            ? "Stop listening (voice input on)"
            : "Start voice input"
        }
        title={
          errored
            ? "Voice input unavailable on this network. Click to dismiss."
            : listening
            ? "Stop listening"
            : "Speak to the bot"
        }
        className={
          "voice-btn" +
          (listening ? " is-listening" : "") +
          (speaking ? " is-speaking" : "") +
          (errored ? " is-errored" : "")
        }
      >
        {listening && <span aria-hidden="true" className="voice-btn__pulse" />}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="18"
          height="18"
          aria-hidden="true"
        >
          <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
          <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
          <path d="M12 18v4" />
          <path d="M8 22h8" />
        </svg>
      </button>
      {/* Screen-reader-only "reading aloud" cue so blind users get a polite
          announcement without showing a duplicate caption to sighted users
          (the transcript already shows the spoken text). */}
      {speaking && speakingText && (
        <span className="sr-only" role="status" aria-live="polite">
          Reading aloud.
        </span>
      )}

      <style>{`
        .voice-btn {
          position: relative;
          width: 40px; height: 40px;
          border-radius: 50%;
          background: var(--surface);
          color: var(--ink-soft);
          border: 1px solid var(--line);
          cursor: pointer;
          display: inline-flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          transition: background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease);
        }
        .voice-btn:hover:not(:disabled) {
          background: var(--surface-2); color: var(--ink);
        }
        .voice-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .voice-btn.is-listening {
          color: white;
          background: var(--terracotta);
          border-color: var(--terracotta-deep);
        }
        .voice-btn.is-errored {
          color: oklch(0.40 0.16 25);
          background: oklch(0.97 0.04 25);
          border-color: oklch(0.80 0.10 25);
        }
        .voice-btn__pulse {
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px solid var(--terracotta);
          opacity: 0.6;
          animation: voice-pulse 1.4s ease-out infinite;
          pointer-events: none;
        }
        @keyframes voice-pulse {
          0%   { transform: scale(0.95); opacity: 0.6; }
          70%  { transform: scale(1.2);  opacity: 0; }
          100% { transform: scale(1.2);  opacity: 0; }
        }
        .voice-btn.is-speaking::after {
          content: "";
          position: absolute;
          bottom: -2px; right: -2px;
          width: 10px; height: 10px;
          border-radius: 50%;
          background: var(--honey);
          border: 2px solid var(--surface);
        }
      `}</style>
    </>
  );
}
