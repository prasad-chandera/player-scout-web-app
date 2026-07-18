"use client";

import { useEffect, useState } from "react";
import PlayerCard from "@/components/PlayerCard";
import SearchBar from "@/components/SearchBar";
import SectionHeading from "@/components/SectionHeading";
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
    <div className="space-y-10">
      <section className="hero-aura rise-in space-y-5 pt-6 pb-2 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-ink-secondary">
          <span className="size-1.5 rounded-full bg-series" /> Moneyball for the IPL
        </span>
        <h1 className="font-display text-5xl font-bold uppercase leading-[0.95] tracking-tight sm:text-6xl">
          Find the next
          <br />
          <span className="text-gradient">match-winner</span>
        </h1>
        <p className="mx-auto max-w-xl text-base text-ink-secondary">
          Just tell us the kind of player you&apos;re looking for — in everyday words.
          Every suggestion comes with the real stats behind it, so you can always see why.
        </p>
      </section>

      <div className="mx-auto max-w-3xl">
        <SearchBar onSearch={handleSearch} busy={busy} />
      </div>

      {error && (
        <p className="rounded-xl border border-hairline bg-surface px-4 py-3 text-sm text-warn">{error}</p>
      )}

      {search ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">Interpreted as</span>
            <span className="rounded-full border border-series bg-series/10 px-3 py-1 text-sm font-medium text-foreground">
              {search.interpretation || "all players"}
            </span>
          </div>
          <div className="grid gap-3">
            {search.results.map((r) => (
              <PlayerCard key={r.player.id} player={r.player} similarity={r.similarity} reason={r.matchReason} />
            ))}
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          <SectionHeading sub="Domestic players ranked by our transparent readiness score.">
            Highest IPL readiness
          </SectionHeading>
          <div className="grid gap-3">
            {topPlayers.map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
