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
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(speakingText);
    utter.lang = "en-IN";
    utter.rate = 1.05;
    utter.pitch = 1;
    utter.onstart = () => setSpeaking(true);
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    synth.speak(utter);
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
    <button
      type="button"
      onClick={toggleListen}
      disabled={disabled}
      title={listening ? "Stop listening" : "Speak to the bot"}
      className={`relative h-9 w-9 shrink-0 inline-flex items-center justify-center rounded-xl border bg-zinc-900 disabled:opacity-40 transition-colors ${ACCENT_CLASSES[accent]}`}
    >
      {listening ? (
        <span className="absolute inset-0 rounded-xl border border-current animate-ping" />
      ) : null}
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-4 h-4"
      >
        <path d="M12 2a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
        <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
        <path d="M12 18v4" />
        <path d="M8 22h8" />
      </svg>
      {speaking && (
        <span className="absolute -bottom-1 -right-1 text-[8px] bg-zinc-950 px-1 rounded-full">
          🔊
        </span>
      )}
    </button>
  );
}
