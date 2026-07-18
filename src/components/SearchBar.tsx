"use client";

import { useState } from "react";
import type { Role } from "@/lib/types";

const ROLES: { value: Role | undefined; label: string }[] = [
  { value: undefined, label: "All roles" },
  { value: "batter", label: "Batters" },
  { value: "bowler", label: "Bowlers" },
  { value: "allrounder", label: "All-rounders" },
];

export default function SearchBar({
  onSearch,
  busy,
}: {
  onSearch: (query: string, role?: Role) => void;
  busy?: boolean;
}) {
  const [text, setText] = useState("");
  const [role, setRole] = useState<Role | undefined>(undefined);

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(text.trim(), role);
      }}
    >
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder='Try "find the next Bumrah"…'
          className="flex-1 rounded-xl border border-hairline bg-surface px-4 py-3 text-foreground placeholder:text-ink-muted focus:border-series focus:outline-none"
          aria-label="Player search"
        />
        <button
          type="submit"
          disabled={busy}
          className="rounded-xl bg-series px-5 py-3 font-semibold text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Searching…" : "Scout"}
        </button>
      </div>
      <div className="flex gap-2">
        {ROLES.map((r) => (
          <button
            key={r.label}
            type="button"
            onClick={() => setRole(r.value)}
            className={`rounded-full border px-3 py-1 text-sm transition-colors ${
              role === r.value
                ? "border-series bg-series/20 text-foreground"
                : "border-hairline text-ink-secondary hover:border-series"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>
    </form>
  );
}
