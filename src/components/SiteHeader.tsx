"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { A11yPanelButton } from "./A11ySettings";

interface NavItem {
  href: string;
  label: string;
  matches: (pathname: string) => boolean;
}

const ITEMS: NavItem[] = [
  {
    href: "/",
    label: "Overview",
    matches: (p) => p === "/",
  },
  {
    href: "/chat/sales",
    label: "Sales",
    matches: (p) => p === "/chat/sales",
  },
  {
    href: "/chat/support",
    label: "Support",
    matches: (p) => p === "/chat/support",
  },
  {
    href: "/chat/care",
    label: "Care",
    matches: (p) => p === "/chat/care",
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    matches: (p) => p === "/dashboard" || p.startsWith("/dashboard/"),
  },
  {
    href: "/accessibility",
    label: "Accessibility",
    matches: (p) => p === "/accessibility",
  },
];

export function SiteHeader() {
  const pathname = usePathname() ?? "/";

  return (
    <header className="site-header">
      <div className="site-header__row">
        <Link href="/" className="brand" aria-label="ClosrAI home">
          <span className="brand__mark" aria-hidden="true" />
          <span className="brand__name">closrai</span>
        </Link>

        <nav aria-label="Primary" className="site-nav">
          {ITEMS.map((it) => {
            const active = it.matches(pathname);
            return (
              <Link
                key={it.href}
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={"site-nav__a" + (active ? " is-active" : "")}
              >
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="site-header__actions">
          <A11yPanelButton />
        </div>
      </div>

      <style>{`
        .site-header {
          position: sticky; top: 0; z-index: 50;
          background: color-mix(in oklab, var(--bg) 78%, transparent);
          backdrop-filter: saturate(180%) blur(20px);
          -webkit-backdrop-filter: saturate(180%) blur(20px);
          border-bottom: 1px solid color-mix(in oklab, var(--ink) 8%, transparent);
        }
        .site-header__row {
          max-width: 1024px;
          margin: 0 auto;
          padding: 0 22px;
          height: 44px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 18px;
        }
        .brand {
          display: inline-flex; align-items: center; gap: 8px;
          color: var(--ink);
          font-weight: 500;
          font-size: 0.85rem;
          letter-spacing: -0.01em;
          text-decoration: none;
        }
        .brand:hover { text-decoration: none; }
        .brand__mark {
          width: 14px; height: 14px;
          border-radius: 50%;
          background: radial-gradient(circle at 30% 25%, oklch(0.85 0.14 60), oklch(0.50 0.18 32));
          box-shadow: inset 0 -1.5px 3px rgba(0,0,0,.25), inset 0 1.5px 2px rgba(255,255,255,.45);
        }
        .brand__name { letter-spacing: 0.01em; }

        .site-nav {
          display: flex; gap: 6px;
        }
        .site-nav__a {
          padding: 0 12px;
          height: 28px;
          display: inline-flex; align-items: center;
          color: var(--ink-soft);
          font-size: 0.82rem;
          letter-spacing: -0.005em;
          border-radius: 6px;
          text-decoration: none;
        }
        .site-nav__a:hover { color: var(--ink); text-decoration: none; }
        .site-nav__a.is-active { color: var(--ink); font-weight: 500; }

        .site-header__actions { display: flex; gap: 10px; align-items: center; }
        @media (max-width: 820px) {
          .site-nav { display: none; }
        }
      `}</style>
    </header>
  );
}
