"use client";

import { useEffect, useState } from "react";
import PlayerCard from "@/components/PlayerCard";
import SearchBar from "@/components/SearchBar";
import { listPlayers, smartSearch } from "@/lib/api";
import type { PlayerSummary, Role, SmartSearchResponse } from "@/lib/types";

export default function ScoutPage() {
  const [topPlayers, setTopPlayers] = useState<PlayerSummary[]>([]);
  const [search, setSearch] = useState<SmartSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listPlayers().then(setTopPlayers).catch(() => setError("Couldn't load players."));
  }, []);

  async function handleSearch(query: string, role?: Role) {
    setError(null);
    if (!query) {
      setSearch(null);
      setBusy(true);
      try {
        setTopPlayers(await listPlayers({ role }));
      } finally {
        setBusy(false);
      }
      return;
    }
    setBusy(true);
    try {
      const res = await smartSearch(query);
      setSearch(res);
      if (res.results.length === 0) {
        setError("No players matched that query. Try e.g. \"left-arm death bowler under ₹50 lakh\".");
      }
    } catch {
      setError("Search failed — is the backend running?");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="space-y-3 pt-4 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Find the next <span className="text-series">match-winner</span>
        </h1>
        <p className="mx-auto max-w-xl text-ink-secondary">
          Describe who you need in plain English. Every recommendation comes with the
          numbers behind it — no black boxes.
        </p>
      </section>

      <SearchBar onSearch={handleSearch} busy={busy} />

      {error && (
        <p className="rounded-xl border border-hairline bg-surface px-4 py-3 text-sm text-warn">{error}</p>
      )}

      {search ? (
        <section className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-ink-muted">Interpreted as</span>
            <span className="rounded-full border border-series bg-series/10 px-3 py-1 text-sm text-foreground">
              {search.interpretation || "all players"}
            </span>
          </div>
          <div className="space-y-3">
            {search.results.map((r) => (
              <PlayerCard key={r.player.id} player={r.player} similarity={r.similarity} reason={r.matchReason} />
            ))}
          </div>
        </section>
      ) : (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Highest IPL readiness
          </h2>
          <div className="space-y-3">
            {topPlayers.map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
