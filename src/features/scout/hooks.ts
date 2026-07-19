"use client";

import { useQuery } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { searchPlayers } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import type { PlayerRole, PlayerSearchResult } from "@/lib/types";

/**
 * Drives the Discover page. A single React Query over GET /players/search, enabled only
 * once the user submits a query — there's no "list all players" endpoint, so the page
 * shows an empty prompt until then. React Query owns the caching/loading/error state.
 */
export function useScout() {
  const [query, setQuery] = useState("");

  const searchQuery = useQuery({
    queryKey: queryKeys.search(query),
    queryFn: () => searchPlayers(query),
    enabled: query.length > 0,
  });

  // Fold the optional role chip into the free-text query — the backend LLM parses it.
  const runSearch = useCallback((text: string, role?: PlayerRole) => {
    const q = role ? `${role} ${text}`.trim() : text.trim();
    setQuery(q);
  }, []);

  const result: PlayerSearchResult | undefined = searchQuery.data;

  return {
    result,
    hasSearched: query.length > 0,
    busy: searchQuery.isFetching,
    error: searchQuery.error?.message ?? null,
    runSearch,
  };
}
