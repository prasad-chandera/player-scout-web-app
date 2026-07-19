"use client";

import { ErrorState } from "@/components/feedback/ErrorState";
import { PlayerCard } from "@/components/ui/PlayerCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SearchBar, useScout } from "@/features/scout";

export default function ScoutPage() {
  const { result, hasSearched, error, busy, runSearch } = useScout();

  return (
    <div className="space-y-10">
      <section className="hero-aura rise-in space-y-5 pt-6 pb-2 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-ink-secondary">
          <span className="size-1.5 rounded-full bg-series" /> AI scouting for domestic cricket
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
        <SearchBar onSearch={runSearch} busy={busy} />
      </div>

      {error && <ErrorState message={error} />}

      {result ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-widest text-ink-muted">Interpreted as</span>
            <span className="rounded-full border border-series bg-series/10 px-3 py-1 text-sm font-medium text-foreground">
              {result.interpretation || "all players"}
            </span>
          </div>
          {result.players.length > 0 ? (
            <div className="grid gap-3">
              {result.players.map((p) => (
                <PlayerCard key={p.id} player={p} />
              ))}
            </div>
          ) : (
            <p className="py-8 text-center text-ink-secondary">
              No players matched that search. Try describing a role, skill, or budget.
            </p>
          )}
        </section>
      ) : (
        !busy &&
        !hasSearched && (
          <section className="space-y-3 py-8 text-center">
            <SectionHeading sub="e.g. “a left-arm death bowler under ₹50 lakh” or “aggressive top-order batter”.">
              Search to discover players
            </SectionHeading>
          </section>
        )
      )}
    </div>
  );
}
