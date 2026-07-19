// Single source of truth for theme wiring, shared by the anti-FOUC inline
// script (layout.tsx) and the useTheme hook so the storage key can never drift.

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "scoutiq-theme";

// Runs before first paint (inlined in <head>) to apply the stored choice and
// avoid a flash of the wrong theme. Stored choice wins; otherwise data-theme is
// left unset so the OS setting (via CSS prefers-color-scheme) decides.
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t==="light"||t==="dark"){document.documentElement.dataset.theme=t;}}catch(e){}})();`;
