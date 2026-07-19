"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { listPlayers, smartSearch } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { Role } from "@/lib/types";

/**
 * Drives the scout home page. Two React Query reads through @/lib/api:
 *   • readiness rankings (optionally re-filtered by role), and
 *   • a natural-language search that runs only once a query is submitted.
 * React Query owns the caching/loading/error state, so the page stays thin and
 * the same hook works against mock or the real backend unchanged.
 */
export function useScout() {
  const [role, setRole] = useState<Role | undefined>(undefined);
  const [query, setQuery] = useState("");

  const rankingsQuery = useQuery({
    queryKey: queryKeys.players({ role }),
    queryFn: () => listPlayers({ role }),
  });

  const searchQuery = useQuery({
    queryKey: queryKeys.search(query),
    queryFn: () => smartSearch(query),
    enabled: query.length > 0,
    placeholderData: keepPreviousData,
  });

  // Empty query → clear the search and (re)filter rankings by role.
  const runSearch = useCallback((q: string, r?: Role) => {
    setRole(r);
    setQuery(q);
  }, []);

  const searching = query.length > 0;
  const search = searching ? (searchQuery.data ?? null) : null;
  const busy = searching ? searchQuery.isFetching : rankingsQuery.isFetching;
  const error =
    searchQuery.error?.message ??
    rankingsQuery.error?.message ??
    (search && search.results.length === 0
      ? 'No players matched that query. Try e.g. "left-arm death bowler under ₹50 lakh".'
      : null);

  return { rankings: rankingsQuery.data ?? [], search, error, busy, runSearch };
}
