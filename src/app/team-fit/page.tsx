"use client";

import Link from "next/link";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ROLE_META } from "@/components/ui/RoleIcon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SimilarityBadge } from "@/components/ui/SimilarityBadge";
import { useTeamFit } from "@/features/team-fit";

export default function TeamFitPage() {
  const { teams, selected, team, fit, busy, select } = useTeamFit();

  return (
    <div className="space-y-8">
      <section className="hero-aura rise-in space-y-3 py-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-ink-secondary">
          <span className="size-1.5 rounded-full bg-series" /> Recruitment, not just ranking
        </span>
        <h1 className="font-display text-4xl font-bold uppercase tracking-tight sm:text-5xl">
          Team <span className="text-gradient">fit</span>
        </h1>
        <p className="max-w-2xl text-sm text-ink-secondary">
          Not &quot;the best player&quot; — the best player <em>for this franchise</em>,
          matched against its needs, budget, and squad rules.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {teams.map((t) => (
          <button
            key={t.id}
            onClick={() => select(t.id)}
            className={`card ${selected === t.id ? "" : "card-hover"} relative overflow-hidden rounded-2xl p-4 text-left ${
              selected === t.id ? "ring-2 ring-[var(--brand)]" : ""
            }`}
          >
            <span className="absolute inset-x-0 top-0 h-1" style={{ background: t.colors.primary }} aria-hidden />
            <span
              className="inline-block size-3 rounded-full ring-2 ring-[var(--surface)]"
              style={{ background: t.colors.primary }}
              aria-hidden
            />
            <p className="mt-2 font-display text-lg font-bold tracking-wide">{t.short}</p>
            <p className="text-xs text-ink-muted">{t.name}</p>
          </button>
        ))}
      </div>

      {team && (
        <section className="card rounded-2xl p-5">
          <h2 className="font-display text-lg font-semibold uppercase tracking-wide">{team.name} — needs profile</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            {team.needs.map((n) => (
              <span key={n.role} className="rounded-full bg-surface px-3 py-1 text-ink-secondary ring-1 ring-[var(--border)]">
                {n.label} <span className="text-ink-muted">({Math.round(n.weight * 100)}%)</span>
              </span>
            ))}
            <span className="ml-auto font-medium text-ink-secondary">
              Budget ₹{(team.budgetLakh / 100).toFixed(1)} Cr{team.prefersIndian ? " · prefers Indian" : ""}
            </span>
          </div>
        </section>
      )}

      {busy && <EmptyState message="Matching players…" />}

      {fit && !busy && (
        <section className="space-y-4">
          <SectionHeading>Recommended for {fit.team.name}</SectionHeading>
          <div className="grid gap-3">
            {fit.recommendations.map((r) => (
              <Link
                key={r.player.id}
                href={`/players/${r.player.id}`}
                className="card card-hover flex items-center gap-4 rounded-2xl p-4"
              >
                <SimilarityBadge value={r.fitScore} label="fit" size={58} />
                <div className="min-w-0 flex-1">
                  <p className="font-display text-lg font-semibold tracking-wide">
                    {r.player.name}
                    <span className="ml-2 text-[11px] font-normal uppercase tracking-wide text-ink-muted">
                      {ROLE_META[r.player.role].label} · ready {r.player.readiness} · ₹{r.player.expectedPriceLakh}L
                    </span>
                  </p>
                  <p className="mt-1 text-sm text-ink-secondary">{r.reason}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!selected && teams.length > 0 && <EmptyState message="Pick a franchise to see recommendations." />}
    </div>
  );
}
