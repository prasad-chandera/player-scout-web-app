"use client";

import { useCallback, useEffect, useState } from "react";
import { MOCK_PLAYERS, MOCK_TEAMS, NEED_FEATURES } from "@/lib/mock/players";
import { toSummary } from "@/lib/query";
import type { TeamFitResponse, TeamProfile } from "@/lib/types";

// ─── Mock data reads ───
// The app runs entirely on bundled mock data, so these are synchronous reads.

function getTeams(): TeamProfile[] {
  return MOCK_TEAMS;
}

function computeTeamFit(teamId: string, limit = 5): TeamFitResponse | null {
  const team = MOCK_TEAMS.find((t) => t.id === teamId);
  if (!team) return null;
  const scored = MOCK_PLAYERS.filter(
    (p) => p.competition === "smat" && p.expectedPriceLakh <= team.budgetLakh,
  ).map((p) => {
    // Best matched need = highest (need weight × mean of the need's feature slots).
    let best = { fit: 0, need: team.needs[0] };
    for (const need of team.needs) {
      const spec = NEED_FEATURES[need.role];
      if (!spec || !spec.roles.includes(p.role)) continue;
      const mean = spec.indexes.reduce((s, i) => s + p.featureVector[i], 0) / spec.indexes.length;
      const fit = need.weight * mean;
      if (fit > best.fit) best = { fit, need };
    }
    return { player: p, ...best };
  });
  const maxFit = Math.max(...scored.map((s) => s.fit), 0.0001);
  return {
    team: { id: team.id, name: team.name },
    recommendations: scored
      .filter((s) => s.fit > 0)
      .sort((a, b) => b.fit - a.fit)
      .slice(0, limit)
      .map((s) => ({
        player: toSummary(s.player),
        fitScore: Math.round((s.fit / maxFit) * 100),
        matchedNeed: s.need.role,
        reason: `Matches ${team.name}'s need for a ${s.need.label.toLowerCase()} — ${s.player.tags[0]} at ₹${s.player.expectedPriceLakh}L expected price.`,
      })),
  };
}

// ─── Hook ───

/**
 * Drives the team-fit page: loads the franchises, tracks the selected one, and
 * computes its recommendations. Keeps the loading state so the page stays thin.
 */
export function useTeamFit() {
  const [teams, setTeams] = useState<TeamProfile[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [fit, setFit] = useState<TeamFitResponse | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setTeams(getTeams());
  }, []);

  const select = useCallback((teamId: string) => {
    setSelected(teamId);
    setBusy(true);
    setFit(computeTeamFit(teamId, 5));
    setBusy(false);
  }, []);

  const team = teams.find((t) => t.id === selected) ?? null;

  return { teams, selected, team, fit, busy, select };
}
