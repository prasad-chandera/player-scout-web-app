import Link from "next/link";
import ValueScatter from "@/components/ValueScatter";
import { getUndervalued } from "@/lib/api";

function lakh(v: number) {
  return v >= 100 ? `₹${(v / 100).toFixed(1)} Cr` : `₹${v} L`;
}

export default async function UndervaluedPage() {
  const { players, disclaimer } = await getUndervalued(10);

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold">Undervalued talent</h1>
        <p className="max-w-2xl text-sm text-ink-secondary">
          Players whose skill profile is worth far more than their expected auction
          price — the Moneyball list. Reasons come from each player&apos;s
          highest-contribution features, not opinion.
        </p>
      </section>

      <ValueScatter entries={players} />

      <div className="overflow-x-auto rounded-xl border border-hairline bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline text-left text-ink-muted">
              <th className="px-4 py-3 font-medium">#</th>
              <th className="px-4 py-3 font-medium">Player</th>
              <th className="px-4 py-3 text-right font-medium">Readiness</th>
              <th className="px-4 py-3 text-right font-medium">Expected price</th>
              <th className="px-4 py-3 text-right font-medium">Expected value</th>
              <th className="px-4 py-3 text-right font-medium">Value gap</th>
              <th className="px-4 py-3 font-medium">Why</th>
            </tr>
          </thead>
          <tbody>
            {players.map((e) => (
              <tr key={e.player.id} className="border-b border-hairline last:border-0">
                <td className="px-4 py-3 tabular-nums text-ink-muted">{e.rank}</td>
                <td className="px-4 py-3">
                  <Link href={`/players/${e.player.id}`} className="font-medium hover:text-series">
                    {e.player.name}
                  </Link>
                  <span className="ml-2 text-xs text-ink-muted">{e.player.role}</span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{e.player.readiness}</td>
                <td className="px-4 py-3 text-right tabular-nums">{lakh(e.expectedPriceLakh)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{lakh(e.expectedValueLakh)}</td>
                <td className="px-4 py-3 text-right font-semibold tabular-nums text-good">+{lakh(e.valueGapLakh)}</td>
                <td className="px-4 py-3 text-ink-secondary">{e.reasons.slice(0, 2).join(" · ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-ink-muted">{disclaimer}</p>
    </div>
  );
}
