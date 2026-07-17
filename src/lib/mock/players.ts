// Hand-written mock data matching docs/03 response shapes exactly, so every page
// renders before the backend exists. Stats are plausible but FICTIONAL —
// including those attached to real-name reference players.

import type {
  Explanation,
  FeatureMeta,
  Player,
  TeamProfile,
} from "@/lib/types";

// Frozen vector ordering (mirror of GET /api/meta/features, version 1).
// Bowler and batter vectors share one 10-slot layout in the mock for simplicity.
export const FEATURES: FeatureMeta[] = [
  { key: "powerplayImpact", label: "Powerplay impact", index: 0, higherIsBetter: true, unit: "idx" },
  { key: "deathImpact", label: "Death-overs impact", index: 1, higherIsBetter: true, unit: "idx" },
  { key: "dotBallPct", label: "Dot-ball %", index: 2, higherIsBetter: true, unit: "%" },
  { key: "wicketOrBoundaryPct", label: "Wicket / boundary %", index: 3, higherIsBetter: true, unit: "%" },
  { key: "vsLeft", label: "vs left-handers / spin", index: 4, higherIsBetter: true, unit: "idx" },
  { key: "vsRight", label: "vs right-handers / pace", index: 5, higherIsBetter: true, unit: "idx" },
  { key: "containmentOrRotation", label: "Containment / strike rotation", index: 6, higherIsBetter: true, unit: "idx" },
  { key: "pressure", label: "Pressure performance", index: 7, higherIsBetter: true, unit: "idx" },
  { key: "fielding", label: "Fielding", index: 8, higherIsBetter: true, unit: "idx" },
  { key: "consistency", label: "Consistency", index: 9, higherIsBetter: true, unit: "idx" },
];

export const MOCK_PLAYERS: Player[] = [
  {
    id: "bumrah01",
    name: "Jasprit Bumrah",
    role: "bowler",
    battingHand: "right",
    bowlingStyle: "right-arm fast",
    age: 31,
    competition: "ipl",
    matches: 133,
    readiness: 98,
    expectedPriceLakh: 1800,
    expectedValueLakh: 1800,
    tags: ["elite death bowling", "top-decile dot-ball %", "proven at IPL level"],
    rawStats: { ballsBowled: 3060, runsConceded: 3672, wickets: 165, economy: 7.2, powerplayEconomy: 6.9, deathEconomy: 6.8, dotBallPct: 0.49, catches: 24, runOuts: 5 },
    skillGroups: { batting: 0.12, bowling: 0.98, fielding: 0.58, pressure: 0.96, consistency: 0.94 },
    phaseStats: [
      { phase: "powerplay", economy: 6.9, wicketPct: 0.041, dotPct: 0.47 },
      { phase: "middle", economy: 7.6, wicketPct: 0.045, dotPct: 0.38 },
      { phase: "death", economy: 6.8, wicketPct: 0.082, dotPct: 0.49 },
    ],
    featureVector: [0.88, 0.98, 0.94, 0.90, 0.86, 0.91, 0.95, 0.96, 0.55, 0.94],
  },
  {
    id: "sky01",
    name: "Suryakumar Yadav",
    role: "batter",
    battingHand: "right",
    age: 34,
    competition: "ipl",
    matches: 139,
    readiness: 96,
    expectedPriceLakh: 1600,
    expectedValueLakh: 1600,
    tags: ["360° boundary options", "elite vs spin", "middle-overs accelerator"],
    rawStats: { innings: 132, runs: 3982, ballsFaced: 2740, strikeRate: 145.3, boundaryPct: 0.21, dotBallPct: 0.29, catches: 61, runOuts: 4 },
    skillGroups: { batting: 0.97, bowling: 0.05, fielding: 0.78, pressure: 0.9, consistency: 0.88 },
    phaseStats: [
      { phase: "powerplay", strikeRate: 131.0, dotPct: 0.38 },
      { phase: "middle", strikeRate: 148.5, dotPct: 0.27 },
      { phase: "death", strikeRate: 168.2, dotPct: 0.21 },
    ],
    featureVector: [0.74, 0.92, 0.9, 0.93, 0.95, 0.88, 0.9, 0.9, 0.78, 0.88],
  },
  {
    id: "arjun-kumar",
    name: "Arjun Kumar",
    role: "bowler",
    battingHand: "right",
    bowlingStyle: "right-arm fast",
    age: 24,
    competition: "smat",
    matches: 34,
    readiness: 91,
    expectedPriceLakh: 40,
    expectedValueLakh: 420,
    tags: ["elite death bowling", "high dot-ball %", "strong fielding"],
    rawStats: { ballsBowled: 742, runsConceded: 858, wickets: 41, economy: 6.94, powerplayEconomy: 7.4, deathEconomy: 6.8, dotBallPct: 0.47, catches: 11, runOuts: 3 },
    skillGroups: { batting: 0.21, bowling: 0.93, fielding: 0.66, pressure: 0.91, consistency: 0.84 },
    phaseStats: [
      { phase: "powerplay", economy: 7.4, wicketPct: 0.031, dotPct: 0.44 },
      { phase: "middle", economy: 7.1, wicketPct: 0.048, dotPct: 0.41 },
      { phase: "death", economy: 6.8, wicketPct: 0.072, dotPct: 0.47 },
    ],
    featureVector: [0.66, 0.95, 0.89, 0.8, 0.74, 0.85, 0.9, 0.91, 0.7, 0.84],
  },
  {
    id: "rahul-nair",
    name: "Rahul Nair",
    role: "batter",
    battingHand: "left",
    age: 23,
    competition: "smat",
    matches: 29,
    readiness: 88,
    expectedPriceLakh: 30,
    expectedValueLakh: 350,
    tags: ["elite strike rotation vs spin", "chase specialist", "low dot-ball %"],
    rawStats: { innings: 28, runs: 987, ballsFaced: 702, strikeRate: 140.6, boundaryPct: 0.17, dotBallPct: 0.3, singlesPct: 0.41, catches: 14, runOuts: 2 },
    skillGroups: { batting: 0.9, bowling: 0.08, fielding: 0.72, pressure: 0.88, consistency: 0.81 },
    phaseStats: [
      { phase: "powerplay", strikeRate: 124.1, dotPct: 0.41 },
      { phase: "middle", strikeRate: 143.8, dotPct: 0.27 },
      { phase: "death", strikeRate: 158.9, dotPct: 0.22 },
    ],
    featureVector: [0.62, 0.84, 0.88, 0.72, 0.93, 0.78, 0.92, 0.88, 0.72, 0.81],
  },
  {
    id: "imran-shaikh",
    name: "Imran Shaikh",
    role: "bowler",
    battingHand: "right",
    bowlingStyle: "left-arm medium-fast",
    age: 26,
    competition: "smat",
    matches: 41,
    readiness: 84,
    expectedPriceLakh: 40,
    expectedValueLakh: 280,
    tags: ["exceptional powerplay economy", "new-ball wickets", "swing threat"],
    rawStats: { ballsBowled: 912, runsConceded: 1104, wickets: 44, economy: 7.26, powerplayEconomy: 6.1, deathEconomy: 8.9, dotBallPct: 0.45, catches: 7, runOuts: 1 },
    skillGroups: { batting: 0.15, bowling: 0.86, fielding: 0.52, pressure: 0.74, consistency: 0.79 },
    phaseStats: [
      { phase: "powerplay", economy: 6.1, wicketPct: 0.058, dotPct: 0.52 },
      { phase: "middle", economy: 7.8, wicketPct: 0.039, dotPct: 0.4 },
      { phase: "death", economy: 8.9, wicketPct: 0.05, dotPct: 0.33 },
    ],
    featureVector: [0.94, 0.48, 0.85, 0.86, 0.7, 0.82, 0.78, 0.74, 0.5, 0.79],
  },
  {
    id: "dev-patel",
    name: "Dev Patel",
    role: "allrounder",
    battingHand: "right",
    bowlingStyle: "right-arm off-spin",
    age: 25,
    competition: "smat",
    matches: 37,
    readiness: 79,
    expectedPriceLakh: 30,
    expectedValueLakh: 190,
    tags: ["two-way middle-overs value", "spin control", "finisher potential"],
    rawStats: { runs: 612, strikeRate: 132.4, ballsBowled: 486, economy: 7.4, wickets: 21, dotBallPct: 0.38, catches: 16, runOuts: 4 },
    skillGroups: { batting: 0.68, bowling: 0.7, fielding: 0.8, pressure: 0.72, consistency: 0.74 },
    phaseStats: [
      { phase: "powerplay", economy: 7.9, strikeRate: 118.2, dotPct: 0.4 },
      { phase: "middle", economy: 7.1, strikeRate: 129.5, dotPct: 0.39 },
      { phase: "death", economy: 8.2, strikeRate: 151.7, dotPct: 0.3 },
    ],
    featureVector: [0.58, 0.7, 0.72, 0.66, 0.76, 0.64, 0.74, 0.72, 0.8, 0.74],
  },
  {
    id: "kiran-yadav",
    name: "Kiran Yadav",
    role: "batter",
    battingHand: "right",
    age: 27,
    competition: "smat",
    matches: 44,
    readiness: 76,
    expectedPriceLakh: 20,
    expectedValueLakh: 150,
    tags: ["death-overs hitter", "high boundary %", "six-hitting range"],
    rawStats: { innings: 41, runs: 1104, ballsFaced: 738, strikeRate: 149.6, boundaryPct: 0.24, dotBallPct: 0.37, catches: 12, runOuts: 1 },
    skillGroups: { batting: 0.82, bowling: 0.04, fielding: 0.6, pressure: 0.7, consistency: 0.62 },
    phaseStats: [
      { phase: "powerplay", strikeRate: 128.4, dotPct: 0.43 },
      { phase: "middle", strikeRate: 141.2, dotPct: 0.36 },
      { phase: "death", strikeRate: 171.4, dotPct: 0.28 },
    ],
    featureVector: [0.55, 0.9, 0.62, 0.88, 0.6, 0.76, 0.58, 0.7, 0.6, 0.62],
  },
  {
    id: "sandeep-rao",
    name: "Sandeep Rao",
    role: "bowler",
    battingHand: "right",
    bowlingStyle: "right-arm leg-spin",
    age: 22,
    competition: "smat",
    matches: 26,
    readiness: 74,
    expectedPriceLakh: 20,
    expectedValueLakh: 130,
    tags: ["middle-overs wicket-taker", "googly threat", "attacks right-handers"],
    rawStats: { ballsBowled: 564, runsConceded: 702, wickets: 33, economy: 7.47, powerplayEconomy: 8.2, deathEconomy: 8.4, dotBallPct: 0.39, catches: 5, runOuts: 2 },
    skillGroups: { batting: 0.1, bowling: 0.78, fielding: 0.48, pressure: 0.66, consistency: 0.68 },
    phaseStats: [
      { phase: "powerplay", economy: 8.2, wicketPct: 0.028, dotPct: 0.36 },
      { phase: "middle", economy: 6.9, wicketPct: 0.071, dotPct: 0.42 },
      { phase: "death", economy: 8.4, wicketPct: 0.046, dotPct: 0.31 },
    ],
    featureVector: [0.42, 0.5, 0.68, 0.92, 0.58, 0.84, 0.66, 0.66, 0.46, 0.68],
  },
  {
    id: "manish-tiwari",
    name: "Manish Tiwari",
    role: "batter",
    battingHand: "right",
    age: 28,
    competition: "smat",
    matches: 52,
    readiness: 71,
    expectedPriceLakh: 20,
    expectedValueLakh: 110,
    tags: ["powerplay anchor", "strong vs pace", "high consistency"],
    rawStats: { innings: 50, runs: 1490, ballsFaced: 1122, strikeRate: 132.8, boundaryPct: 0.18, dotBallPct: 0.35, catches: 20, runOuts: 3 },
    skillGroups: { batting: 0.76, bowling: 0.05, fielding: 0.64, pressure: 0.6, consistency: 0.84 },
    phaseStats: [
      { phase: "powerplay", strikeRate: 139.5, dotPct: 0.34 },
      { phase: "middle", strikeRate: 128.7, dotPct: 0.36 },
      { phase: "death", strikeRate: 144.1, dotPct: 0.31 },
    ],
    featureVector: [0.86, 0.6, 0.7, 0.66, 0.56, 0.9, 0.72, 0.6, 0.64, 0.84],
  },
  {
    id: "vivek-menon",
    name: "Vivek Menon",
    role: "bowler",
    battingHand: "left",
    bowlingStyle: "left-arm orthodox",
    age: 29,
    competition: "smat",
    matches: 48,
    readiness: 69,
    expectedPriceLakh: 20,
    expectedValueLakh: 95,
    tags: ["middle-overs control", "economical vs left-handers", "experienced"],
    rawStats: { ballsBowled: 1044, runsConceded: 1236, wickets: 39, economy: 7.1, powerplayEconomy: 7.0, deathEconomy: 8.6, dotBallPct: 0.41, catches: 9, runOuts: 2 },
    skillGroups: { batting: 0.18, bowling: 0.72, fielding: 0.5, pressure: 0.58, consistency: 0.8 },
    phaseStats: [
      { phase: "powerplay", economy: 7.0, wicketPct: 0.03, dotPct: 0.43 },
      { phase: "middle", economy: 6.8, wicketPct: 0.042, dotPct: 0.42 },
      { phase: "death", economy: 8.6, wicketPct: 0.038, dotPct: 0.29 },
    ],
    featureVector: [0.68, 0.44, 0.74, 0.62, 0.88, 0.6, 0.76, 0.58, 0.48, 0.8],
  },
  {
    id: "aditya-verma",
    name: "Aditya Verma",
    role: "allrounder",
    battingHand: "left",
    bowlingStyle: "right-arm medium",
    age: 21,
    competition: "smat",
    matches: 18,
    readiness: 66,
    expectedPriceLakh: 20,
    expectedValueLakh: 80,
    tags: ["young two-way prospect", "pressure chaser", "small sample"],
    rawStats: { runs: 384, strikeRate: 136.2, ballsBowled: 288, economy: 8.1, wickets: 12, dotBallPct: 0.34, catches: 8, runOuts: 1 },
    skillGroups: { batting: 0.62, bowling: 0.54, fielding: 0.7, pressure: 0.76, consistency: 0.5 },
    phaseStats: [
      { phase: "powerplay", economy: 8.4, strikeRate: 121.0, dotPct: 0.37 },
      { phase: "middle", economy: 7.9, strikeRate: 133.6, dotPct: 0.34 },
      { phase: "death", economy: 8.3, strikeRate: 155.2, dotPct: 0.29 },
    ],
    featureVector: [0.5, 0.62, 0.58, 0.6, 0.64, 0.62, 0.6, 0.76, 0.7, 0.5],
  },
];

// Raw stat shown per feature slot in comparison tables (human-readable strings).
export function rawFeatureValue(p: Player, featureKey: string): string {
  const s = p.rawStats;
  const pct = (v?: number) => (v === undefined ? "—" : `${Math.round(v * 100)}%`);
  switch (featureKey) {
    case "powerplayImpact":
      return p.role === "batter"
        ? `SR ${p.phaseStats[0].strikeRate ?? "—"}`
        : `econ ${p.phaseStats[0].economy ?? "—"}`;
    case "deathImpact":
      return p.role === "batter"
        ? `SR ${p.phaseStats[2].strikeRate ?? "—"}`
        : `econ ${p.phaseStats[2].economy ?? "—"}`;
    case "dotBallPct":
      return pct(s.dotBallPct);
    case "wicketOrBoundaryPct":
      return s.wickets !== undefined ? `${s.wickets} wkts` : pct(s.boundaryPct);
    case "fielding":
      return `${s.catches ?? 0} ct, ${s.runOuts ?? 0} ro`;
    default: {
      const group = p.skillGroups;
      if (featureKey === "pressure") return (group.pressure * 10).toFixed(1) + "/10";
      if (featureKey === "consistency") return (group.consistency * 10).toFixed(1) + "/10";
      return "idx " + (p.featureVector[FEATURES.findIndex((f) => f.key === featureKey)] ?? 0).toFixed(2);
    }
  }
}

export const MOCK_EXPLANATIONS: Record<string, Explanation> = {
  "arjun-kumar": {
    summary:
      "Arjun Kumar is a death-overs specialist: economy 6.8 in overs 16–20 with a 47% dot-ball rate across 34 SMAT matches, both in the top decile of the domestic pool. His containment profile closely resembles established IPL death bowlers at the same career stage.",
    strengths: [
      "Elite death-overs economy (6.8 across overs 16–20)",
      "High dot-ball pressure (47% overall)",
      "Above-average fielding (11 catches, 3 run-outs in 34 matches)",
    ],
    weaknesses: [
      "Powerplay economy is middling (7.4)",
      "Limited sample against left-handers",
    ],
    comparablePlayers: [
      { name: "Jasprit Bumrah", note: "91% similar — near-identical death-overs containment shape" },
    ],
  },
  "rahul-nair": {
    summary:
      "Rahul Nair rotates strike against spin at an elite rate: 41% singles with only 30% dot balls, and a strike rate of 143.8 in the middle overs where most domestic batters stall. He has anchored 9 successful chases in 28 innings.",
    strengths: [
      "Elite strike rotation vs spin (41% singles, 30% dot balls)",
      "Middle-overs SR 143.8 — accelerates where others consolidate",
      "Chase record: averages 38.4 in successful pursuits",
    ],
    weaknesses: [
      "Powerplay strike rate is ordinary (124.1)",
      "Boundary percentage (17%) below top-tier finishers",
    ],
    comparablePlayers: [
      { name: "Suryakumar Yadav", note: "similar middle-overs acceleration profile vs spin" },
    ],
  },
  "imran-shaikh": {
    summary:
      "Imran Shaikh owns the powerplay: economy 6.1 with a 52% dot-ball rate and a wicket every 17 balls in overs 1–6. His death-overs numbers (economy 8.9) mark him as a new-ball specialist rather than a four-phase bowler.",
    strengths: [
      "Exceptional powerplay economy (6.1) with genuine swing",
      "New-ball wicket threat (5.8% wicket rate in overs 1–6)",
      "52% powerplay dot-ball rate",
    ],
    weaknesses: [
      "Death-overs economy 8.9 — should be hidden late",
      "Modest fielding contribution",
    ],
    comparablePlayers: [],
  },
};

export function genericExplanation(p: Player): Explanation {
  return {
    summary: `${p.name} (${p.role}, ${p.competition.toUpperCase()}, ${p.matches} matches) carries an IPL readiness score of ${p.readiness}, driven primarily by ${p.tags[0] ?? "overall profile"}.`,
    strengths: p.tags.map((t) => t[0].toUpperCase() + t.slice(1)),
    weaknesses: ["Explanation cache not yet generated for this player (mock mode)."],
    comparablePlayers: [],
  };
}

export const MOCK_TEAMS: TeamProfile[] = [
  {
    id: "mi", name: "Mumbai Indians", short: "MI",
    colors: { primary: "#045093", secondary: "#B8860B" },
    needs: [
      { role: "death-bowler", weight: 0.4, label: "Death-overs bowler" },
      { role: "finisher", weight: 0.35, label: "Death-overs finisher" },
      { role: "spin-allrounder", weight: 0.25, label: "Spin-bowling all-rounder" },
    ],
    budgetLakh: 650, prefersIndian: true,
  },
  {
    id: "csk", name: "Chennai Super Kings", short: "CSK",
    colors: { primary: "#F9CD05", secondary: "#2B2A29" },
    needs: [
      { role: "powerplay-bowler", weight: 0.4, label: "New-ball bowler" },
      { role: "middle-order-spin-hitter", weight: 0.35, label: "Middle-order batter vs spin" },
      { role: "fielding", weight: 0.25, label: "Athletic fielders" },
    ],
    budgetLakh: 550, prefersIndian: true,
  },
  {
    id: "rcb", name: "Royal Challengers Bengaluru", short: "RCB",
    colors: { primary: "#DA1818", secondary: "#2B2A29" },
    needs: [
      { role: "death-bowler", weight: 0.5, label: "Death-overs bowler" },
      { role: "middle-order-spin-hitter", weight: 0.3, label: "Middle-order spin hitter" },
      { role: "spin-allrounder", weight: 0.2, label: "Spin-bowling all-rounder" },
    ],
    budgetLakh: 800, prefersIndian: true,
  },
  {
    id: "gt", name: "Gujarat Titans", short: "GT",
    colors: { primary: "#1C2C4B", secondary: "#C9A23F" },
    needs: [
      { role: "finisher", weight: 0.45, label: "Death-overs finisher" },
      { role: "powerplay-bowler", weight: 0.3, label: "New-ball bowler" },
      { role: "wicket-taking-spinner", weight: 0.25, label: "Middle-overs wicket-taker" },
    ],
    budgetLakh: 700, prefersIndian: false,
  },
  {
    id: "kkr", name: "Kolkata Knight Riders", short: "KKR",
    colors: { primary: "#3A225D", secondary: "#F2C12E" },
    needs: [
      { role: "powerplay-batter", weight: 0.4, label: "Powerplay opener" },
      { role: "death-bowler", weight: 0.35, label: "Death-overs bowler" },
      { role: "wicket-taking-spinner", weight: 0.25, label: "Wrist spinner" },
    ],
    budgetLakh: 600, prefersIndian: true,
  },
];

// Which feature slots define each need role (indexes into FEATURES ordering).
export const NEED_FEATURES: Record<string, { indexes: number[]; roles: Array<Player["role"]> }> = {
  "death-bowler": { indexes: [1, 2, 7], roles: ["bowler", "allrounder"] },
  "powerplay-bowler": { indexes: [0, 3], roles: ["bowler", "allrounder"] },
  "wicket-taking-spinner": { indexes: [3, 5], roles: ["bowler"] },
  finisher: { indexes: [1, 7], roles: ["batter", "allrounder"] },
  "powerplay-batter": { indexes: [0, 9], roles: ["batter"] },
  "middle-order-spin-hitter": { indexes: [4, 6], roles: ["batter", "allrounder"] },
  "spin-allrounder": { indexes: [4, 6, 8], roles: ["allrounder"] },
  fielding: { indexes: [8], roles: ["batter", "bowler", "allrounder"] },
};

export const UNDERVALUED_DISCLAIMER =
  "Expected value = what equivalent skills have historically cost at auction; not a market prediction.";

// Search aliases for the mock "find the next X" resolver.
export const SEARCH_ALIASES: Record<string, string> = {
  bumrah: "bumrah01",
  "jasprit bumrah": "bumrah01",
  boom: "bumrah01",
  sky: "sky01",
  suryakumar: "sky01",
  "suryakumar yadav": "sky01",
};
