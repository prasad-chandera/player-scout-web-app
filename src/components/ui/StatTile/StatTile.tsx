export interface StatTileProps {
  label: string;
  value: string;
  tone?: "default" | "gold" | "green";
}

/** Broadcast stat tile — tiny label over a big condensed number. */
export function StatTile({ label, value, tone = "default" }: StatTileProps) {
  const valueColor =
    tone === "gold" ? "text-accent" : tone === "green" ? "text-series" : "text-foreground";
  return (
    <div className="rounded-xl border border-hairline bg-surface px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-ink-muted">{label}</p>
      <p className={`font-display text-2xl font-bold tabular-nums ${valueColor}`}>{value}</p>
    </div>
  );
}
