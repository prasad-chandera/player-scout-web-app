import { notFound } from "next/navigation";
import { PlayerCard } from "@/components/ui/PlayerCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SimilarityBadge } from "@/components/ui/SimilarityBadge";
import { StatTile } from "@/components/ui/StatTile";
import { AISummaryCard, ComparisonTable, PhaseBarChart, RadarChartCard } from "@/features/players";
import { MOCK_EXPLANATIONS, MOCK_PLAYERS, genericExplanation } from "@/lib/mock/players";
import { similarTo } from "@/lib/query";

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = MOCK_PLAYERS.find((p) => p.id === id);
  if (!player) notFound();

  const similar = similarTo(player, 4, false);
  const explanation = MOCK_EXPLANATIONS[id] ?? genericExplanation(player);
  const closest = similar[0];

  const roleLabel =
    player.role === "allrounder" ? "All-rounder" : player.role[0].toUpperCase() + player.role.slice(1);

  return (
    <div className="space-y-8">
      <section className="hero-aura rise-in card overflow-hidden rounded-2xl p-6">
        <div className="flex flex-wrap items-center gap-5">
          <div
            className="flex size-20 items-center justify-center rounded-2xl font-display text-3xl font-bold ring-2"
            style={{ background: "var(--surface)", color: "var(--brand)" }}
          >
            {player.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl font-bold uppercase tracking-wide sm:text-4xl">{player.name}</h1>
            <p className="mt-1 text-sm text-ink-secondary">
              {roleLabel}
              {player.bowlingStyle ? ` · ${player.bowlingStyle}` : ""} · {player.battingHand}-hand bat · age {player.age} ·{" "}
              {player.competition.toUpperCase()}, {player.matches} matches
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {player.tags.map((t) => (
                <span key={t} className="rounded-full bg-surface px-2.5 py-0.5 text-[11px] text-ink-secondary ring-1 ring-[var(--border)]">
                  {t}
                </span>
              ))}
            </div>
          </div>
          <SimilarityBadge value={player.readiness} label="IPL ready" size={92} />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Expected price" value={`₹${player.expectedPriceLakh}L`} tone="gold" />
          <StatTile label="Expected value" value={`₹${player.expectedValueLakh}L`} tone="green" />
          <StatTile label="Matches" value={String(player.matches)} />
          <StatTile label="Readiness" value={String(player.readiness)} tone="green" />
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <RadarChartCard name={player.name} skillGroups={player.skillGroups} />
        <PhaseBarChart role={player.role} phaseStats={player.phaseStats} />
      </div>

      {explanation && <AISummaryCard explanation={explanation} />}

      {closest && (
        <section className="space-y-4">
          <SectionHeading>
            Why {player.name} resembles {closest.player.name} ({Math.round(closest.similarity * 100)}% similar)
          </SectionHeading>
          <ComparisonTable
            referenceName={player.name}
            candidateName={closest.player.name}
            contributions={closest.topContributions}
          />
        </section>
      )}

      {similar.length > 1 && (
        <section className="space-y-4">
          <SectionHeading>Similar players</SectionHeading>
          <div className="grid gap-3">
            {similar.slice(1).map((r) => (
              <PlayerCard key={r.player.id} player={r.player} similarity={r.similarity} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
