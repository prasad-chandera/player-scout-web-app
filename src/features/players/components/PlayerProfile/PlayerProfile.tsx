"use client";

import { AILoader } from "@/components/ui/AILoader";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PlayerCard } from "@/components/ui/PlayerCard";
import { RoleIcon, ROLE_META } from "@/components/ui/RoleIcon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SimilarityBadge } from "@/components/ui/SimilarityBadge";
import { StatTile } from "@/components/ui/StatTile";
import { ApiError } from "@/lib/api";
import { usePlayerProfile } from "@/features/players/hooks";
import { ComparisonTable } from "@/features/players/components/ComparisonTable";
import { PhaseBarChart } from "@/features/players/components/PhaseBarChart";
import { RadarChartCard } from "@/features/players/components/RadarChartCard";

/** Client-driven player detail — every backend call is a real browser request. */
export function PlayerProfile({ id }: { id: string }) {
  const { details, radar, phase, similar, closest, comparison } = usePlayerProfile(id);

  if (details.isPending) return <AILoader label="Analyzing this player" />;

  if (details.isError) {
    const notFound = details.error instanceof ApiError && details.error.status === 404;
    return <ErrorState message={notFound ? "Player not found." : (details.error as Error).message} />;
  }

  const player = details.data;
  const role = ROLE_META[player.role];
  const initials = player.name.split(" ").map((w) => w[0]).slice(0, 2).join("");

  return (
    <div className="space-y-8">
      <section className="hero-aura rise-in card overflow-hidden rounded-2xl p-6">
        <div className="flex flex-wrap items-center gap-5">
          <div
            className="flex size-20 items-center justify-center overflow-hidden rounded-2xl bg-cover bg-center font-display text-3xl font-bold ring-2"
            style={{
              background: player.imageUrl ? `url(${player.imageUrl}) center/cover` : "var(--surface)",
              color: role.accent,
            }}
          >
            {player.imageUrl ? "" : initials}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl font-bold uppercase tracking-wide sm:text-4xl">{player.name}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm text-ink-secondary">
              <span className="inline-flex items-center gap-1 font-medium" style={{ color: role.accent }}>
                <RoleIcon role={player.role} size={15} />
                {role.label}
              </span>
              {player.bowlingStyle ? ` · ${player.bowlingStyle}` : ""}
              {player.battingHand ? ` · ${player.battingHand}-hand bat` : ""}
              {player.age ? ` · age ${player.age.years}` : ""} · {player.competition.toUpperCase()}, {player.matches} matches
            </p>
            {player.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {player.tags.map((t) => (
                  <span key={t} className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] text-ink-secondary ring-1 ring-[var(--border)]">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
          <SimilarityBadge value={player.readinessScore} label="Impact" size={92} />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Est. price" value={player.estimatedPriceRange.label} tone="gold" />
          <StatTile label="Matches" value={String(player.matches)} />
          <StatTile label="Impact" value={String(Math.round(player.readinessScore))} tone="green" />
          <StatTile label={player.currentIPLTeam ? "Current IPL team" : "Competition"} value={player.currentIPLTeam ?? player.competition.toUpperCase()} />
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {radar.isPending ? (
          <AILoader card messages={["Computing skill radar…", "Reading skill vectors…"]} />
        ) : radar.data ? (
          <RadarChartCard name={player.name} scores={radar.data.scores} />
        ) : (
          <NoDataCard label="Skill radar not available for this player." />
        )}
        {phase.isPending ? (
          <AILoader card messages={["Crunching phase figures…", "Splitting powerplay · middle · death…"]} />
        ) : phase.data ? (
          <PhaseBarChart role={player.role} phases={phase.data.phases} />
        ) : (
          <NoDataCard label="Phase-by-phase figures not available for this player." />
        )}
      </div>

      {closest && comparison.isPending && (
        <AILoader card messages={["Comparing skill profiles…", "Explaining the match…"]} />
      )}
      {closest && comparison.data && (
        <section className="space-y-4">
          <SectionHeading>
            Why {player.name} resembles {closest.name} ({Math.round(comparison.data.matchScore)}% match)
          </SectionHeading>
          <div className="card rounded-2xl p-5">
            <p className="text-sm text-ink-secondary">{comparison.data.verdict}</p>
            {comparison.data.differences.length > 0 && (
              <ul className="mt-3 space-y-1.5 text-sm text-ink-secondary">
                {comparison.data.differences.map((d) => (
                  <li key={d} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                    {d}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <ComparisonTable referenceName={player.name} candidateName={closest.name} rows={comparison.data.comparisons} />
        </section>
      )}

      <section className="space-y-4">
        <SectionHeading>Similar players</SectionHeading>
        {similar.isPending ? (
          <AILoader card messages={["Finding similar players…", "Ranking by match score…"]} />
        ) : similar.data && similar.data.players.length > 0 ? (
          <div className="grid gap-3">
            {similar.data.players.map((sp) => (
              <PlayerCard key={sp.id} player={sp} matchScore={sp.matchScore} />
            ))}
          </div>
        ) : (
          <NoDataCard label="No similar players found." />
        )}
      </section>
    </div>
  );
}

function NoDataCard({ label }: { label: string }) {
  return (
    <div className="card flex items-center justify-center rounded-2xl p-4 text-sm text-ink-muted">
      {label}
    </div>
  );
}
