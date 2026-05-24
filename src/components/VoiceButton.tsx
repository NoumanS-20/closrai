"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

interface Props {
  onTranscript: (text: string) => void;
  speakingText?: string;
  disabled?: boolean;
  accent?: "emerald" | "sky" | "violet";
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

const ACCENT_CLASSES: Record<NonNullable<Props["accent"]>, string> = {
  emerald: "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10",
  sky: "border-sky-500/40 text-sky-300 hover:bg-sky-500/10",
  violet: "border-violet-500/40 text-violet-300 hover:bg-violet-500/10",
};

function getSpeechCtor(): SpeechCtor | undefined {
  if (typeof window === "undefined") return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

function subscribeNoop(): () => void {
  return () => {};
}

/**
 * Pick the smoothest, most welcoming-sounding voice available on the device.
 *
 * Order of preference:
 *   1. Modern neural/online voices (Google "online", Microsoft "Natural", etc.)
 *      — these are dramatically more natural than the default offline voices.
 *   2. Known-good named voices ("Samantha" on macOS/iOS is the friendliest stock voice;
 *      "Google US English" on Chrome desktop is the second-best).
 *   3. Any en-US/en-IN female voice (generally friendlier-sounding default).
 *   4. Any en-* voice as fallback.
 *   5. Whatever the browser gives us.
 *
 * We avoid the default Microsoft David / Zira / Mark on Windows because they
 * sound robotic — but if those are all that's available, that's what we use.
 */
function pickFriendlyVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | undefined {
  if (voices.length === 0) return undefined;
  const en = voices.filter((v) => v.lang.toLowerCase().startsWith("en"));
  const pool = en.length > 0 ? en : voices;

  const scored = pool
    .map((v) => ({ voice: v, score: scoreVoice(v) }))
    .sort((a, b) => b.score - a.score);

  return scored[0]?.voice;
}

function scoreVoice(v: SpeechSynthesisVoice): number {
  const name = v.name.toLowerCase();
  let score = 0;

  // Strong positive signals: neural / online voices
  if (/natural|neural|online|wavenet|premium|enhanced/.test(name)) score += 100;

  // Modern Google / Microsoft online voices
  if (/google/.test(name) && /(en-us|english)/i.test(name + " " + v.lang)) score += 60;
  if (/microsoft.*(?:aria|jenny|guy|ana|libby|natasha)/.test(name)) score += 80;

  // Named-good stock voices
  if (/samantha|karen|moira|tessa|fiona|allison|ava/.test(name)) score += 70;

  // Friendlier-sounding female-coded voices by default
  if (/female|woman|girl/.test(name)) score += 20;

  // Locale boosts (prefer en-US then en-IN for Indian hackathon context)
  if (v.lang.toLowerCase() === "en-us") score += 15;
  if (v.lang.toLowerCase() === "en-in") score += 12;
  if (v.lang.toLowerCase() === "en-gb") score += 10;

  // Demote the robotic Windows defaults — they sound metallic
  if (/david|mark|zira|hazel/.test(name)) score -= 30;

  // Default voice gets a small boost so we don't override the user's OS choice
  // when nothing else stands out
  if (v.default) score += 3;

  return score;
}

export function VoiceButton({
  onTranscript,
  speakingText,
  disabled,
  accent = "emerald",
}: Props) {
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

    const speak = () => {
      synth.cancel();
      const utter = new SpeechSynthesisUtterance(speakingText);
      const voice = pickFriendlyVoice(synth.getVoices());
      if (voice) {
        utter.voice = voice;
        utter.lang = voice.lang;
      } else {
        utter.lang = "en-US";
      }
      utter.rate = 0.96;
      utter.pitch = 1.05;
      utter.volume = 1;
      utter.onstart = () => setSpeaking(true);
      utter.onend = () => setSpeaking(false);
      utter.onerror = () => setSpeaking(false);
      synth.speak(utter);
    };

    // Voices may load async on Chrome — wait one tick if the list is empty.
    if (synth.getVoices().length > 0) {
      speak();
    } else {
      const handler = () => {
        synth.removeEventListener("voiceschanged", handler);
        speak();
      };
      synth.addEventListener("voiceschanged", handler);
      // Fallback in case the event never fires
      setTimeout(speak, 300);
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
        aria-label={
          listening
            ? "Stop listening (voice input on)"
            : "Start voice input"
        }
        title={listening ? "Stop listening" : "Speak to the bot"}
        className={`relative h-9 w-9 shrink-0 inline-flex items-center justify-center rounded-xl border bg-zinc-900 disabled:opacity-40 transition-colors ${ACCENT_CLASSES[accent]}`}
      >
        {listening ? (
          <span
            aria-hidden="true"
            className="absolute inset-0 rounded-xl border border-current animate-ping"
          />
        ) : null}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
          <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
          <path d="M12 18v4" />
          <path d="M8 22h8" />
        </svg>
        {speaking && (
          <span
            aria-hidden="true"
            className="absolute -bottom-1 -right-1 text-[8px] bg-zinc-950 px-1 rounded-full"
          >
            🔊
          </span>
        )}
      </button>
      {/* Screen-reader-only announcement — the visible text is already in the
          chat bubble above the input, so we don't duplicate it on screen. */}
      {speaking && speakingText && (
        <div role="status" aria-live="polite" className="sr-only">
          Reading aloud: {speakingText}
        </div>
      )}
    </>
  );
}
