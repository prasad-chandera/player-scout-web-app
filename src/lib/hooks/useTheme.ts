"use client";

import { useCallback, useEffect, useState } from "react";
import { THEME_STORAGE_KEY, type Theme } from "@/lib/theme";

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

/** The theme the anti-FOUC script already resolved on <html>, else the OS setting. */
function currentTheme(): Theme {
  const attr = document.documentElement.dataset.theme;
  if (attr === "light" || attr === "dark") return attr;
  return systemTheme();
}

function storedChoice(): Theme | null {
  try {
    const t = localStorage.getItem(THEME_STORAGE_KEY);
    return t === "light" || t === "dark" ? t : null;
  } catch {
    return null;
  }
}

/** Persists an explicit choice: stamp <html data-theme> (pins it over the OS) + localStorage. */
function apply(next: Theme) {
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem(THEME_STORAGE_KEY, next);
  } catch {
    // ignore (private mode etc.) — theme still applies for this session
  }
}

export interface UseThemeResult {
  theme: Theme;
  /** true once mounted on the client; use to gate SSR-unsafe UI (icons) */
  mounted: boolean;
  toggle: () => void;
  setTheme: (next: Theme) => void;
}

/**
 * Owns the light/dark theme: reads the value the anti-FOUC script resolved,
 * lets you flip/set it (persisted + stamped on <html>), and keeps in sync with
 * other tabs and — while no explicit choice is set — the OS preference.
 */
export function useTheme(): UseThemeResult {
  // `mounted` guards SSR/client mismatch — the server can't know the theme.
  const [mounted, setMounted] = useState(false);
  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    setThemeState(currentTheme());
    setMounted(true);
  }, []);

  const setTheme = useCallback((next: Theme) => {
    apply(next);
    setThemeState(next);
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      apply(next);
      return next;
    });
  }, []);

  // Cross-tab sync: mirror an explicit choice made in another tab.
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== THEME_STORAGE_KEY) return;
      if (e.newValue === "light" || e.newValue === "dark") {
        document.documentElement.dataset.theme = e.newValue;
        setThemeState(e.newValue);
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Follow the OS live, but only while the user hasn't pinned a choice.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    function onChange(e: MediaQueryListEvent) {
      if (storedChoice() === null) setThemeState(e.matches ? "dark" : "light");
    }
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return { theme, mounted, toggle, setTheme };
}
