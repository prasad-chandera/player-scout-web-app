import Link from "next/link";
import { SimilarityBadge } from "@/components/ui/SimilarityBadge";
import { RoleIcon, ROLE_META } from "@/components/ui/RoleIcon";
import type { CricketPlayer } from "@/lib/types";

export interface PlayerCardProps {
  player: CricketPlayer;
  /** 0–100 similarity, shown when the card comes from a similar-players list */
  matchScore?: number;
  /** why this player matched — shown instead of tags when present */
  reason?: string;
}

export function PlayerCard({ player, matchScore, reason }: PlayerCardProps) {
  const role = ROLE_META[player.role];
  return (
    <Link
      href={`/players/${player.id}`}
      className="card card-hover group relative flex items-center gap-4 overflow-hidden rounded-2xl p-4 pl-5"
    >
      {/* role accent stripe — widens a touch on hover */}
      <span
        className="absolute inset-y-0 left-0 w-1.5 transition-[width] duration-200 group-hover:w-2"
        style={{ background: role.accent }}
        aria-hidden
      />
      <div
        className="flex size-12 shrink-0 items-center justify-center rounded-full font-display text-base font-bold text-foreground ring-2"
        style={{
          background: `color-mix(in srgb, ${role.accent} 12%, var(--surface))`,
          color: role.accent,
        }}
      >
        {player.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-display text-lg font-semibold tracking-tight">{player.name}</span>
          {/* role chip — icon + label, tinted by the role accent */}
          <span
            className="inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide"
            style={{
              color: role.accent,
              background: `color-mix(in srgb, ${role.accent} 12%, transparent)`,
              borderColor: `color-mix(in srgb, ${role.accent} 30%, transparent)`,
            }}
          >
            <RoleIcon role={player.role} size={13} />
            {role.label}
          </span>
          {/* relevance signal — distinct from the impact ring (green pill, not a gauge) */}
          {matchScore !== undefined && (
            <span
              className="ml-auto inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums text-series"
              style={{
                background: "color-mix(in srgb, var(--brand) 12%, transparent)",
                borderColor: "color-mix(in srgb, var(--brand) 30%, transparent)",
              }}
              title={`${Math.round(matchScore)}% similarity match`}
            >
              <span className="size-1.5 rounded-full bg-series" aria-hidden />
              {Math.round(matchScore)}% match
            </span>
          )}
        </div>
        {reason ? (
          <p className="mt-1 text-[12px] text-ink-secondary">{reason}</p>
        ) : (
          <div className="mt-1 flex flex-wrap gap-1.5">
            {player.tags.slice(0, 3).map((t) => (
              <span key={t} className="rounded-full bg-surface px-2 py-0.5 text-[11px] text-ink-secondary ring-1 ring-[var(--border)]">
                {t}
              </span>
            ))}
          </div>
        )}
      </div>
      {/* right-side stat cluster — price band + impact score read as one unit */}
      <div className="flex shrink-0 items-center gap-4 sm:border-l sm:border-hairline sm:pl-4">
        <div className="hidden text-right sm:block">
          <p className="text-[11px] uppercase tracking-wide text-ink-muted">Est. price</p>
          <p className="font-display text-lg font-bold tabular-nums text-accent">{player.estimatedPriceRange.label}</p>
        </div>
        <SimilarityBadge value={player.impactScore} label="impact" size={58} />
      </div>
    </Link>
  );
}
