import Link from "next/link";
import type { PlayerSummary } from "@/lib/types";
import SimilarityBadge from "@/components/SimilarityBadge";

const ROLE_LABEL: Record<PlayerSummary["role"], string> = {
  batter: "Batter",
  bowler: "Bowler",
  allrounder: "All-rounder",
};

export default function PlayerCard({
  player,
  similarity,
}: {
  player: PlayerSummary;
  /** 0–1, shown when the card comes from a similarity search */
  similarity?: number;
}) {
  return (
    <Link
      href={`/players/${player.id}`}
      className="flex items-center gap-4 rounded-xl border border-hairline bg-surface p-4 transition-colors hover:border-series"
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-background text-sm font-semibold text-ink-secondary">
        {player.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate font-semibold">{player.name}</span>
          <span className="shrink-0 text-xs text-ink-muted">{ROLE_LABEL[player.role]}</span>
        </div>
        <div className="mt-1 flex flex-wrap gap-1.5">
          {player.tags.slice(0, 3).map((t) => (
            <span key={t} className="rounded-full border border-hairline px-2 py-0.5 text-[11px] text-ink-secondary">
              {t}
            </span>
          ))}
        </div>
      </div>
      {similarity !== undefined && <SimilarityBadge value={Math.round(similarity * 100)} label="similar" size={56} />}
      <SimilarityBadge value={player.readiness} label="readiness" size={56} />
    </Link>
  );
}
