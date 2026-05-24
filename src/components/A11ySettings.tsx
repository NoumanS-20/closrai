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

export type TextSize = "default" | "large" | "xlarge";

export interface A11ySettings {
  highContrast: boolean;
  textSize: TextSize;
  dyslexia: boolean;
  // null = follow OS prefers-reduced-motion; true/false = manual override
  reduceMotion: boolean | null;
  underlineLinks: boolean;
}

const DEFAULTS: A11ySettings = {
  highContrast: false,
  textSize: "default",
  dyslexia: false,
  reduceMotion: null,
  underlineLinks: false,
};

const STORAGE_KEY = "closrai.a11y.v1";

interface ContextValue {
  settings: A11ySettings;
  set: (patch: Partial<A11ySettings>) => void;
  reset: () => void;
}

const A11yContext = createContext<ContextValue | null>(null);

function applyToHtml(settings: A11ySettings) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.setAttribute("data-text-size", settings.textSize);
  root.setAttribute("data-dyslexia", settings.dyslexia ? "true" : "false");
  root.setAttribute("data-high-contrast", settings.highContrast ? "true" : "false");
  root.setAttribute("data-underline-links", settings.underlineLinks ? "true" : "false");
  const osReduce =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const effective = settings.reduceMotion === null ? osReduce : settings.reduceMotion;
  root.setAttribute("data-reduce-motion", effective ? "true" : "false");
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

  const set = useCallback((patch: Partial<A11ySettings>) => {
    writeStore({ ...(store.settings ?? DEFAULTS), ...patch });
  }, []);

  const reset = useCallback(() => writeStore(DEFAULTS), []);

  return (
    <A11yContext.Provider value={{ settings, set, reset }}>
      {children}
    </A11yContext.Provider>
  );
}

export function useA11y(): ContextValue {
  const ctx = useContext(A11yContext);
  if (!ctx) {
    return {
      settings: DEFAULTS,
      set: () => {},
      reset: () => {},
    };
  }
  return ctx;
}

export function A11yPanelButton() {
  const { settings, set, reset } = useA11y();
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const focusTimer = window.setTimeout(() => {
      const firstControl = panelRef.current?.querySelector<HTMLElement>(
        "[role='switch'], [role='radio'], .a11y-reset",
      );
      firstControl?.focus();
    }, 0);

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        btnRef.current?.focus();
      }
      if (e.key === "Tab" && panelRef.current) {
        const controls = Array.from(
          panelRef.current.querySelectorAll<HTMLElement>(
            "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])",
          ),
        ).filter((el) => !el.hasAttribute("disabled"));
        if (controls.length === 0) return;
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    function onClick(e: MouseEvent) {
      const target = e.target as Node | null;
      if (
        target &&
        panelRef.current &&
        !panelRef.current.contains(target) &&
        btnRef.current &&
        !btnRef.current.contains(target)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <div style={{ position: "relative" }}>
      <button
        ref={btnRef}
        type="button"
        className="a11y-trigger"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="a11y-panel"
        aria-label="Accessibility settings"
        onClick={() => setOpen((o) => !o)}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.7" />
          <circle cx="12" cy="6.6" r="1.3" fill="currentColor" />
          <path
            d="M7 9.5h10M12 10.5v3m0 0l-2.5 5M12 13.5l2.5 5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
        <span>Accessibility</span>
      </button>
      {open && (
        <div
          ref={panelRef}
          id="a11y-panel"
          role="dialog"
          aria-label="Accessibility settings"
          className="a11y-panel"
        >
          <div className="a11y-panel__head">
            <strong>Accessibility</strong>
            <button
              type="button"
              aria-label="Close accessibility settings"
              onClick={() => {
                setOpen(false);
                btnRef.current?.focus();
              }}
              className="a11y-panel__close"
            >
              ✕
            </button>
          </div>

          <Row label="High contrast" hint="Boost color contrast site-wide">
            <Switch
              id="a11y-contrast"
              checked={settings.highContrast}
              onClick={() => set({ highContrast: !settings.highContrast })}
            />
          </Row>

          <div className="a11y-row">
            <span className="a11y-row__label">
              <span>Text size</span>
              <span className="a11y-row__hint">Adjust base font scaling</span>
            </span>
            <div className="a11y-seg" role="radiogroup" aria-label="Text size">
              {(["default", "large", "xlarge"] as TextSize[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  role="radio"
                  aria-checked={settings.textSize === s}
                  className={"a11y-seg__btn" + (settings.textSize === s ? " is-on" : "")}
                  onClick={() => set({ textSize: s })}
                >
                  {s === "default" ? "A" : s === "large" ? "A+" : "A++"}
                </button>
              ))}
            </div>
          </div>

          <Row label="Dyslexia-friendly font" hint="Atkinson Hyperlegible">
            <Switch
              id="a11y-dys"
              checked={settings.dyslexia}
              onClick={() => set({ dyslexia: !settings.dyslexia })}
            />
          </Row>

          <Row
            label="Reduce motion"
            hint={
              settings.reduceMotion === null
                ? "Following OS preference"
                : "Manual override"
            }
          >
            <Switch
              id="a11y-motion"
              checked={settings.reduceMotion === true}
              onClick={() =>
                set({
                  reduceMotion: settings.reduceMotion === true ? false : true,
                })
              }
            />
          </Row>

          <Row label="Underline links" hint="Always show link underlines">
            <Switch
              id="a11y-underline"
              checked={settings.underlineLinks}
              onClick={() => set({ underlineLinks: !settings.underlineLinks })}
            />
          </Row>

          <button type="button" className="a11y-reset" onClick={reset}>
            Reset to defaults
          </button>

          <style>{`
            .a11y-panel__head {
              display: flex; justify-content: space-between; align-items: center;
              margin-bottom: 14px;
            }
            .a11y-panel__head strong {
              font-family: var(--font-display); font-size: 1.15rem;
            }
            .a11y-panel__close {
              width: 28px; height: 28px; border-radius: 50%;
              background: var(--surface-2); border: 1px solid var(--line);
              cursor: pointer; color: var(--ink-soft);
            }
            .a11y-row {
              display: flex; align-items: center; justify-content: space-between;
              padding: 10px 0;
              border-top: 1px solid var(--line-soft);
              gap: 12px;
            }
            .a11y-row:first-of-type { border-top: 0; }
            .a11y-row__label { display: flex; flex-direction: column; gap: 2px; font-size: 0.92rem; font-weight: 500; cursor: pointer; }
            .a11y-row__hint { font-size: 0.75rem; color: var(--ink-mute); font-weight: 400; }
            .a11y-switch {
              width: 44px; height: 26px; border-radius: 999px;
              background: var(--line); border: 0; cursor: pointer;
              position: relative; transition: background var(--dur-fast) var(--ease);
              flex-shrink: 0;
            }
            .a11y-switch span {
              position: absolute; top: 3px; left: 3px;
              width: 20px; height: 20px; border-radius: 50%;
              background: var(--surface);
              box-shadow: 0 2px 4px rgba(0,0,0,.2);
              transition: left var(--dur-fast) var(--ease);
            }
            .a11y-switch.is-on { background: var(--terracotta); }
            .a11y-switch.is-on span { left: 21px; }
            .a11y-seg {
              display: flex; gap: 4px;
              background: var(--surface-2); padding: 3px; border-radius: var(--radius-pill);
              border: 1px solid var(--line);
            }
            .a11y-seg__btn {
              padding: 4px 10px; border: 0; background: transparent;
              border-radius: var(--radius-pill); cursor: pointer; font-weight: 600;
              color: var(--ink-soft);
            }
            .a11y-seg__btn.is-on { background: var(--ink); color: var(--surface); }
            .a11y-reset {
              margin-top: 10px; width: 100%;
              padding: 9px; border-radius: var(--radius-md);
              background: transparent; border: 1px dashed var(--line);
              color: var(--ink-soft); cursor: pointer; font-size: 0.85rem;
            }
            .a11y-reset:hover { background: var(--surface-2); color: var(--ink); }
          `}</style>
        </div>
      )}

      <style>{`
        .a11y-trigger {
          height: 32px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 0 11px;
          border: 1px solid var(--line);
          border-radius: var(--radius-pill);
          background: color-mix(in oklab, var(--surface) 88%, transparent);
          color: var(--ink-soft);
          cursor: pointer;
          font-size: 0.82rem;
          line-height: 1;
          white-space: nowrap;
          box-shadow: 0 1px 0 rgba(0, 0, 0, 0.03);
          transition:
            background var(--dur-fast) var(--ease),
            color var(--dur-fast) var(--ease),
            border-color var(--dur-fast) var(--ease);
        }
        .a11y-trigger:hover,
        .a11y-trigger[aria-expanded="true"] {
          background: var(--surface);
          color: var(--ink);
          border-color: var(--line);
        }
        .a11y-trigger svg {
          width: 18px;
          height: 18px;
          flex: 0 0 auto;
        }
        .a11y-panel {
          position: absolute;
          right: 0;
          top: calc(100% + 10px);
          width: min(340px, calc(100vw - 28px));
          background: var(--surface);
          border: 1px solid var(--line);
          border-radius: var(--radius-lg);
          box-shadow: var(--shadow-lift);
          padding: 18px;
          z-index: 1000;
        }
        @media (max-width: 520px) {
          .a11y-trigger {
            width: 34px;
            padding: 0;
          }
          .a11y-trigger span {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <div className="a11y-row">
      <span className="a11y-row__label">
        <span>{label}</span>
        <span className="a11y-row__hint">{hint}</span>
      </span>
      {children}
    </div>
  );
}

function Switch({
  id,
  checked,
  onClick,
}: {
  id: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      className={"a11y-switch" + (checked ? " is-on" : "")}
      onClick={onClick}
    >
      <span />
    </button>
  );
}
