import type { FeatureContribution } from "@/lib/types";

/**
 * The side-by-side "why are these players similar" table — one row per feature,
 * with each feature's share of the similarity score.
 */
export default function ComparisonTable({
  referenceName,
  candidateName,
  contributions,
}: {
  referenceName: string;
  candidateName: string;
  contributions: FeatureContribution[];
}) {
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
          {contributions.map((c) => (
            <tr key={c.feature} className="border-b border-hairline transition-colors last:border-0 hover:bg-surface">
              <td className="px-4 py-3 text-ink-secondary">{c.label}</td>
              <td className="px-4 py-3 font-display font-semibold tabular-nums">{c.referenceValue}</td>
              <td className="px-4 py-3 font-display font-semibold tabular-nums">{c.candidateValue}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <span
                    className="h-2.5 rounded-full"
                    style={{ width: `${Math.round(c.contribution * 200)}px`, maxWidth: 96, background: "var(--grad-brand)" }}
                  />
                  <span className="w-10 text-right font-display font-semibold tabular-nums text-ink-secondary">
                    {Math.round(c.contribution * 100)}%
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
