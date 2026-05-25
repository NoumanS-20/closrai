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
function sanitizeForSpeech(text: string): string {
  if (!text) return text;
  let out = text;
  // Strip emoji / pictographs / symbols. Two passes for engines that don't
  // support property escapes — first the property-escape pass, then a fallback
  // range-based pass for older runtimes.
  try {
    out = out.replace(/\p{Extended_Pictographic}/gu, "");
  } catch {
    // Older engine; fall back to a coarse surrogate range strip
    out = out.replace(/[‍☀-➿\ud83c-\ud83e][퀀-\udfff]?/g, "");
  }
  // Strip variation selectors + zero-width joiners that may linger
  out = out.replace(/[‍️​]/g, "");
  // Collapse repeated whitespace and trim
  out = out.replace(/\s+/g, " ").trim();
  return out;
}

export function VoiceButton({ onTranscript, speakingText, disabled }: Props) {
  const supported = useSyncExternalStore(
    subscribeNoop,
    () => Boolean(getSpeechCtor()),
    () => false,
  );

  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
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
        onTranscriptRef.current(transcript.trim());
      }
    };
    rec.onerror = (ev) => {
      console.warn("[voice] recognition error", ev.error);
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    return () => {
      try {
        rec.abort();
      } catch {
        /* noop */
      }
      recognitionRef.current = null;
    };
  }, [supported]);

  useEffect(() => {
    if (typeof window === "undefined" || !speakingText) return;
    if (lastSpokenRef.current === speakingText) return;
    lastSpokenRef.current = speakingText;
    const synth = window.speechSynthesis;
    if (!synth) return;

    const cleaned = sanitizeForSpeech(speakingText);
    if (!cleaned) return; // nothing speakable after stripping emojis/symbols

    synth.cancel();

    const speak = () => {
      const utter = new SpeechSynthesisUtterance(cleaned);
      const voice = pickVoice();
      if (voice) {
        utter.voice = voice;
        utter.lang = voice.lang;
      } else {
        utter.lang = "en-IN";
      }
      // Steady, unhurried delivery. Rate down a touch + neutral pitch makes
      // a big difference on the cheaper voices' pronunciation.
      utter.rate = 0.92;
      utter.pitch = 1.0;
      utter.volume = 1;
      utter.onstart = () => setSpeaking(true);
      utter.onend = () => setSpeaking(false);
      utter.onerror = () => setSpeaking(false);
      synth.speak(utter);
    };

    // Some browsers populate the voices list asynchronously the first time
    if (synth.getVoices().length === 0) {
      const handler = () => {
        synth.removeEventListener?.("voiceschanged", handler);
        speak();
      };
      synth.addEventListener?.("voiceschanged", handler);
      // safety: fire anyway in case the event never fires
      setTimeout(speak, 250);
    } else {
      speak();
    }
  }, [speakingText]);

  if (!supported) return null;

  const toggleListen = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    try {
      recognitionRef.current?.start();
      setListening(true);
    } catch (err) {
      console.warn("[voice] failed to start recognition", err);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={toggleListen}
        disabled={disabled}
        aria-pressed={listening}
        aria-label={listening ? "Stop listening (voice input on)" : "Start voice input"}
        title={listening ? "Stop listening" : "Speak to the bot"}
        className={"voice-btn" + (listening ? " is-listening" : "") + (speaking ? " is-speaking" : "")}
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
