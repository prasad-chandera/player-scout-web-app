import { notFound } from "next/navigation";
import AISummaryCard from "@/components/AISummaryCard";
import ComparisonTable from "@/components/ComparisonTable";
import PhaseBarChart from "@/components/PhaseBarChart";
import PlayerCard from "@/components/PlayerCard";
import RadarChartCard from "@/components/RadarChartCard";
import SimilarityBadge from "@/components/SimilarityBadge";
import { explainPlayer, getPlayer, getSimilar } from "@/lib/api";

export default async function PlayerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const player = await getPlayer(id);
  if (!player) notFound();

  const [similar, explanation] = await Promise.all([
    getSimilar(id, { limit: 4 }),
    explainPlayer(id),
  ]);
  const closest = similar?.results[0];

  return (
    <div className="space-y-6">
      <section className="flex flex-wrap items-center gap-5 rounded-xl border border-hairline bg-surface p-5">
        <div className="flex size-16 items-center justify-center rounded-full bg-background text-xl font-bold text-ink-secondary">
          {player.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold">{player.name}</h1>
          <p className="text-sm text-ink-secondary">
            {player.role === "allrounder" ? "All-rounder" : player.role[0].toUpperCase() + player.role.slice(1)}
            {player.bowlingStyle ? ` · ${player.bowlingStyle}` : ""} · {player.battingHand}-hand bat · age {player.age} ·{" "}
            {player.competition.toUpperCase()}, {player.matches} matches
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {player.tags.map((t) => (
              <span key={t} className="rounded-full border border-hairline px-2 py-0.5 text-[11px] text-ink-secondary">
                {t}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-4">
          <SimilarityBadge value={player.readiness} label="IPL readiness" size={80} />
          <div className="text-right">
            <p className="text-xs text-ink-muted">Expected price</p>
            <p className="text-lg font-semibold tabular-nums">₹{player.expectedPriceLakh}L</p>
            <p className="mt-1 text-xs text-ink-muted">Expected value</p>
            <p className="text-lg font-semibold tabular-nums text-good">₹{player.expectedValueLakh}L</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <RadarChartCard name={player.name} skillGroups={player.skillGroups} />
        <PhaseBarChart role={player.role} phaseStats={player.phaseStats} />
      </div>

      {explanation && <AISummaryCard explanation={explanation} />}

      {closest && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Why {player.name} resembles {closest.player.name} ({Math.round(closest.similarity * 100)}% similar)
          </h2>
          <ComparisonTable
            referenceName={player.name}
            candidateName={closest.player.name}
            contributions={closest.topContributions}
          />
        </section>
      )}

      {similar && similar.results.length > 1 && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">Similar players</h2>
          <div className="space-y-3">
            {similar.results.slice(1).map((r) => (
              <PlayerCard key={r.player.id} player={r.player} similarity={r.similarity} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
