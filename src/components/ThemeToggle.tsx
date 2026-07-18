"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "scoutiq-theme";

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** Reads the theme the anti-FOUC script already resolved on <html>. */
function currentTheme(): Theme {
  const attr = document.documentElement.dataset.theme;
  if (attr === "light" || attr === "dark") return attr;
  return systemTheme();
}

export default function ThemeToggle() {
  // `mounted` guards against SSR/client mismatch — the server can't know the theme.
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(currentTheme());
    setMounted(true);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // ignore (private mode etc.) — theme still applies for this session
    }
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={mounted ? `Switch to ${isDark ? "light" : "dark"} theme` : "Toggle theme"}
      title={mounted ? `Switch to ${isDark ? "light" : "dark"} theme` : "Toggle theme"}
      className="ml-auto flex size-9 items-center justify-center rounded-lg border border-hairline text-ink-secondary transition-colors hover:bg-surface hover:text-foreground"
    >
      {/* Render an icon only after mount to avoid a hydration mismatch. */}
      {mounted && (isDark ? <SunIcon /> : <MoonIcon />)}
    </button>
  );
}

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}
