"use client";

import { useCallback, useEffect, useState } from "react";
import { MOCK_PLAYERS } from "@/lib/mock/players";
import { executeIntent, fallbackParse, toSummary } from "@/lib/query";
import type { PlayerSummary, Role, SmartSearchResponse } from "@/lib/types";

// ─── Mock data reads ───
// The app runs entirely on bundled mock data, so these are synchronous reads.

function listPlayers(opts?: { role?: Role; q?: string; minReadiness?: number }): PlayerSummary[] {
  return MOCK_PLAYERS.filter(
    (p) =>
      (!opts?.role || p.role === opts.role) &&
      (!opts?.q || p.name.toLowerCase().includes(opts.q.toLowerCase())) &&
      (!opts?.minReadiness || p.readiness >= opts.minReadiness),
  )
    .sort((a, b) => b.readiness - a.readiness)
    .map(toSummary);
}

/**
 * Smart natural-language search. Mirrors the backend's Gemini→SearchIntent→engine
 * pipeline deterministically: a keyword parser feeds the local ranking engine.
 */
function smartSearch(query: string, limit = 8): SmartSearchResponse {
  return executeIntent(fallbackParse(query), limit);
}

// ─── Hook ───

/**
 * Drives the scout home page: readiness rankings on mount, plus a search that
 * either runs a natural-language query or (on an empty query) re-filters the
 * rankings by role. Encapsulates the loading/error state so the page stays thin.
 */
export function useScout() {
  const [rankings, setRankings] = useState<PlayerSummary[]>([]);
  const [search, setSearch] = useState<SmartSearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setRankings(listPlayers());
  }, []);

  const runSearch = useCallback((query: string, role?: Role) => {
    setError(null);
    setBusy(true);
    if (!query) {
      setSearch(null);
      setRankings(listPlayers({ role }));
      setBusy(false);
      return;
    }
    const res = smartSearch(query);
    setSearch(res);
    if (res.results.length === 0) {
      setError('No players matched that query. Try e.g. "left-arm death bowler under ₹50 lakh".');
    }
    setBusy(false);
  }, []);

  return { rankings, search, error, busy, runSearch };
}
