"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SimilarityBadge from "@/components/SimilarityBadge";
import { getTeamFit, getTeams } from "@/lib/api";
import type { TeamFitResponse, TeamProfile } from "@/lib/types";

export default function TeamFitPage() {
  const [teams, setTeams] = useState<TeamProfile[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [fit, setFit] = useState<TeamFitResponse | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getTeams().then(setTeams).catch(() => {});
  }, []);

  async function select(teamId: string) {
    setSelected(teamId);
    setBusy(true);
    try {
      setFit((await getTeamFit(teamId, 5)) ?? null);
    } finally {
      setBusy(false);
    }
  }

  const team = teams.find((t) => t.id === selected);

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-bold">Team fit</h1>
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
            className={`rounded-xl border p-4 text-left transition-colors ${
              selected === t.id ? "border-series bg-series/10" : "border-hairline bg-surface hover:border-series"
            }`}
          >
            <span
              className="inline-block size-3 rounded-full"
              style={{ background: t.colors.primary }}
              aria-hidden
            />
            <p className="mt-2 font-bold">{t.short}</p>
            <p className="text-xs text-ink-muted">{t.name}</p>
          </button>
        ))}
      </div>

      {team && (
        <section className="rounded-xl border border-hairline bg-surface p-5">
          <h2 className="font-semibold">{team.name} — needs profile</h2>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
            {team.needs.map((n) => (
              <span key={n.role} className="rounded-full border border-hairline px-3 py-1 text-ink-secondary">
                {n.label} <span className="text-ink-muted">({Math.round(n.weight * 100)}%)</span>
              </span>
            ))}
            <span className="ml-auto text-ink-muted">
              Budget ₹{(team.budgetLakh / 100).toFixed(1)} Cr{team.prefersIndian ? " · prefers Indian" : ""}
            </span>
          </div>
        </section>
      )}

      {busy && <p className="text-sm text-ink-muted">Matching players…</p>}

      {fit && !busy && (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink-muted">
            Recommended for {fit.team.name}
          </h2>
          {fit.recommendations.map((r) => (
            <Link
              key={r.player.id}
              href={`/players/${r.player.id}`}
              className="flex items-center gap-4 rounded-xl border border-hairline bg-surface p-4 transition-colors hover:border-series"
            >
              <SimilarityBadge value={r.fitScore} label="fit" size={56} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">
                  {r.player.name}
                  <span className="ml-2 text-xs font-normal text-ink-muted">
                    {r.player.role} · readiness {r.player.readiness} · ₹{r.player.expectedPriceLakh}L
                  </span>
                </p>
                <p className="mt-1 text-sm text-ink-secondary">{r.reason}</p>
              </div>
            </Link>
          ))}
        </section>
      )}

      {!selected && teams.length > 0 && (
        <p className="text-sm text-ink-muted">Pick a franchise to see recommendations.</p>
      )}
    </div>
  );
}
