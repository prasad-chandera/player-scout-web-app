import Link from "next/link";
import { SimilarityBadge } from "@/components/ui/SimilarityBadge";
import type { PlayerSummary } from "@/lib/types";

const ROLE_LABEL: Record<PlayerSummary["role"], string> = {
  batter: "Batter",
  bowler: "Bowler",
  allrounder: "All-rounder",
};

// Accent stripe color per role (all theme tokens).
const ROLE_ACCENT: Record<PlayerSummary["role"], string> = {
  batter: "var(--accent)",
  bowler: "var(--brand)",
  allrounder: "var(--ball)",
};

export interface PlayerCardProps {
  player: PlayerSummary;
  /** 0–1, shown when the card comes from a similarity search */
  similarity?: number;
  /** why this player matched — shown instead of tags when present */
  reason?: string;
}

export function PlayerCard({ player, similarity, reason }: PlayerCardProps) {
  return (
    <Link
      href={`/players/${player.id}`}
      className="card card-hover group relative flex items-center gap-4 overflow-hidden rounded-2xl p-4 pl-5"
    >
      {/* role accent stripe */}
      <span
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ background: ROLE_ACCENT[player.role] }}
        aria-hidden
      />
      <div
        className="flex size-12 shrink-0 items-center justify-center rounded-full font-display text-base font-bold text-foreground ring-2"
        style={{ background: "var(--surface)", color: ROLE_ACCENT[player.role] }}
      >
        {player.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="truncate font-display text-lg font-semibold tracking-wide">{player.name}</span>
          <span className="shrink-0 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
            {ROLE_LABEL[player.role]}
          </span>
        </div>
        {reason ? (
          <p className="mt-0.5 text-[12px] text-ink-secondary">{reason}</p>
        ) : (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {player.tags.slice(0, 3).map((t) => (
              <span key={t} className="rounded-full bg-surface px-2 py-0.5 text-[11px] text-ink-secondary ring-1 ring-[var(--border)]">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="hidden shrink-0 text-right sm:block">
        <p className="text-[11px] uppercase tracking-wide text-ink-muted">Price</p>
        <p className="font-display text-lg font-bold tabular-nums text-accent">₹{player.expectedPriceLakh}L</p>
      </div>
      {similarity !== undefined && <SimilarityBadge value={Math.round(similarity * 100)} label="match" size={56} />}
      <SimilarityBadge value={player.readiness} label="ready" size={58} />
    </Link>
  );
}
