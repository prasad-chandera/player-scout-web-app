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
    <div className="overflow-x-auto rounded-xl border border-hairline bg-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-hairline text-left text-ink-muted">
            <th className="px-4 py-3 font-medium">Feature</th>
            <th className="px-4 py-3 font-medium">{referenceName}</th>
            <th className="px-4 py-3 font-medium">{candidateName}</th>
            <th className="px-4 py-3 text-right font-medium">Share of similarity</th>
          </tr>
        </thead>
        <tbody>
          {contributions.map((c) => (
            <tr key={c.feature} className="border-b border-hairline last:border-0">
              <td className="px-4 py-3 text-ink-secondary">{c.label}</td>
              <td className="px-4 py-3 tabular-nums">{c.referenceValue}</td>
              <td className="px-4 py-3 tabular-nums">{c.candidateValue}</td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <span className="h-2 rounded-full bg-series" style={{ width: `${Math.round(c.contribution * 200)}px`, maxWidth: 96 }} />
                  <span className="w-10 text-right tabular-nums text-ink-secondary">
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
