// Typed, centralized React Query cache keys — one source of truth so queries and
// invalidations never drift. Hierarchical arrays allow broad (all of a player's data)
// or narrow (one endpoint) invalidation.

export const queryKeys = {
  search: (query: string) => ["search", query] as const,
  playerDetails: (id: string) => ["players", id, "details"] as const,
  skillRadar: (id: string) => ["players", id, "skill-radar"] as const,
  economyByPhase: (id: string) => ["players", id, "economy-by-phase"] as const,
  similar: (name: string, minMatchScore: number) =>
    ["players", "similar", name, minMatchScore] as const,
  comparison: (id: string, candidateId: string) =>
    ["players", id, "similar", candidateId] as const,
} as const;
