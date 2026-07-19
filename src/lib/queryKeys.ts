// Typed, centralized React Query cache keys. One source of truth so queries and
// invalidations never drift — e.g. a mutation can invalidate `queryKeys.players()`
// to refetch every player list. Hierarchical arrays let you invalidate broadly
// (all players) or narrowly (one player's similar list).

import type { Role } from "@/lib/types";

export const queryKeys = {
  players: (filters?: { role?: Role; q?: string; minReadiness?: number }) =>
    filters ? (["players", filters] as const) : (["players"] as const),
  player: (id: string) => ["players", id] as const,
  similar: (id: string, opts?: { limit?: number; excludeIpl?: boolean }) =>
    ["players", id, "similar", opts ?? {}] as const,
  explanation: (id: string) => ["players", id, "explanation"] as const,
  search: (query: string, limit?: number) => ["search", query, limit ?? 8] as const,
  features: () => ["features"] as const,
} as const;
