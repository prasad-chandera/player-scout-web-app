"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getEconomyByPhase,
  getPlayerComparison,
  getPlayerDetails,
  getSimilarPlayers,
  getSkillRadar,
} from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

/**
 * Drives the player-detail page from the client, so every backend call is a real
 * browser request (visible in the Network tab) with its own cache/loading/error state.
 *
 * The dependency chain of the old Server Component is preserved via React Query's
 * `enabled`: details / skill-radar / economy-by-phase fire on mount; the similar list
 * waits for the player's name; the comparison waits for the top similar candidate.
 */
export function usePlayerProfile(id: string) {
  const details = useQuery({
    queryKey: queryKeys.playerDetails(id),
    queryFn: () => getPlayerDetails(id),
  });

  const radar = useQuery({
    queryKey: queryKeys.skillRadar(id),
    queryFn: () => getSkillRadar(id),
  });

  const phase = useQuery({
    queryKey: queryKeys.economyByPhase(id),
    queryFn: () => getEconomyByPhase(id),
  });

  const name = details.data?.name;
  const similar = useQuery({
    queryKey: queryKeys.similar(name ?? "", 75),
    queryFn: () => getSimilarPlayers(name as string, 75),
    enabled: !!name,
  });

  const closest = similar.data?.players[0] ?? null;
  const comparison = useQuery({
    queryKey: queryKeys.comparison(id, closest?.id ?? ""),
    queryFn: () => getPlayerComparison(id, closest?.id as string),
    enabled: !!closest,
  });

  return { details, radar, phase, similar, closest, comparison };
}
