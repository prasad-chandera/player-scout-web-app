"use client";

import { useEffect, useState } from "react";
import PlayerCard from "@/components/PlayerCard";
import SearchBar from "@/components/SearchBar";
import { listPlayers, searchSimilar } from "@/lib/api";
import type { PlayerSummary, Role, SimilarSearchResponse } from "@/lib/types";

export default function ScoutPage() {
  const [topPlayers, setTopPlayers] = useState<PlayerSummary[]>([]);
  const [similar, setSimilar] = useState<SimilarSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    listPlayers().then(setTopPlayers).catch(() => setError("Couldn't load players."));
  }, []);

  async function handleSearch(query: string, role?: Role) {
    setError(null);
    if (!query) {
      setSimilar(null);
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
      const res = await searchSimilar({ description: query, excludeIpl: true, limit: 8 });
      if ("error" in res) {
        setSimilar(null);
        setError(res.error);
      } else {
        setSimilar(res);
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
          Search domestic players by skill profile. Every recommendation comes with
          the numbers behind it — no black boxes.
        </p>
      </section>

      <SearchBar onSearch={handleSearch} busy={busy} />

      {error && (
        <p className="rounded-xl border border-hairline bg-surface px-4 py-3 text-sm text-warn">{error}</p>
      )}

      {similar ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Players most similar to {similar.reference.name}
          </h2>
          <div className="space-y-3">
            {similar.results.map((r) => (
              <PlayerCard key={r.player.id} player={r.player} similarity={r.similarity} />
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
