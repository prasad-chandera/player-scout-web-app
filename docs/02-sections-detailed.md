# ScoutIQ — Detailed Section-by-Section Design

Each section below covers one stage of the pipeline: what it does, its inputs and outputs, how to build it within hackathon time, and the pitfalls to avoid.

Pipeline recap:

```
Data layer → Feature engineering → Player vectors
    → Similarity engine ┐
    → Readiness score   ├→ Node.js API → Claude explanation → Next.js UI
    → Undervalued index ┘
```

---

## Section 1 — Data Layer

**What it does:** converts raw ball-by-ball match files into per-player aggregate records.

**Input:** Cricsheet JSON files (one file per match) for IPL and Syed Mushtaq Ali Trophy (SMAT). Each file contains `info` (teams, venue, players, outcome) and `innings` → `overs` → `deliveries`, where each delivery records batter, bowler, non-striker, runs (batter/extras/total), and wicket events. See [04-data-sources.md](./04-data-sources.md) for the exact download links and JSON structure.

**Output:** one row per player per competition:

```
player_id, name, competition, matches, innings_batted, balls_faced, runs,
dismissals, balls_bowled, runs_conceded, wickets, catches, run_outs,
+ phase-wise and matchup-wise splits (see Section 2)
```

**How to build it (hackathon-sized):**
1. Download the SMAT and IPL JSON zips from Cricsheet (a few hundred MB total).
2. Write a one-off aggregation script (Node.js or Python — it runs offline, so pick whichever is fastest for you) that walks every match file and accumulates per-delivery tallies into per-player buckets.
3. Use Cricsheet's `people.csv` registry to get stable player IDs — the same player appears in both SMAT and IPL files, and the registry links them.
4. Filter to players with **≥ 10 matches** (or ≥ 120 balls faced / ≥ 120 balls bowled) to avoid tiny-sample noise. Target: **300–500 players**.
5. Emit a single `players.json` (and/or a Postgres seed script) that the backend serves.

**Pitfalls:**
- *Small samples*: a bowler with 4 death overs total will have a meaningless death economy. Enforce per-feature minimum sample sizes (e.g. ≥ 30 balls in a phase) and mark the feature `null` otherwise — never let a 2-over sample rank someone #1.
- *Name collisions*: always join on Cricsheet's registry ID, never on name strings.
- *Era drift*: T20 scoring rates rose over time. For the hackathon, restrict to recent seasons (e.g. 2019 onwards) rather than normalizing by era.

---

## Section 2 — Feature Engineering

**What it does:** replaces "runs, wickets, average" with context-rich features. This is the real intelligence of the project — everything downstream (similarity, readiness, explanations) is only as good as these features.

**Phase definitions** (standard T20): **Powerplay** = overs 1–6, **Middle** = overs 7–15, **Death** = overs 16–20.

### 2.1 Batter features (per player, all from ball-by-ball data)

| Feature | Formula |
|---|---|
| Strike rate vs spin | `100 × runs off spinners / balls faced from spinners` |
| Strike rate vs pace | `100 × runs off pacers / balls faced from pacers` |
| Powerplay SR | `100 × runs in overs 1–6 / balls faced in overs 1–6` |
| Death-overs SR | `100 × runs in overs 16–20 / balls faced in overs 16–20` |
| Boundary % | `(4s + 6s) / balls faced` |
| Dot-ball % | `dot balls faced / balls faced` (lower is better for batters) |
| Singles % | `singles / balls faced` (strike rotation) |
| Pressure performance | SR and dismissal rate when **required run rate > 9** (chasing) **or ≥ 4 wickets down** — computable ball-by-ball since target and fall of wickets are known |
| Average chase contribution | mean runs per innings in successful 2nd-innings chases |
| Home/away split | SR at home venue vs away (venue is in `info.venue`) |

> Bowler-type tagging (spin vs pace): Cricsheet deliveries don't label bowler type. Build a small lookup table of bowler → type. For the hackathon, hand-tag the ~150 distinct bowlers in your filtered dataset (an hour of work with ESPNcricinfo open in a tab) or start from a Kaggle players-metadata CSV.

### 2.2 Bowler features

| Feature | Formula |
|---|---|
| Economy (overall) | `6 × runs conceded / balls bowled` |
| Powerplay economy | same, restricted to overs 1–6 |
| Death economy | same, restricted to overs 16–20 — **the money feature** |
| Dot-ball % | `dot balls / balls bowled` |
| Wicket % per phase | `wickets in phase / balls bowled in phase` |
| vs LHB / vs RHB economy | split by batter handedness (needs a batter-handedness lookup, same approach as bowler-type tagging) |
| Death-overs containment | dot % + (bowled + lbw dismissal rate) in overs 16–20 |

> **Honesty note — "Yorker %":** the pitch/length of a delivery is **not in any public ball-by-ball dataset**. Do not fake it. Use *death-overs containment* (above) as an honest proxy — yorker specialists show up as high dot % + high bowled/lbw rate at the death — and say exactly that in the UI and to judges. Alternatively, hand-label lengths for 2–3 showcase players from match footage and label the field "sample-based". Honesty here is a feature of the demo, not a weakness.

### 2.3 Fielding features

| Feature | Source |
|---|---|
| Catches per match | Cricsheet wicket events list the fielder(s) on `caught` dismissals |
| Run-outs per match | fielder credited on `run out` dismissals |

> Misfields and reaction speed are **not available** in public data — explicitly out of scope. Fielding stays a minor component (see readiness weights).

### 2.4 Normalization → the player vector

1. For each feature, compute min/max (or mean/std) **across the player pool, per role** — batters are normalized against batters, bowlers against bowlers.
2. Scale every feature to 0–1. Invert "lower is better" features (economy, batter dot %) so **1 is always good**.
3. Missing features (insufficient sample) → impute with the pool median and record a `coverage` flag per player; never impute with 0 (it would make small-sample players look terrible rather than unknown).

Every player becomes a fixed-order vector, e.g. a bowler:

```
             [ppEcon, deathEcon, dotPct, wktPct, vsLHB, vsRHB, containment, catches, runouts]
J Bumrah   → [0.71,   0.95,      0.91,   0.84,   0.79,  0.88,  0.93,        0.62,    0.41]
Candidate  → [0.66,   0.93,      0.89,   0.80,   0.74,  0.85,  0.90,        0.70,    0.38]
```

**The feature ordering is a frozen contract** shared by the backend and frontend — it's served by `GET /api/meta/features` (doc 03) so UI labels can never drift out of sync with vector positions.

---

## Section 3 — Similarity Engine ("Find the next Bumrah")

**What it does:** given a reference player, ranks all other players by how similar their skill profile is — with a per-feature breakdown of *why*.

**Method:** cosine similarity between normalized vectors. With ~500 players × ~15 dimensions, a full scan is microseconds — **no vector database, no embeddings model, no ML runtime**. Plain arithmetic in Node (implementation in doc 03 §AI-1).

**The explainability trick — per-feature contribution:** cosine similarity is a sum of elementwise products over the norm product. Each feature's share of that sum is its *contribution* to the similarity. Sort contributions descending → "Similar because: death economy, dot-ball %, containment." This single idea powers the comparison table in the UI and elevates the whole demo from "we ranked players" to "we can show why."

**Rules:**
- Only compare within role (bowler↔bowler, batter↔batter); all-rounders can match both pools.
- Exclude the reference player and (optionally) players already in the IPL when the scout is hunting domestic talent — expose as a query filter.

**Pitfall:** cosine ignores magnitude, so a uniformly mediocre player can be "shaped like" Bumrah at a lower level. Mitigate by reporting similarity **alongside** the readiness score (Section 4), and show both in results.

---

## Section 4 — IPL Readiness Score

**What it does:** a 0–100 score answering "how ready is this domestic player for IPL cricket?"

**Method: transparent weighted scoring** — not an opaque ML model. For a hackathon this is a deliberate choice, not a shortcut:
- Every score decomposes into visible per-feature contributions (perfect for the UI and the judges).
- No training data problem — a proper "domestic → IPL success" model needs labeled historical transitions, which is a project in itself.
- It cannot embarrass you in the demo with a bizarre prediction you can't explain.

**Formula:**

```
readiness = 100 × Σ (weight_i × normalized_feature_i)     with Σ weight_i = 1
```

Suggested starting weights (bowlers): death economy 0.22, dot-ball % 0.15, containment 0.13, powerplay economy 0.12, wicket % 0.12, vs LHB/RHB balance 0.08, pressure-phase performance 0.10, fielding 0.05, experience factor (log of balls bowled, capped) 0.03. Batters analogous, led by pressure SR, death/powerplay SR, boundary %, strike rotation. Document the final weights in the repo — they *are* the model.

**Output shape** (served by `GET /api/players/:id/readiness`):

```json
{ "score": 89, "breakdown": [ { "feature": "deathEconomy", "weight": 0.22, "value": 0.95, "contribution": 20.9 }, ... ] }
```

**Upgrade path (post-hackathon, mention to judges):** replace weights with a logistic regression trained offline on historical SMAT→IPL transitions (label: did the player deliver positive IPL value in 2 seasons?). The API shape stays identical.

---

## Section 5 — Undervalued Index (the "Moneyball page")

**What it does:** surfaces players whose predicted value far exceeds their expected auction price.

**Method:**

```
undervalued_index = readiness_score / expected_price_bracket_rank
```

or more legibly: map readiness → **expected value in ₹** using a simple lookup calibrated from past auctions (e.g. readiness 85–100 ≈ what franchises historically paid for proven death bowlers ≈ ₹4–6 Cr), then:

```
value_gap = expected_value − expected_auction_price
```

**Where prices come from:** historical IPL auction datasets (Kaggle — see doc 04) for known players; for uncapped domestic players, expected price = their official **auction base price** (public, usually ₹20–40 lakh) — which is exactly the point: elite-skill uncapped players sit at base price.

**Output:** Top-10 list with `expectedPrice`, `expectedValue`, and 2–3 reason tags derived from their highest-contribution features ("elite death bowling", "exceptional powerplay economy", "above-average fielding").

**Pitfall:** don't present the ₹ expected value as a market prediction — label it "value if skills were priced like equivalent established players." Judges respect calibrated claims.

---

## Section 6 — Team Fit (stretch)

**What it does:** answers "best player *for RCB*" instead of "best player."

**Method:**
1. Hand-author a needs profile per franchise (10 small JSON objects — 30 minutes of cricket knowledge):

```json
{ "team": "RCB", "needs": [ { "role": "death-bowler", "weight": 0.5 }, { "role": "spin-hitting-middle-order", "weight": 0.3 } ], "budgetCr": 8, "prefersIndian": true }
```

2. Fit score = weighted sum of the player's normalized features relevant to each needed role × need weight, filtered by budget (expected price ≤ budget) and nationality constraint.
3. Return ranked players with the matched need spelled out: "Matches RCB's biggest weakness: death bowling (economy 6.8, dot 49%)."

This reuses everything already built (vectors, readiness, price) — it's a new query, not a new system. Build it only after Sections 1–5 and the core UI are demo-ready.

---

## Section 7 — LLM Explanation Layer (Claude)

**What it does:** turns computed numbers into a scouting report a human would write. **It is the narration, not the intelligence.**

**Grounding rules (non-negotiable):**
1. Claude receives a JSON payload of *computed* stats, percentile ranks, similarity breakdowns, and readiness contributions — and is instructed to use **only** those numbers.
2. The system prompt forbids inventing statistics, and the prompt includes the actual numbers so every claim in the output is checkable on screen.
3. Responses are requested as structured JSON (`summary`, `strengths[]`, `weaknesses[]`, `comparablePlayers[]`) so the UI renders them as cards, not a text blob.
4. Explanations are **cached in the DB per player** (regenerate only when stats change) — one Claude call per player ever, not per page view. Cost ≈ zero, latency ≈ zero in the demo.

Full prompt drafts, model choice, and API shapes are in [03-api-endpoints-and-ai.md](./03-api-endpoints-and-ai.md) §AI-3.

**Pitfall:** never stream a live Claude call during the judged demo without a cached fallback. Cache first, demo from cache.

---

## Section 8 — Frontend (this repo)

Next.js App Router + TypeScript + Tailwind CSS + Recharts. All pages render from typed mock data until the backend is live (`lib/api.ts` has a `USE_MOCK` switch).

### Page 1 — `/` Search & Results
- Hero search bar: free text ("Find the next Bumrah") + role filter chips (Batter / Bowler / All-rounder).
- Results: ranked `PlayerCard` list — name, role, similarity % badge, readiness score, top-3 reason tags.
- Chart: none (keep it fast); similarity % rendered as a radial badge.

### Page 2 — `/players/[id]` Player Detail (the money page)
- Header: name, role, competition, readiness score dial.
- **Radar chart** (Recharts `RadarChart`): skill groups — batting, bowling, fielding, pressure, consistency.
- **Phase-wise bars** (Recharts `BarChart`): powerplay / middle / death economy or SR.
- **Comparison table** (`ComparisonTable`): candidate vs reference player, one row per feature, with the per-feature similarity contribution highlighted — the Bumrah-vs-candidate table from the vision.
- **AI scouting report** (`AISummaryCard`): Claude's summary, strengths, weaknesses as cards.
- **Best-fit teams** strip: top-3 franchise logos with fit reason.

### Page 3 — `/undervalued` Undervalued Talent
- Top-10 table: rank, player, expected auction price, expected value, value gap (highlighted), reason tags.
- Optional chart (Recharts `ScatterChart`): x = expected price, y = readiness — undervalued players are the top-left cluster; visually the single best "Moneyball" slide of the demo.

### Page 4 — `/team-fit` Team Fit (stretch)
- Franchise selector (10 cards with team colors) → needs profile shown → ranked recommended players with matched-need explanations.

### Shared components
`PlayerCard`, `SimilarityBadge`, `RadarChartCard`, `ComparisonTable`, `AISummaryCard`, `SearchBar` — all presentational, typed against `src/lib/types.ts`, which mirrors the response shapes in doc 03 exactly.

**Pitfall:** don't hand-roll charts — Recharts' `RadarChart`/`BarChart`/`ScatterChart` cover all four pages. Spend the saved time on the comparison table, which is the most persuasive artifact in the demo.
