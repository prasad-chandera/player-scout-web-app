// Shared contract with the backend — mirrors docs/03-api-endpoints-and-ai.md exactly.
// If a shape changes there, change it here.

export type Role = "batter" | "bowler" | "allrounder";
export type Competition = "smat" | "ipl";
export type Phase = "powerplay" | "middle" | "death";

export interface PlayerSummary {
  id: string;
  name: string;
  role: Role;
  readiness: number; // 0–100
  expectedPriceLakh: number;
  tags: string[];
}

export interface SkillGroups {
  batting: number;
  bowling: number;
  fielding: number;
  pressure: number;
  consistency: number;
}

export interface PhaseStat {
  phase: Phase;
  /** runs per over (bowlers) */
  economy?: number;
  /** per 100 balls (batters) */
  strikeRate?: number;
  wicketPct?: number;
  dotPct: number;
}

export interface Player extends PlayerSummary {
  battingHand: "right" | "left";
  bowlingStyle?: string;
  age: number;
  competition: Competition;
  matches: number;
  expectedValueLakh: number;
  rawStats: Record<string, number>;
  skillGroups: SkillGroups;
  phaseStats: PhaseStat[];
  /** normalized 0–1 vector, ordering per GET /api/meta/features */
  featureVector: number[];
}

export interface FeatureContribution {
  feature: string;
  label: string;
  /** share of the cosine dot product, 0–1 */
  contribution: number;
  /** raw human-readable stats, not normalized */
  referenceValue: string;
  candidateValue: string;
}

export interface SimilarityResult {
  player: PlayerSummary;
  similarity: number; // 0–1
  topContributions: FeatureContribution[];
}

export interface SimilarSearchResponse {
  reference: { id: string; name: string };
  results: SimilarityResult[];
}

export interface ReadinessBreakdownRow {
  feature: string;
  label: string;
  weight: number;
  normalizedValue: number;
  contribution: number; // 100 × weight × normalizedValue
}

export interface ReadinessResponse {
  playerId: string;
  score: number;
  breakdown: ReadinessBreakdownRow[];
  modelVersion: string;
}

export interface Explanation {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  comparablePlayers: { name: string; note: string }[];
}

export interface UndervaluedEntry {
  rank: number;
  player: PlayerSummary;
  expectedPriceLakh: number;
  expectedValueLakh: number;
  valueGapLakh: number;
  reasons: string[];
}

export interface UndervaluedResponse {
  players: UndervaluedEntry[];
  disclaimer: string;
}

export interface TeamNeed {
  role: string;
  weight: number;
  label: string;
}

export interface TeamProfile {
  id: string;
  name: string;
  short: string;
  colors: { primary: string; secondary: string };
  needs: TeamNeed[];
  budgetLakh: number;
  prefersIndian: boolean;
}

export interface TeamFitRecommendation {
  player: PlayerSummary;
  fitScore: number;
  matchedNeed: string;
  reason: string;
}

export interface TeamFitResponse {
  team: { id: string; name: string };
  recommendations: TeamFitRecommendation[];
}

/** GET /api/meta/features — frozen vector ordering shared with the backend */
export interface FeatureMeta {
  key: string;
  label: string;
  index: number;
  higherIsBetter: boolean;
  unit: string;
}
