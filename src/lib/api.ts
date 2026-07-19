// The single data-access layer for the whole app — the contract in
// docs/03-api-endpoints-and-ai.md, realized. Every page/hook talks to the
// backend ONLY through these typed async functions, so nothing else needs to
// know whether the data is real or mocked.
//
// Two backends, one surface:
//   • NEXT_PUBLIC_USE_MOCK !== "false"  → served from bundled mock data, using
//     the same deterministic engine (src/lib/query.ts) the real backend mirrors.
//   • NEXT_PUBLIC_USE_MOCK === "false"  → real fetch() to NEXT_PUBLIC_API_URL.
//
// Functions are async in BOTH modes so callers (React Query hooks, Server
// Components) are identical regardless of source — flip one env var to switch.

import {
  FEATURES,
  MOCK_EXPLANATIONS,
  MOCK_PLAYERS,
  genericExplanation,
} from "@/lib/mock/players";
import { executeIntent, fallbackParse, similarTo, toSummary } from "@/lib/query";
import type {
  Explanation,
  FeatureMeta,
  Player,
  PlayerSummary,
  Role,
  SimilarSearchResponse,
  SmartSearchResponse,
} from "@/lib/types";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/** Thrown on any non-2xx real-backend response; carries the contract's error shape. */
export class ApiError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// ─── real-backend transport ───

type QueryValue = string | number | boolean | undefined | null;

function withQuery(path: string, params?: Record<string, QueryValue>): string {
  if (!params) return path;
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) qs.set(k, String(v));
  }
  const s = qs.toString();
  return s ? `${path}?${s}` : path;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) {
    // Contract: errors are { error: { code, message } }.
    const body = (await res.json().catch(() => null)) as
      | { error?: { code?: string; message?: string } }
      | null;
    throw new ApiError(
      body?.error?.code ?? "HTTP_ERROR",
      body?.error?.message ?? res.statusText,
      res.status,
    );
  }
  return res.json() as Promise<T>;
}

// ─── endpoints ───

/** GET /api/players — list/search players, sorted by readiness. */
export async function listPlayers(opts?: {
  role?: Role;
  q?: string;
  minReadiness?: number;
}): Promise<PlayerSummary[]> {
  if (!USE_MOCK) {
    const { players } = await request<{ players: PlayerSummary[] }>(
      withQuery("/api/players", { role: opts?.role, q: opts?.q, minReadiness: opts?.minReadiness }),
    );
    return players;
  }
  return MOCK_PLAYERS.filter(
    (p) =>
      (!opts?.role || p.role === opts.role) &&
      (!opts?.q || p.name.toLowerCase().includes(opts.q.toLowerCase())) &&
      (!opts?.minReadiness || p.readiness >= opts.minReadiness),
  )
    .sort((a, b) => b.readiness - a.readiness)
    .map(toSummary);
}

/** GET /api/players/:id — full profile. Rejects with ApiError(404) when unknown. */
export async function getPlayer(id: string): Promise<Player> {
  if (!USE_MOCK) return request<Player>(`/api/players/${id}`);
  const player = MOCK_PLAYERS.find((p) => p.id === id);
  if (!player) throw new ApiError("PLAYER_NOT_FOUND", `No player with id ${id}`, 404);
  return player;
}

/** GET /api/players/:id/similar — top-N similar players with contribution breakdown. */
export async function getSimilar(
  id: string,
  opts?: { limit?: number; excludeIpl?: boolean },
): Promise<SimilarSearchResponse> {
  const limit = opts?.limit ?? 5;
  const excludeIpl = opts?.excludeIpl ?? false;
  if (!USE_MOCK) {
    return request<SimilarSearchResponse>(
      withQuery(`/api/players/${id}/similar`, { limit, excludeIpl }),
    );
  }
  const reference = await getPlayer(id);
  return {
    reference: { id: reference.id, name: reference.name },
    results: similarTo(reference, limit, excludeIpl),
  };
}

/** POST /api/search — smart natural-language search (AI-parsed intent → engine). */
export async function smartSearch(query: string, limit = 8): Promise<SmartSearchResponse> {
  if (!USE_MOCK) {
    return request<SmartSearchResponse>("/api/search", {
      method: "POST",
      body: JSON.stringify({ query, limit }),
    });
  }
  // Mock mirrors the backend's Gemini→SearchIntent→engine pipeline deterministically.
  return executeIntent(fallbackParse(query), limit);
}

/** POST /api/explain/player — Claude scouting report (or cached). */
export async function getExplanation(id: string): Promise<Explanation> {
  if (!USE_MOCK) {
    const { explanation } = await request<{ explanation: Explanation }>("/api/explain/player", {
      method: "POST",
      body: JSON.stringify({ playerId: id }),
    });
    return explanation;
  }
  const player = await getPlayer(id);
  return MOCK_EXPLANATIONS[id] ?? genericExplanation(player);
}

/** GET /api/meta/features — frozen feature dictionary shared with the backend. */
export async function getFeatures(): Promise<FeatureMeta[]> {
  if (!USE_MOCK) return request<FeatureMeta[]>("/api/meta/features");
  return FEATURES;
}
