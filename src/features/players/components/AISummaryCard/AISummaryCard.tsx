import type { Explanation } from "@/lib/types";

export interface AISummaryCardProps {
  explanation: Explanation;
}

/** Claude's grounded scouting report, rendered as cards (never a text blob). */
export function AISummaryCard({ explanation }: AISummaryCardProps) {
  return (
    <div className="card overflow-hidden rounded-2xl p-5">
      <div className="flex items-center gap-2">
        <span
          className="rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-on-primary"
          style={{ background: "var(--grad-brand)" }}
        >
          AI Scout Report
        </span>
        <span className="text-[11px] text-ink-muted">generated from computed stats only</span>
      </div>
      <div className="seam mt-3" />
      <p className="mt-3 leading-relaxed text-ink-secondary">{explanation.summary}</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Strengths</h4>
          <ul className="mt-2 space-y-1.5 text-sm">
            {explanation.strengths.map((s) => (
              <li key={s} className="flex gap-2">
                <span aria-hidden className="text-good">▲</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Weaknesses</h4>
          <ul className="mt-2 space-y-1.5 text-sm">
            {explanation.weaknesses.map((w) => (
              <li key={w} className="flex gap-2">
                <span aria-hidden className="text-warn">▼</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {explanation.comparablePlayers.length > 0 && (
        <div className="mt-4 border-t border-hairline pt-3">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Comparable players</h4>
          <ul className="mt-2 space-y-1 text-sm text-ink-secondary">
            {explanation.comparablePlayers.map((c) => (
              <li key={c.name}>
                <span className="font-medium text-foreground">{c.name}</span> — {c.note}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
