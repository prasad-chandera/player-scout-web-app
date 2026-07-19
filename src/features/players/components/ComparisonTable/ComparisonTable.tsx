import type { PlayerComparisonFeatureRow } from "@/lib/types";

export interface ComparisonTableProps {
  referenceName: string;
  candidateName: string;
  rows: PlayerComparisonFeatureRow[];
}

/**
 * The side-by-side "why are these players similar" table — one row per skill axis,
 * with each axis's share of the overall similarity.
 */
export function ComparisonTable({ referenceName, candidateName, rows }: ComparisonTableProps) {
  return (
    <div className="card overflow-x-auto rounded-2xl">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-hairline text-left text-[11px] uppercase tracking-wide text-ink-muted">
            <th className="px-4 py-3 font-semibold">Feature</th>
            <th className="px-4 py-3 font-semibold">{referenceName}</th>
            <th className="px-4 py-3 font-semibold">{candidateName}</th>
            <th className="px-4 py-3 text-right font-semibold">Share of similarity</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.feature} className="border-b border-hairline transition-colors last:border-0 hover:bg-surface">
              <td className="px-4 py-3 text-ink-secondary">{c.label}</td>
              <td className="px-4 py-3 font-display font-semibold tabular-nums">{c.seedValue}</td>
              <td className="px-4 py-3 font-display font-semibold tabular-nums">{c.candidateValue}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <span
                    className="h-2.5 rounded-full"
                    style={{ width: `${Math.min(Math.round(c.shareOfSimilarity), 96)}px`, maxWidth: 96, background: "var(--grad-brand)" }}
                  />
                  <span className="w-10 text-right font-display font-semibold tabular-nums text-ink-secondary">
                    {Math.round(c.shareOfSimilarity)}%
                  </span>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
