// The single data-access layer. Every page/hook talks to the backend ONLY through
// these typed async functions — see docs/03-api-endpoints-and-ai.md for the contract.
//
// Base URL is env-driven (NEXT_PUBLIC_API_URL — the full API base, may include an /api
// segment; the client appends /players/... to it). Every response is the
// wrapped ApiResponse envelope { status, error, message, data }; `request` unwraps it,
// throwing ApiError on FAILED / non-2xx and otherwise returning `data` (which may be
// null for the nullable endpoints).

import type {
  ApiEnvelope,
  PlayerComparisonResult,
  PlayerDetails,
  PlayerEconomyByPhase,
  PlayerSearchResult,
  PlayerSkillRadar,
  SimilarPlayersResult,
} from "@/lib/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/** Thrown on any failed response; carries the envelope's error/message. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
  });

  let body: ApiEnvelope<T> | null = null;
  try {
    body = (await res.json()) as ApiEnvelope<T>;
  } catch {
    // fall through — handled by the non-2xx / missing-body checks below
  }

  if (!res.ok || body?.status === "FAILED") {
    const msg = body?.error ?? body?.message ?? res.statusText ?? "Request failed";
    throw new ApiError(msg, res.status);
  }
  if (!body) throw new ApiError("Empty response body", res.status);

  return body.data;
}

/** GET /players/search?query= — natural-language player search (Discover page). */
export function searchPlayers(query: string): Promise<PlayerSearchResult> {
  return request<PlayerSearchResult>(`/players/search?query=${encodeURIComponent(query)}`);
}

/** GET /players/{id} — the scouting profile header card. */
export function getPlayerDetails(id: string): Promise<PlayerDetails> {
  return request<PlayerDetails>(`/players/${encodeURIComponent(id)}`);
}

/** GET /players/{id}/skill-radar — 0–10 per axis, or null when unscorable. */
export function getSkillRadar(id: string): Promise<PlayerSkillRadar | null> {
  return request<PlayerSkillRadar | null>(`/players/${encodeURIComponent(id)}/skill-radar`);
}

/** GET /players/{id}/economy-by-phase — powerplay/middle/death figures, or null. */
export function getEconomyByPhase(id: string): Promise<PlayerEconomyByPhase | null> {
  return request<PlayerEconomyByPhase | null>(
    `/players/${encodeURIComponent(id)}/economy-by-phase`,
  );
}

/** GET /players/similar — players like {name}, ranked by matchScore, or null. */
export function getSimilarPlayers(
  playerName: string,
  minMatchScore = 75,
): Promise<SimilarPlayersResult | null> {
  const query = encodeURIComponent(`show me similar players like ${playerName}`);
  return request<SimilarPlayersResult | null>(
    `/players/similar?query=${query}&minMatchScore=${minMatchScore}`,
  );
}

/** GET /players/{id}/similar/{candidateId} — why two players are similar, or null. */
export function getPlayerComparison(
  id: string,
  candidateId: string,
): Promise<PlayerComparisonResult | null> {
  return request<PlayerComparisonResult | null>(
    `/players/${encodeURIComponent(id)}/similar/${encodeURIComponent(candidateId)}`,
  );
}
