"use client";

import { ErrorState } from "@/components/feedback/ErrorState";
import { PlayerCard } from "@/components/ui/PlayerCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SearchBar, useScout } from "@/features/scout";

export default function ScoutPage() {
  const { rankings, search, error, busy, runSearch } = useScout();

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
        <SearchBar onSearch={runSearch} busy={busy} />
      </div>

      {error && <ErrorState message={error} />}

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
            {rankings.map((p) => (
              <PlayerCard key={p.id} player={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
