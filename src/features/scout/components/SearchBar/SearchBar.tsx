"use client";

import { useState } from "react";
import type { PlayerRole } from "@/lib/types";

const ROLES: { value: PlayerRole | undefined; label: string }[] = [
  { value: undefined, label: "All roles" },
  { value: "batter", label: "Batters" },
  { value: "bowler", label: "Bowlers" },
  { value: "allrounder", label: "All-rounders" },
];

export interface SearchBarProps {
  onSearch: (query: string, role?: PlayerRole) => void;
  busy?: boolean;
}

export function SearchBar({ onSearch, busy }: SearchBarProps) {
  const [text, setText] = useState("");
  const [role, setRole] = useState<PlayerRole | undefined>(undefined);

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(text.trim(), role);
      }}
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="group relative flex-1">
          <SearchIcon />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder='Try "a left-arm death bowler under ₹50 lakh"…'
            className="w-full rounded-2xl border border-hairline bg-surface-raised py-4 pl-11 pr-4 text-foreground shadow-[var(--shadow-1)] transition-shadow placeholder:text-ink-muted focus:outline-none focus:[box-shadow:var(--glow-brand)]"
            aria-label="Player search"
          />
        </div>
        <button
          type="submit"
          disabled={busy}
          className="rounded-2xl px-7 py-4 font-display text-lg font-semibold uppercase tracking-wide text-on-primary shadow-[var(--shadow-1)] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
          style={{ background: "var(--grad-brand)" }}
        >
          {busy ? "Scouting…" : "Scout"}
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {ROLES.map((r) => (
          <button
            key={r.label}
            type="button"
            onClick={() => setRole(r.value)}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              role === r.value
                ? "border-transparent bg-series text-on-primary"
                : "border-hairline text-ink-secondary hover:border-series hover:text-foreground"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </form>
  );
}

function SearchIcon() {
  return (
    <svg
      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
