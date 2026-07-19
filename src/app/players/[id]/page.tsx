import { notFound } from "next/navigation";
import { PlayerCard } from "@/components/ui/PlayerCard";
import { RoleIcon, ROLE_META } from "@/components/ui/RoleIcon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SimilarityBadge } from "@/components/ui/SimilarityBadge";
import { StatTile } from "@/components/ui/StatTile";
import { ComparisonTable, PhaseBarChart, RadarChartCard } from "@/features/players";
import { getEconomyByPhase, getPlayerComparison, getPlayerDetails, getSimilarPlayers, getSkillRadar } from "@/lib/api";

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = await getPlayerDetails(id).catch(() => null);
  if (!player) notFound();

  // Skills, phase figures and the similar list don't depend on each other — fetch in parallel.
  const [radar, phase, similar] = await Promise.all([
    getSkillRadar(id).catch(() => null),
    getEconomyByPhase(id).catch(() => null),
    getSimilarPlayers(player.name, 75).catch(() => null),
  ]);
  const closest = similar?.players[0] ?? null;
  const comparison = closest ? await getPlayerComparison(id, closest.id).catch(() => null) : null;

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
          <SimilarityBadge value={player.readinessScore} label="IPL ready" size={92} />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Est. price" value={player.estimatedPriceRange.label} tone="gold" />
          <StatTile label="Matches" value={String(player.matches)} />
          <StatTile label="Readiness" value={String(player.readinessScore)} tone="green" />
          <StatTile label={player.currentIPLTeam ? "Current IPL team" : "Competition"} value={player.currentIPLTeam ?? player.competition.toUpperCase()} />
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {radar ? (
          <RadarChartCard name={player.name} scores={radar.scores} />
        ) : (
          <div className="card flex items-center justify-center rounded-2xl p-4 text-sm text-ink-muted">
            Skill radar not available for this player.
          </div>
        )}
        {phase ? (
          <PhaseBarChart role={player.role} phases={phase.phases} />
        ) : (
          <div className="card flex items-center justify-center rounded-2xl p-4 text-sm text-ink-muted">
            Phase-by-phase figures not available for this player.
          </div>
        )}
      </div>

      {comparison && closest && (
        <section className="space-y-4">
          <SectionHeading>
            Why {player.name} resembles {closest.name} ({Math.round(comparison.matchScore)}% match)
          </SectionHeading>
          <div className="card rounded-2xl p-5">
            <p className="text-sm text-ink-secondary">{comparison.verdict}</p>
            {comparison.differences.length > 0 && (
              <ul className="mt-3 space-y-1.5 text-sm text-ink-secondary">
                {comparison.differences.map((d) => (
                  <li key={d} className="flex gap-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden />
                    {d}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <ComparisonTable referenceName={player.name} candidateName={closest.name} rows={comparison.comparisons} />
        </section>
      )}

      {similar && similar.players.length > 0 && (
        <section className="space-y-4">
          <SectionHeading>Similar players</SectionHeading>
          <div className="grid gap-3">
            {similar.players.map((sp) => (
              <PlayerCard key={sp.id} player={sp} matchScore={sp.matchScore} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
