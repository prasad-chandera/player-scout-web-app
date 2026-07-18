# ScoutIQ — Backend API Contract & AI Requirements

This document is the **complete contract** for the separate Node.js backend project. The frontend (`src/lib/api.ts` + `src/lib/types.ts` in this repo) is typed against these exact shapes — if a shape changes here, change it there too.

Conventions:
- Base URL: `http://localhost:4000` in dev (frontend reads `NEXT_PUBLIC_API_URL`).
- All responses are JSON. Success: `200`. Errors: `{ "error": { "code": string, "message": string } }` with `400` (bad input), `404` (unknown id), `500`.
- All scores are `0–100` integers; all normalized feature values are `0–1` floats; all money values are in **₹ lakh** (integer) to avoid crore/lakh float confusion.
- Player IDs are Cricsheet registry IDs (stable across competitions).

---

## Endpoint Index

| # | Method | Path | Purpose |
|---|---|---|---|
| 1 | GET | `/api/players` | List/search players with filters |
| 2 | GET | `/api/players/:id` | Full player profile |
| 3 | GET | `/api/players/:id/similar` | Top-N similar players |
| 4 | POST | `/api/search/similar` | "Find the next Bumrah" search (direct, by reference id) |
| 4b | POST | `/api/search` | **Smart natural-language search** (Gemini-parsed) |
| 5 | GET | `/api/players/:id/readiness` | Readiness score with breakdown |
| 6 | POST | `/api/explain/player` | Claude scouting report for a player |
| 7 | POST | `/api/explain/comparison` | Claude side-by-side comparison |
| 8 | GET | `/api/undervalued` | Top undervalued players |
| 9 | GET | `/api/teams` | Franchises + needs profiles |
| 10 | POST | `/api/teams/:id/fit` | Best players for a franchise |
| 11 | GET | `/api/meta/features` | Feature dictionary (shared contract) |

---

## 1. `GET /api/players`

List players, paginated and filterable. Powers the results list and any browse view.

**Query params:** `role` (`batter|bowler|allrounder`), `q` (name substring), `minReadiness` (0–100), `maxPriceLakh` (int), `competition` (`smat|ipl`), `page` (default 1), `limit` (default 20, max 100).

**Example:** `GET /api/players?role=bowler&minReadiness=80&limit=3`

```json
{
  "page": 1,
  "total": 27,
  "players": [
    {
      "id": "a1b2c3",
      "name": "Arjun Kumar",
      "role": "bowler",
      "battingHand": "right",
      "bowlingStyle": "right-arm fast",
      "age": 24,
      "competition": "smat",
      "matches": 34,
      "readiness": 91,
      "expectedPriceLakh": 40,
      "tags": ["elite death bowling", "high dot-ball %", "strong fielding"]
    }
  ]
}
```

`tags` = the player's 2–3 highest-contribution features, pre-stringified by the backend so every surface shows consistent reasons.

---

## 2. `GET /api/players/:id`

Full profile for the player detail page.

**Example:** `GET /api/players/a1b2c3`

```json
{
  "id": "a1b2c3",
  "name": "Arjun Kumar",
  "role": "bowler",
  "battingHand": "right",
  "bowlingStyle": "right-arm fast",
  "age": 24,
  "competition": "smat",
  "matches": 34,
  "readiness": 91,
  "expectedPriceLakh": 40,
  "expectedValueLakh": 420,
  "tags": ["elite death bowling", "high dot-ball %", "strong fielding"],
  "rawStats": {
    "ballsBowled": 742, "runsConceded": 858, "wickets": 41,
    "economy": 6.94, "powerplayEconomy": 7.4, "deathEconomy": 6.8,
    "dotBallPct": 0.49, "catches": 11, "runOuts": 3
  },
  "skillGroups": { "batting": 0.21, "bowling": 0.93, "fielding": 0.66, "pressure": 0.91, "consistency": 0.84 },
  "phaseStats": [
    { "phase": "powerplay", "economy": 7.4, "wicketPct": 0.031, "dotPct": 0.44 },
    { "phase": "middle",    "economy": 7.1, "wicketPct": 0.048, "dotPct": 0.41 },
    { "phase": "death",     "economy": 6.8, "wicketPct": 0.072, "dotPct": 0.49 }
  ],
  "featureVector": {
    "ordering": "see /api/meta/features",
    "values": [0.66, 0.95, 0.89, 0.80, 0.74, 0.85, 0.90, 0.70, 0.38]
  },
  "coverage": { "vsLHB": true, "vsRHB": true, "deathOvers": true }
}
```

`skillGroups` feeds the radar chart directly; `phaseStats` feeds the phase bar chart; `coverage` flags features that fell below minimum sample size (frontend renders them greyed, not zero).

**Errors:** `404 PLAYER_NOT_FOUND`.

---

## 3. `GET /api/players/:id/similar?limit=5&excludeIpl=true`

Top-N similar players with per-feature contribution breakdown.

**Query params:** `limit` (default 5, max 20), `excludeIpl` (default `false` — set `true` when scouting domestic talent only).

```json
{
  "reference": { "id": "bumrah01", "name": "Jasprit Bumrah" },
  "results": [
    {
      "player": { "id": "a1b2c3", "name": "Arjun Kumar", "role": "bowler", "readiness": 91, "expectedPriceLakh": 40 },
      "similarity": 0.91,
      "topContributions": [
        { "feature": "deathEconomy", "label": "Death-overs economy", "contribution": 0.24, "referenceValue": 6.8, "candidateValue": 6.9 },
        { "feature": "dotBallPct", "label": "Dot-ball %", "contribution": 0.19, "referenceValue": 0.49, "candidateValue": 0.47 },
        { "feature": "containment", "label": "Death containment", "contribution": 0.16, "referenceValue": 0.93, "candidateValue": 0.90 }
      ]
    }
  ]
}
```

`referenceValue`/`candidateValue` are **raw human-readable stats** (economy in runs-per-over, percentages as fractions), not normalized values — they go straight into the comparison table.

---

## 4. `POST /api/search/similar`

The search bar endpoint. Accepts either a reference player or a free-text description.

**Body (one of):**

```json
{ "referencePlayerId": "bumrah01", "limit": 10, "excludeIpl": true }
```
```json
{ "description": "find the next bumrah", "limit": 10, "excludeIpl": true }
```

**Description resolution:** lowercase the text, match known player names/aliases against a lookup (`"bumrah" → bumrah01`). This endpoint is the **direct, id-based** path used when the caller already knows the reference player. Free-text scout queries go to **endpoint 4b** (`POST /api/search`), which uses Gemini for real language understanding. This endpoint remains the deterministic fallback the parser calls once it has resolved a reference id.

**Response:** identical shape to endpoint 3.

---

## 4b. `POST /api/search` — Smart natural-language search

The primary search-bar endpoint. Takes a raw scout sentence, uses **Gemini to parse it into a structured `SearchIntent`** (see §AI-5), then runs the **deterministic** engine (filter + cosine/feature-sort) to produce ranked results. The LLM never ranks or invents numbers — it only translates language into filters.

**Body:**

```json
{ "query": "a left-arm death bowler under ₹50 lakh strong against right-handers", "limit": 8 }
```

**Response (`SmartSearchResponse`):**

```json
{
  "intent": {
    "referencePlayerName": null,
    "role": "bowler",
    "bowlingStyleContains": "left-arm",
    "battingHand": null,
    "maxPriceLakh": 50,
    "minReadiness": null,
    "sortBy": "deathImpact",
    "strongVs": "RHB",
    "keywords": ["death"]
  },
  "interpretation": "left-arm bowlers · strong vs RHB · best at death-overs impact · ≤ ₹50L",
  "mode": "filter",
  "results": [
    {
      "player": { "id": "imran-shaikh", "name": "Imran Shaikh", "role": "bowler", "readiness": 84, "expectedPriceLakh": 40, "tags": ["..."] },
      "matchReason": "Death-overs impact: econ 8.9 · readiness 84 · ₹40L"
    }
  ]
}
```

- `mode` is `"similar"` when the query names a reference player (e.g. *"find the next Bumrah"*) — then each result also carries a `similarity` (0–1) and `reference` is set, and the shape matches endpoint 3's ranking. Otherwise `mode` is `"filter"`.
- `interpretation` + `intent` power the **"Interpreted as" chips** in the UI — surfacing the AI's reasoning so the recommendation stays auditable.
- **Fallback:** if `GEMINI_API_KEY` is unset or Gemini errors, parse with a keyword parser (roles, "left/right-arm", "under ₹Xl", "death/powerplay", "next <name>") and return the same shape. The frontend ships an identical keyword parser for mock mode (`src/lib/query.ts`), so the feature degrades gracefully and never hard-fails on stage.

**Errors:** none fatal — an unparseable query returns an empty `results` array with a best-effort `intent`.

---

## 5. `GET /api/players/:id/readiness`

Readiness score with full transparency breakdown (powers the score dial + "why this score" panel).

```json
{
  "playerId": "a1b2c3",
  "score": 91,
  "breakdown": [
    { "feature": "deathEconomy", "label": "Death-overs economy", "weight": 0.22, "normalizedValue": 0.95, "contribution": 20.9 },
    { "feature": "dotBallPct", "label": "Dot-ball %", "weight": 0.15, "normalizedValue": 0.89, "contribution": 13.4 }
  ],
  "modelVersion": "weighted-v1"
}
```

`contribution` = `100 × weight × normalizedValue`; contributions sum to `score`.

---

## 6. `POST /api/explain/player`

Generate (or return cached) Claude scouting report. See §AI-3 for the prompt.

**Body:**

```json
{ "playerId": "a1b2c3", "regenerate": false }
```

The backend assembles the stats payload itself from the DB (the frontend never sends stats — prevents prompt tampering and keeps explanations reproducible). `regenerate: true` bypasses the cache.

**Response:**

```json
{
  "playerId": "a1b2c3",
  "cached": true,
  "explanation": {
    "summary": "Arjun Kumar is a death-overs specialist: economy 6.8 in overs 16–20 with a 49% dot-ball rate, both in the top decile of the SMAT pool. His containment profile resembles established IPL death bowlers.",
    "strengths": ["Elite death-overs economy (6.8)", "High dot-ball pressure (49%)", "Above-average fielding (11 catches, 3 run-outs in 34 matches)"],
    "weaknesses": ["Powerplay economy is middling (7.4)", "Limited sample against left-handers"],
    "comparablePlayers": [{ "name": "Jasprit Bumrah", "note": "similar death-overs containment shape at the same career stage" }]
  }
}
```

**Errors:** `404 PLAYER_NOT_FOUND`, `502 LLM_UNAVAILABLE` (frontend falls back to showing raw breakdown).

---

## 7. `POST /api/explain/comparison`

Claude explanation of a two-player comparison (used on the detail page beneath the comparison table).

**Body:** `{ "playerAId": "bumrah01", "playerBId": "a1b2c3" }`

**Response:**

```json
{
  "cached": true,
  "explanation": {
    "verdict": "Arjun Kumar matches Bumrah's death-overs profile within 2% on economy and dot-ball rate, at roughly 1/10th the expected price.",
    "rows": [
      { "label": "Death economy", "a": "6.8", "b": "6.9", "note": "near-identical" },
      { "label": "Dot-ball %", "a": "49%", "b": "47%", "note": "both top-decile" }
    ],
    "differences": ["Bumrah has proven IPL pressure exposure; Kumar's pressure metrics come from domestic contexts only."]
  }
}
```

---

## 8. `GET /api/undervalued?limit=10&role=bowler`

The Moneyball page.

```json
{
  "players": [
    {
      "rank": 1,
      "player": { "id": "a1b2c3", "name": "Arjun Kumar", "role": "bowler", "readiness": 91 },
      "expectedPriceLakh": 40,
      "expectedValueLakh": 420,
      "valueGapLakh": 380,
      "reasons": ["Elite death bowling", "Excellent fitness record", "Strong fielding"]
    }
  ],
  "disclaimer": "Expected value = what equivalent skills have historically cost at auction; not a market prediction."
}
```

Backend sorts by `valueGapLakh` descending. Include the `disclaimer` so the UI can render the calibrated-claim footnote.

---

## 9. `GET /api/teams`

```json
{
  "teams": [
    {
      "id": "rcb",
      "name": "Royal Challengers Bengaluru",
      "colors": { "primary": "#DA1818", "secondary": "#2B2A29" },
      "needs": [
        { "role": "death-bowler", "weight": 0.5, "label": "Death-overs bowler" },
        { "role": "spin-hitting-middle-order", "weight": 0.3, "label": "Middle-order spin hitter" }
      ],
      "budgetLakh": 800,
      "prefersIndian": true
    }
  ]
}
```

---

## 10. `POST /api/teams/:id/fit`

**Body:** `{ "limit": 5, "maxPriceLakh": 800 }` (both optional; `maxPriceLakh` defaults to team budget).

```json
{
  "team": { "id": "rcb", "name": "Royal Challengers Bengaluru" },
  "recommendations": [
    {
      "player": { "id": "a1b2c3", "name": "Arjun Kumar", "role": "bowler", "readiness": 91, "expectedPriceLakh": 40 },
      "fitScore": 88,
      "matchedNeed": "death-bowler",
      "reason": "Matches RCB's biggest weakness: death bowling (economy 6.8, dot-ball 49%) at 5% of the available budget."
    }
  ]
}
```

---

## 11. `GET /api/meta/features`

The frozen feature dictionary — single source of truth for vector ordering and UI labels.

```json
{
  "version": 1,
  "roles": {
    "bowler": [
      { "key": "powerplayEconomy", "label": "Powerplay economy", "index": 0, "higherIsBetter": false, "unit": "runs/over" },
      { "key": "deathEconomy", "label": "Death-overs economy", "index": 1, "higherIsBetter": false, "unit": "runs/over" },
      { "key": "dotBallPct", "label": "Dot-ball %", "index": 2, "higherIsBetter": true, "unit": "%" }
    ],
    "batter": [ { "key": "pressureSR", "label": "Strike rate under pressure", "index": 0, "higherIsBetter": true, "unit": "SR" } ]
  }
}
```

---

# AI Requirements

## AI-1. Similarity engine (plain Node — no ML runtime)

Cosine similarity over normalized vectors. Full implementation:

```js
function cosineSimilarity(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

// Per-feature contribution: each term's share of the dot product.
function contributions(a, b) {
  const dot = a.reduce((s, ai, i) => s + ai * b[i], 0);
  return a.map((ai, i) => ({ index: i, contribution: (ai * b[i]) / dot }));
}
```

Scan all same-role players, sort by similarity, attach top-3 contributions with raw stats. ~500 players × 15 dims = microseconds per query; **no vector DB, no embeddings model.**

## AI-2. Readiness scoring

Weighted sum (weights documented in doc 02 §4), computed **once at data-load time** and stored in Postgres — the API only reads. Store `modelVersion` with each score so weights can evolve without confusing cached explanations.

## AI-3. Claude API integration (explanation layer)

- **SDK:** `@anthropic-ai/sdk` (official Node SDK). Auth via `ANTHROPIC_API_KEY` env var — never in code, never in the frontend.
- **Model:** `claude-sonnet-5` (best quality/cost for grounded structured writing). If you want sub-second regeneration during live demos, `claude-haiku-4-5-20251001` is an acceptable fallback — quality difference is small for this task because all facts are supplied.
- **Params:** `max_tokens: 1024`, `temperature: 0.3` (factual narration, small stylistic variance).
- **Structured output:** define a tool with the response JSON schema and force it with `tool_choice`, so the reply is guaranteed-parseable JSON matching endpoint 6/7 shapes (no regex extraction from prose).

**System prompt (draft — endpoint 6):**

```
You are a professional T20 cricket scout writing a report for an IPL franchise.

Rules:
1. Use ONLY the statistics provided in the user message. Never invent, estimate,
   or recall any statistic from memory.
2. Every numeric claim must quote a number present in the input.
3. If a statistic is marked low-sample or missing, you may mention the skill only
   with an explicit caveat.
4. Mention comparable players only if they appear in the "similarPlayers" input.
5. Be concrete and concise. No hype words ("incredible", "amazing").
6. Weaknesses are mandatory — a report with no weaknesses is not credible.
```

**User message (assembled by the backend):**

```json
{
  "player": { "name": "Arjun Kumar", "role": "bowler", "age": 24, "competition": "SMAT", "matches": 34 },
  "stats": { "deathEconomy": 6.8, "deathEconomyPercentile": 94, "dotBallPct": 0.49, "powerplayEconomy": 7.4, "...": "..." },
  "readiness": { "score": 91, "topContributors": ["deathEconomy", "dotBallPct", "containment"] },
  "similarPlayers": [ { "name": "Jasprit Bumrah", "similarity": 0.91, "sharedStrengths": ["deathEconomy", "dotBallPct"] } ],
  "lowSampleFlags": ["vsLHB"]
}
```

Include **percentile ranks** alongside raw values — they let Claude write "top decile" claims that are actually grounded.

**Caching & cost:**
- Cache the parsed explanation in Postgres keyed on `(playerId, statsHash, modelVersion)`. Regenerate only when stats or weights change.
- ~500 players × ~600 output tokens ≈ one-time cost of well under $2 with Sonnet; $0 during the demo because everything is cached.
- **Demo rule:** pre-warm the cache for every player in the demo path; never depend on a live API call on stage. On `502 LLM_UNAVAILABLE`, the frontend falls back to rendering the readiness breakdown (endpoint 5), so the demo survives even a network failure.

## AI-5. Gemini query parsing (smart search — endpoint 4b)

The **only place a second LLM enters the system.** Gemini's job is narrow and safe: turn a scout's free-text query into a structured `SearchIntent`. It **never sees player stats, never ranks, never invents a number** — the deterministic engine (AI-1 + feature sort) does all the work once the intent exists. This is the same "AI translates, math decides" principle as the explanation layer, applied to the input side.

- **SDK:** `@google/genai` (official Node SDK). Auth via `GEMINI_API_KEY` env var — server-side only, never in the frontend.
- **Model:** `gemini-2.0-flash` (fast, cheap, has a free tier — ideal for a hackathon). Query parsing is a tiny task; no need for a larger model.
- **Params:** `temperature: 0` (deterministic parsing), `responseMimeType: "application/json"` + a `responseSchema` so the reply is **guaranteed-valid JSON** matching the `SearchIntent` shape (no prose to regex out).
- **Grounding via closed vocabulary:** build the schema's enums at request time from real data — valid `role`s, the bowling styles actually present in the dataset, the sortable feature keys from `GET /api/meta/features`, and known reference-player names. Gemini can only emit values that exist, so the intent always executes cleanly.

**System prompt (draft):**

```
You convert a cricket scout's search request into a structured filter.
Rules:
1. Output ONLY the JSON schema fields. Do not add commentary.
2. Choose values only from the allowed lists provided. If unsure, use null.
3. "referencePlayerName" is set ONLY when the user names a specific player
   ("next Bumrah", "like SKY"). Otherwise null.
4. Map skill phrases to sortBy: death/last overs → deathImpact,
   powerplay/new ball → powerplayImpact, economical/contain → containmentOrRotation,
   pressure/chase → pressure, boundary/hitter → wicketOrBoundaryPct, etc.
5. You are parsing intent only. You never rank players or output statistics.
```

**User message:** the raw query string + the allowed-value lists (roles, styles, feature keys, known names).

**Fallback (critical for demos):** if `GEMINI_API_KEY` is missing or Gemini errors/times out, fall back to a keyword parser and return the same `SearchIntent` shape. The frontend already ships an identical parser (`src/lib/query.ts` → `fallbackParse` / `executeIntent`) for mock mode, so behaviour is consistent and the feature never hard-fails on stage.

**Cost:** query parsing is ~100 output tokens per search; negligible. No caching needed (queries are unique), though you may cache identical query strings if desired.

## AI-4. Non-goals (v1)

- Gemini query parsing (AI-5) is a **translator only** — it never ranks players or produces stats. The deterministic keyword parser is its fallback, not a second ranker.
- No embeddings model / vector database — cosine over engineered features is the whole engine, and that's a selling point (explainable dimensions).
- No live model training in the backend; no video analysis.
