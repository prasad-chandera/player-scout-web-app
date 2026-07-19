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

  // Descriptive meta, in reading order — each part only shown when the backend has it.
  const meta = [
    player.age ? `${player.age.years} yrs` : null,
    player.battingHand ? `${player.battingHand[0].toUpperCase()}${player.battingHand.slice(1)}-hand bat` : null,
    player.bowlingStyle,
    `${player.matches} ${player.matches === 1 ? "match" : "matches"}`,
    `${player.innings} inns`,
  ]
    .filter(Boolean)
    .join(" · ");

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
        className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full font-display text-base font-bold text-foreground ring-2"
        style={{
          background: `color-mix(in srgb, ${role.accent} 12%, var(--surface))`,
          color: role.accent,
        }}
      >
        {player.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={player.imageUrl}
            alt=""
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          player.name.split(" ").map((w) => w[0]).slice(0, 2).join("")
        )}
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
          
        </div>
        {/* identity + track record — style, hand, age, and how much cricket backs the score */}
        <p className="mt-1 truncate text-[12px] tabular-nums text-ink-muted" title={meta}>
          {meta}
        </p>
        {player.teams.length > 0 && (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {player.teams.slice(0, 3).map((t) => (
              <span
                key={t}
                className="rounded-full bg-surface px-2 py-0.5 text-[11px] text-ink-secondary ring-1 ring-[var(--border)]"
              >
                {t}
              </span>
            ))}
            {player.teams.length > 3 && (
              <span className="text-[11px] text-ink-muted">+{player.teams.length - 3}</span>
            )}
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
