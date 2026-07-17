// Typed client for every endpoint in docs/03-api-endpoints-and-ai.md.
// USE_MOCK (default true) serves everything from src/lib/mock — flip
// NEXT_PUBLIC_USE_MOCK=false in .env.local once the Node.js backend is live.

import {
  FEATURES,
  MOCK_EXPLANATIONS,
  MOCK_PLAYERS,
  MOCK_TEAMS,
  NEED_FEATURES,
  SEARCH_ALIASES,
  UNDERVALUED_DISCLAIMER,
  genericExplanation,
  rawFeatureValue,
} from "@/lib/mock/players";
import type {
  Explanation,
  Player,
  PlayerSummary,
  ReadinessResponse,
  Role,
  SimilarSearchResponse,
  SimilarityResult,
  TeamFitResponse,
  TeamProfile,
  UndervaluedResponse,
} from "@/lib/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}`);
  return res.json();
}

// ---------- mock helpers (mirror the backend's AI-1 implementation) ----------

function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function toSummary(p: Player): PlayerSummary {
  const { id, name, role, readiness, expectedPriceLakh, tags } = p;
  return { id, name, role, readiness, expectedPriceLakh, tags };
}

function similarTo(reference: Player, limit: number, excludeIpl: boolean): SimilarityResult[] {
  const pool = MOCK_PLAYERS.filter(
    (p) =>
      p.id !== reference.id &&
      (p.role === reference.role || p.role === "allrounder" || reference.role === "allrounder") &&
      (!excludeIpl || p.competition !== "ipl"),
  );
  return pool
    .map((p) => {
      const similarity = cosineSimilarity(reference.featureVector, p.featureVector);
      const dot = reference.featureVector.reduce((s, v, i) => s + v * p.featureVector[i], 0);
      const topContributions = FEATURES.map((f, i) => ({
        feature: f.key,
        label: f.label,
        contribution: (reference.featureVector[i] * p.featureVector[i]) / dot,
        referenceValue: rawFeatureValue(reference, f.key),
        candidateValue: rawFeatureValue(p, f.key),
      }))
        .sort((x, y) => y.contribution - x.contribution)
        .slice(0, 3);
      return { player: toSummary(p), similarity, topContributions };
    })
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

// ------------------------------- public API ---------------------------------

export async function listPlayers(opts?: {
  role?: Role;
  q?: string;
  minReadiness?: number;
}): Promise<PlayerSummary[]> {
  if (USE_MOCK) {
    return MOCK_PLAYERS.filter(
      (p) =>
        (!opts?.role || p.role === opts.role) &&
        (!opts?.q || p.name.toLowerCase().includes(opts.q.toLowerCase())) &&
        (!opts?.minReadiness || p.readiness >= opts.minReadiness),
    )
      .sort((a, b) => b.readiness - a.readiness)
      .map(toSummary);
  }
  const params = new URLSearchParams();
  if (opts?.role) params.set("role", opts.role);
  if (opts?.q) params.set("q", opts.q);
  if (opts?.minReadiness) params.set("minReadiness", String(opts.minReadiness));
  const data = await get<{ players: PlayerSummary[] }>(`/api/players?${params}`);
  return data.players;
}

export async function getPlayer(id: string): Promise<Player | undefined> {
  if (USE_MOCK) return MOCK_PLAYERS.find((p) => p.id === id);
  return get<Player>(`/api/players/${id}`);
}

export async function getSimilar(
  id: string,
  opts?: { limit?: number; excludeIpl?: boolean },
): Promise<SimilarSearchResponse | undefined> {
  if (USE_MOCK) {
    const ref = MOCK_PLAYERS.find((p) => p.id === id);
    if (!ref) return undefined;
    return {
      reference: { id: ref.id, name: ref.name },
      results: similarTo(ref, opts?.limit ?? 5, opts?.excludeIpl ?? false),
    };
  }
  return get<SimilarSearchResponse>(
    `/api/players/${id}/similar?limit=${opts?.limit ?? 5}&excludeIpl=${opts?.excludeIpl ?? false}`,
  );
}

/** "Find the next Bumrah" — resolves free text to a reference player. */
export async function searchSimilar(query: {
  description?: string;
  referencePlayerId?: string;
  limit?: number;
  excludeIpl?: boolean;
}): Promise<SimilarSearchResponse | { error: string }> {
  if (USE_MOCK) {
    let refId = query.referencePlayerId;
    if (!refId && query.description) {
      const text = query.description.toLowerCase();
      for (const [alias, id] of Object.entries(SEARCH_ALIASES)) {
        if (text.includes(alias)) refId = id;
      }
      if (!refId) {
        const byName = MOCK_PLAYERS.find((p) => text.includes(p.name.toLowerCase()));
        refId = byName?.id;
      }
    }
    if (!refId) return { error: "Couldn't identify a reference player in the query. Try e.g. \"find the next Bumrah\"." };
    const result = await getSimilar(refId, { limit: query.limit ?? 10, excludeIpl: query.excludeIpl ?? true });
    return result ?? { error: "Reference player not found." };
  }
  return post<SimilarSearchResponse>("/api/search/similar", query);
}

export async function getReadiness(id: string): Promise<ReadinessResponse | undefined> {
  if (USE_MOCK) {
    const p = MOCK_PLAYERS.find((x) => x.id === id);
    if (!p) return undefined;
    // Equal-weight mock breakdown scaled so contributions sum to the score.
    const weight = 1 / FEATURES.length;
    const rawSum = p.featureVector.reduce((s, v) => s + weight * v, 0);
    const scale = p.readiness / (100 * rawSum);
    return {
      playerId: id,
      score: p.readiness,
      breakdown: FEATURES.map((f, i) => ({
        feature: f.key,
        label: f.label,
        weight,
        normalizedValue: p.featureVector[i],
        contribution: Math.round(100 * weight * p.featureVector[i] * scale * 10) / 10,
      })).sort((a, b) => b.contribution - a.contribution),
      modelVersion: "mock-equal-weights",
    };
  }
  return get<ReadinessResponse>(`/api/players/${id}/readiness`);
}

export async function explainPlayer(id: string): Promise<Explanation | undefined> {
  if (USE_MOCK) {
    const p = MOCK_PLAYERS.find((x) => x.id === id);
    if (!p) return undefined;
    return MOCK_EXPLANATIONS[id] ?? genericExplanation(p);
  }
  const data = await post<{ explanation: Explanation }>("/api/explain/player", { playerId: id });
  return data.explanation;
}

export async function getUndervalued(limit = 10): Promise<UndervaluedResponse> {
  if (USE_MOCK) {
    const players = MOCK_PLAYERS.filter((p) => p.competition === "smat")
      .map((p) => ({
        player: toSummary(p),
        expectedPriceLakh: p.expectedPriceLakh,
        expectedValueLakh: p.expectedValueLakh,
        valueGapLakh: p.expectedValueLakh - p.expectedPriceLakh,
        reasons: p.tags,
      }))
      .sort((a, b) => b.valueGapLakh - a.valueGapLakh)
      .slice(0, limit)
      .map((e, i) => ({ ...e, rank: i + 1 }));
    return { players, disclaimer: UNDERVALUED_DISCLAIMER };
  }
  return get<UndervaluedResponse>(`/api/undervalued?limit=${limit}`);
}

export async function getTeams(): Promise<TeamProfile[]> {
  if (USE_MOCK) return MOCK_TEAMS;
  const data = await get<{ teams: TeamProfile[] }>("/api/teams");
  return data.teams;
}

export async function getTeamFit(teamId: string, limit = 5): Promise<TeamFitResponse | undefined> {
  if (USE_MOCK) {
    const team = MOCK_TEAMS.find((t) => t.id === teamId);
    if (!team) return undefined;
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
  return post<TeamFitResponse>(`/api/teams/${teamId}/fit`, { limit });
}
