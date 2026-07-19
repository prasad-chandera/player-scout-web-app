// Deterministic search core, shared by the mock path in src/lib/api.ts.
//
// IMPORTANT: none of this is AI. In production the *parsing* (text → SearchIntent)
// is done by Gemini in the backend (docs/03 §AI-5); here fallbackParse() is a plain
// keyword parser so the frontend demo works standalone with no backend and no key.
// executeIntent() — the filtering/ranking — is always deterministic, on both sides.

import { FEATURES, MOCK_PLAYERS, SEARCH_ALIASES, rawFeatureValue } from "@/lib/mock/players";
import type {
  Player,
  PlayerSummary,
  SearchIntent,
  SimilarityResult,
  SmartSearchResponse,
  SmartSearchResult,
} from "@/lib/types";

// ---------- similarity helpers (mirror the backend's AI-1 implementation) ----------

export function cosineSimilarity(a: number[], b: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export function toSummary(p: Player): PlayerSummary {
  const { id, name, role, readiness, expectedPriceLakh, tags } = p;
  return { id, name, role, readiness, expectedPriceLakh, tags };
}

export function similarTo(reference: Player, limit: number, excludeIpl: boolean): SimilarityResult[] {
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

// ---------- keyword fallback parser (Gemini stand-in for mock mode) ----------

const FEATURE_KEYS = new Set(FEATURES.map((f) => f.key));
const featureIndex = (key?: string | null) =>
  key ? FEATURES.findIndex((f) => f.key === key) : -1;

/** Which feature key a "strong vs X" phrase sorts on (index 4 = vs left/spin, 5 = vs right/pace). */
function strongVsFeature(v: SearchIntent["strongVs"]): string | null {
  switch (v) {
    case "LHB":
    case "spin":
      return "vsLeft";
    case "RHB":
    case "pace":
      return "vsRight";
    default:
      return null;
  }
}

export function fallbackParse(text: string): SearchIntent {
  const t = text.toLowerCase();
  const intent: SearchIntent = { keywords: [] };

  // reference player — "next bumrah", "like sky", or any known alias
  const refMatch = t.match(/(?:next|another|like|similar to)\s+([a-z .]+)/);
  if (refMatch) intent.referencePlayerName = refMatch[1].trim();
  if (!intent.referencePlayerName) {
    for (const alias of Object.keys(SEARCH_ALIASES)) {
      if (t.includes(alias)) {
        intent.referencePlayerName = alias;
        break;
      }
    }
  }

  // role — check keeper first: keeper phrasings ("wicketkeeper-batsman") contain "bat"
  if (/wicket[\s-]?keeper|keeper|stumper|\bwk\b/.test(t)) intent.role = "wicketkeeper";
  else if (/all[\s-]?rounder/.test(t)) intent.role = "allrounder";
  else if (/bowl(er|ing)?|pacer|spinner|seamer/.test(t)) intent.role = "bowler";
  else if (/bat(ter|sman|ting)?/.test(t)) intent.role = "batter";

  // bowling style substring
  if (/left[\s-]?arm/.test(t)) intent.bowlingStyleContains = "left-arm";
  else if (/right[\s-]?arm/.test(t)) intent.bowlingStyleContains = "right-arm";
  if (/leg[\s-]?spin|wrist[\s-]?spin|leggie/.test(t)) intent.bowlingStyleContains = "leg-spin";
  else if (/off[\s-]?spin|off[\s-]?break/.test(t)) intent.bowlingStyleContains = "off-spin";

  // strong-vs — parse first so "against right-handers" isn't mistaken for the player's bat
  const vs = t.match(/(?:against|vs\.?|versus)\s+(right|left|spin|pace|fast|seam)/);
  if (vs) {
    const w = vs[1];
    intent.strongVs = w.startsWith("right") ? "RHB" : w.startsWith("left") ? "LHB" : w === "spin" ? "spin" : "pace";
  }

  // batting hand — only when clearly about the bat, and after removing the "against X" phrase
  const batText = t.replace(/(?:against|vs\.?|versus)\s+\w+[\w-]*/g, " ");
  if (/left[\s-]?hand(?:ed|er)?\s*(?:bat|batter|batsman)?/.test(batText) && /left[\s-]?hand/.test(batText))
    intent.battingHand = "left";
  else if (/right[\s-]?hand(?:ed|er)?\s*(?:bat|batter|batsman)?/.test(batText) && /right[\s-]?hand/.test(batText))
    intent.battingHand = "right";

  // price cap — "under 50 lakh", "below ₹1 crore", "cheap"
  const price = t.match(/(?:under|below|less than|max|upto|up to)\s*₹?\s*(\d+(?:\.\d+)?)\s*(cr|crore|lakh|l)?/);
  if (price) {
    const n = parseFloat(price[1]);
    intent.maxPriceLakh = /cr|crore/.test(price[2] ?? "") ? Math.round(n * 100) : Math.round(n);
  } else if (/\bcheap|budget|affordable|undervalued\b/.test(t)) {
    intent.maxPriceLakh = 50;
  }

  // sort dimension
  if (/death|final overs|last (?:five|5) overs|16-20/.test(t)) intent.sortBy = "deathImpact";
  else if (/powerplay|new ball|first (?:six|6)/.test(t)) intent.sortBy = "powerplayImpact";
  else if (/dot[\s-]?ball/.test(t)) intent.sortBy = "dotBallPct";
  else if (/boundary|six|hitter|hitting|finisher/.test(t)) intent.sortBy = "wicketOrBoundaryPct";
  else if (/wicket[\s-]?tak|strike bowler/.test(t)) intent.sortBy = "wicketOrBoundaryPct";
  else if (/pressure|clutch|chase|chasing/.test(t)) intent.sortBy = "pressure";
  else if (/field(er|ing)/.test(t)) intent.sortBy = "fielding";
  else if (/economical|economy|contain|control/.test(t)) intent.sortBy = "containmentOrRotation";
  else if (/rotat|strike rotation|singles/.test(t)) intent.sortBy = "containmentOrRotation";
  else if (/consistent|consistency|reliable/.test(t)) intent.sortBy = "consistency";
  if (!intent.sortBy && intent.strongVs) intent.sortBy = strongVsFeature(intent.strongVs);
  if (intent.sortBy && !FEATURE_KEYS.has(intent.sortBy)) intent.sortBy = null;

  return intent;
}

// ---------- describe + execute (deterministic on both sides) ----------

export function describeIntent(intent: SearchIntent): string {
  if (intent.referencePlayerName) {
    const name = intent.referencePlayerName.replace(/\b\w/g, (c) => c.toUpperCase());
    return `Players similar to ${name}`;
  }
  const parts: string[] = [];
  if (intent.bowlingStyleContains) parts.push(`${intent.bowlingStyleContains} bowlers`);
  else if (intent.role)
    parts.push(
      intent.role === "allrounder"
        ? "all-rounders"
        : intent.role === "wicketkeeper"
          ? "wicket-keepers"
          : `${intent.role}s`,
    );
  else parts.push("players");
  if (intent.battingHand) parts.push(`${intent.battingHand}-hand bat`);
  if (intent.strongVs) parts.push(`strong vs ${intent.strongVs}`);
  const sortLabel = FEATURES.find((f) => f.key === intent.sortBy)?.label;
  if (sortLabel) parts.push(`best at ${sortLabel.toLowerCase()}`);
  if (intent.maxPriceLakh != null) parts.push(`≤ ₹${intent.maxPriceLakh}L`);
  if (intent.minReadiness != null) parts.push(`readiness ≥ ${intent.minReadiness}`);
  return parts.join(" · ");
}

function resolveReference(name: string): Player | undefined {
  const key = name.toLowerCase().trim();
  const id = SEARCH_ALIASES[key];
  if (id) return MOCK_PLAYERS.find((p) => p.id === id);
  return MOCK_PLAYERS.find(
    (p) => p.name.toLowerCase() === key || p.name.toLowerCase().includes(key),
  );
}

/** Deterministic filter + rank. This is the same work the backend engine does. */
export function executeIntent(intent: SearchIntent, limit = 8): SmartSearchResponse {
  const interpretation = describeIntent(intent);

  // reference-player → cosine similarity
  if (intent.referencePlayerName) {
    const ref = resolveReference(intent.referencePlayerName);
    if (ref) {
      const results: SmartSearchResult[] = similarTo(ref, limit, true).map((r) => ({
        player: r.player,
        similarity: r.similarity,
        matchReason: `Similar on ${r.topContributions.map((c) => c.label.toLowerCase()).slice(0, 2).join(" & ")}`,
      }));
      return { intent, interpretation, mode: "similar", reference: { id: ref.id, name: ref.name }, results };
    }
  }

  // attribute filter + feature sort (domestic pool)
  const idx = featureIndex(intent.sortBy);
  const filtered = MOCK_PLAYERS.filter((p) => {
    if (p.competition === "ipl") return false;
    if (intent.role && p.role !== intent.role) return false;
    if (intent.bowlingStyleContains && !(p.bowlingStyle ?? "").toLowerCase().includes(intent.bowlingStyleContains)) return false;
    if (intent.battingHand && p.battingHand !== intent.battingHand) return false;
    if (intent.maxPriceLakh != null && p.expectedPriceLakh > intent.maxPriceLakh) return false;
    if (intent.minReadiness != null && p.readiness < intent.minReadiness) return false;
    return true;
  });

  const sortLabel = FEATURES[idx]?.label;
  const results: SmartSearchResult[] = filtered
    .sort((a, b) => (idx >= 0 ? b.featureVector[idx] - a.featureVector[idx] : b.readiness - a.readiness))
    .slice(0, limit)
    .map((p) => {
      const reasonBits: string[] = [];
      if (idx >= 0 && sortLabel) reasonBits.push(`${sortLabel}: ${rawFeatureValue(p, FEATURES[idx].key)}`);
      reasonBits.push(`readiness ${p.readiness}`);
      reasonBits.push(`₹${p.expectedPriceLakh}L`);
      return { player: toSummary(p), matchReason: reasonBits.join(" · ") };
    });

  return { intent, interpretation, mode: "filter", results };
}
