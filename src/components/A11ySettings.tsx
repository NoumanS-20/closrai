"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

export interface A11ySettings {
  highContrast: boolean;
  largeText: boolean;
  dyslexicFont: boolean;
  reduceMotion: boolean;
  underlineLinks: boolean;
}

const DEFAULTS: A11ySettings = {
  highContrast: false,
  largeText: false,
  dyslexicFont: false,
  reduceMotion: false,
  underlineLinks: false,
};

const STORAGE_KEY = "closrai.a11y.v1";

interface ContextValue {
  settings: A11ySettings;
  setSetting: <K extends keyof A11ySettings>(key: K, value: A11ySettings[K]) => void;
  reset: () => void;
}

const A11yContext = createContext<ContextValue | null>(null);

function applyToHtml(settings: A11ySettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.dataset.a11yContrast = settings.highContrast ? "high" : "default";
  root.dataset.a11yText = settings.largeText ? "large" : "default";
  root.dataset.a11yFont = settings.dyslexicFont ? "dyslexic" : "default";
  root.dataset.a11yMotion = settings.reduceMotion ? "reduce" : "default";
  root.dataset.a11yLinks = settings.underlineLinks ? "underline" : "default";
}

// Module-level lazy-initialised store.
const store: { settings: A11ySettings | null; listeners: Set<() => void> } = {
  settings: null,
  listeners: new Set(),
};

function readInitial(): A11ySettings {
  if (typeof window === "undefined") return DEFAULTS;
  let next: A11ySettings = { ...DEFAULTS };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<A11ySettings>;
      next = { ...next, ...parsed };
    }
  } catch {
    /* ignore */
  }
  try {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      next = { ...next, reduceMotion: true };
    }
  } catch {
    /* ignore */
  }
  return next;
}

function ensureInit(): A11ySettings {
  if (store.settings) return store.settings;
  const initial = readInitial();
  store.settings = initial;
  applyToHtml(initial);
  return initial;
}

function getSnapshot(): A11ySettings {
  return ensureInit();
}

function getServerSnapshot(): A11ySettings {
  return DEFAULTS;
}

function subscribe(listener: () => void): () => void {
  store.listeners.add(listener);
  return () => {
    store.listeners.delete(listener);
  };
}

function writeStore(next: A11ySettings) {
  store.settings = next;
  applyToHtml(next);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  store.listeners.forEach((l) => l());
}

export function A11yProvider({ children }: { children: React.ReactNode }) {
  const settings = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setSetting = useCallback(
    <K extends keyof A11ySettings>(key: K, value: A11ySettings[K]) => {
      writeStore({ ...(store.settings ?? DEFAULTS), [key]: value });
    },
    [],
  );

  const reset = useCallback(() => writeStore(DEFAULTS), []);

  return (
    <A11yContext.Provider value={{ settings, setSetting, reset }}>
      {children}
    </A11yContext.Provider>
  );
}

export function useA11y(): ContextValue {
  const ctx = useContext(A11yContext);
  if (!ctx) {
    // Safe fallback so a missing provider doesn't crash a page
    return {
      settings: DEFAULTS,
      setSetting: () => {},
      reset: () => {},
    };
  }
  return ctx;
}

export function A11yPanelButton() {
  const { settings, setSetting, reset } = useA11y();
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) {
      // Move focus into the dialog after it mounts
      const firstFocusable =
        dialogRef.current?.querySelector<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])',
        );
      firstFocusable?.focus();
    } else {
      buttonRef.current?.focus();
    }
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Accessibility settings"
        aria-expanded={open}
        aria-haspopup="dialog"
        className="inline-flex items-center justify-center w-9 h-9 rounded-lg border border-zinc-800 hover:border-zinc-600 bg-zinc-950 text-zinc-300 hover:text-zinc-100 transition-colors"
        title="Accessibility settings"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          width="16"
          height="16"
          aria-hidden="true"
        >
          <circle cx="12" cy="4" r="2" />
          <path d="M19 13v-2a7 7 0 0 0-14 0v2" />
          <path d="M12 15v7" />
          <path d="M8 22h8" />
          <path d="M9 9h6" />
        </svg>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[2147483646] flex items-end sm:items-center justify-center p-4 bg-zinc-950/70 backdrop-blur"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="a11y-dialog-title"
            className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h2
                id="a11y-dialog-title"
                className="text-lg font-semibold text-zinc-100"
              >
                Accessibility
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close accessibility settings"
                className="text-zinc-400 hover:text-zinc-100 w-8 h-8 rounded-lg border border-zinc-800 hover:border-zinc-600"
              >
                ×
              </button>
            </div>

            <p className="text-sm text-zinc-400">
              These settings persist on this device. They follow{" "}
              <code className="text-emerald-300">prefers-reduced-motion</code>{" "}
              automatically if your OS asks.
            </p>

            <div className="space-y-2">
              <Toggle
                id="a11y-contrast"
                label="High contrast"
                description="Boost background and text contrast for low-vision readability."
                checked={settings.highContrast}
                onChange={(v) => setSetting("highContrast", v)}
              />
              <Toggle
                id="a11y-text"
                label="Larger text"
                description="Bumps base font size to 18px (default is 16px)."
                checked={settings.largeText}
                onChange={(v) => setSetting("largeText", v)}
              />
              <Toggle
                id="a11y-font"
                label="Dyslexia-friendly font"
                description="Switches body text to a dyslexia-optimized font stack."
                checked={settings.dyslexicFont}
                onChange={(v) => setSetting("dyslexicFont", v)}
              />
              <Toggle
                id="a11y-motion"
                label="Reduce motion"
                description="Disables animations and transitions site-wide."
                checked={settings.reduceMotion}
                onChange={(v) => setSetting("reduceMotion", v)}
              />
              <Toggle
                id="a11y-links"
                label="Always underline links"
                description="Adds explicit underlines to all link text."
                checked={settings.underlineLinks}
                onChange={(v) => setSetting("underlineLinks", v)}
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={reset}
                className="text-xs text-zinc-400 hover:text-zinc-200"
              >
                Reset to defaults
              </button>
              <a
                href="/accessibility"
                className="text-xs text-emerald-300 hover:text-emerald-200"
              >
                Read our a11y commitments →
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Toggle({
  id,
  label,
  description,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      htmlFor={id}
      className="flex items-start justify-between gap-3 rounded-xl border border-zinc-800 p-3 cursor-pointer hover:bg-zinc-900/50 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-zinc-100">{label}</div>
        <div className="text-xs text-zinc-400 mt-0.5">{description}</div>
      </div>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="sr-only peer"
      />
      <span
        aria-hidden="true"
        className="relative shrink-0 w-10 h-6 rounded-full bg-zinc-800 peer-checked:bg-emerald-500/80 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-zinc-950 peer-focus-visible:ring-emerald-400"
      >
        <span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-zinc-950 shadow transition-transform peer-checked:translate-x-4" />
      </span>
    </label>
  );
}
