import Link from "next/link";
import SectionHeading from "@/components/SectionHeading";
import ValueScatter from "@/components/ValueScatter";
import { getUndervalued } from "@/lib/api";

function lakh(v: number) {
  return v >= 100 ? `₹${(v / 100).toFixed(1)} Cr` : `₹${v} L`;
}

// Medallion colors for the top 3.
const MEDAL = ["var(--accent)", "#9fb0a5", "#b87333"];

export default async function UndervaluedPage() {
  const { players, disclaimer } = await getUndervalued(10);

  return (
    <div className="space-y-8">
      <section className="hero-aura rise-in space-y-3 py-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-ink-secondary">
          <span className="size-1.5 rounded-full bg-accent" /> The Moneyball list
        </span>
        <h1 className="font-display text-4xl font-bold uppercase tracking-tight sm:text-5xl">
          Undervalued <span className="text-gradient">talent</span>
        </h1>
        <p className="max-w-2xl text-sm text-ink-secondary">
          Players whose skill profile is worth far more than their expected auction price.
          Reasons come from each player&apos;s highest-contribution features, not opinion.
        </p>
      </section>

      <div className="card rounded-2xl p-4">
        <ValueScatter entries={players} />
      </div>

      <div className="card overflow-x-auto rounded-2xl">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-hairline text-left text-[11px] uppercase tracking-wide text-ink-muted">
              <th className="px-4 py-3 font-semibold">#</th>
              <th className="px-4 py-3 font-semibold">Player</th>
              <th className="px-4 py-3 text-right font-semibold">Ready</th>
              <th className="px-4 py-3 text-right font-semibold">Price</th>
              <th className="px-4 py-3 text-right font-semibold">Value</th>
              <th className="px-4 py-3 text-right font-semibold">Value gap</th>
              <th className="hidden px-4 py-3 font-semibold sm:table-cell">Why</th>
            </tr>
          </thead>
          <tbody>
            {players.map((e) => (
              <tr key={e.player.id} className="border-b border-hairline transition-colors last:border-0 hover:bg-surface">
                <td className="px-4 py-3">
                  <span
                    className="flex size-7 items-center justify-center rounded-full font-display text-sm font-bold tabular-nums"
                    style={
                      e.rank <= 3
                        ? { background: MEDAL[e.rank - 1], color: "#1a1200" }
                        : { color: "var(--ink-muted)" }
                    }
                  >
                    {e.rank}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/players/${e.player.id}`} className="font-display font-semibold tracking-wide hover:text-series">
                    {e.player.name}
                  </Link>
                  <span className="ml-2 text-[11px] uppercase tracking-wide text-ink-muted">{e.player.role}</span>
                </td>
                <td className="px-4 py-3 text-right font-display font-semibold tabular-nums">{e.player.readiness}</td>
                <td className="px-4 py-3 text-right tabular-nums text-ink-secondary">{lakh(e.expectedPriceLakh)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-ink-secondary">{lakh(e.expectedValueLakh)}</td>
                <td className="px-4 py-3 text-right font-display text-base font-bold tabular-nums text-accent">
                  +{lakh(e.valueGapLakh)}
                </td>
                <td className="hidden px-4 py-3 text-ink-secondary sm:table-cell">{e.reasons.slice(0, 2).join(" · ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-ink-muted">{disclaimer}</p>
    </div>
  );
}
