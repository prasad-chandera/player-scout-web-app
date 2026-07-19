# Player Scout — Backend API Contract

This document is the **complete contract** between the frontend (this repo) and the
separate Node.js analytics backend. The frontend is typed against the shapes in
`src/lib/types/` — if a shape changes here, change it there too.

## Conventions

- **Base URL:** the frontend reads `NEXT_PUBLIC_API_URL` (the **full API base**, e.g.
  `https://api.pssc.livetronics.ai/api`) and appends the paths below — so a search hits
  `${NEXT_PUBLIC_API_URL}/players/search`. The base includes whatever path prefix the
  deployment uses (here `/api`); the client does not add one.
- **Source headers:** the deployed API also requires source-identification headers on
  every request. Calls without them are rejected with
  `403 FORBIDDEN {"error":"FORBIDDEN","message":"Source headers missing."}`. Wiring these
  into the client (`src/lib/api.ts`) is still to be finalized.
- **Response envelope:** every response is wrapped:

  ```ts
  interface ApiResponse<T> {
    status: 'SUCCESS' | 'FAILED'
    error: string | null       // machine/user message on failure
    message: string | null     // optional human note
    data: T                    // the payload (may be null for the *-nullable endpoints)
  }
  ```

  The frontend's `request()` helper (`src/lib/api.ts`) checks `status`, throws an
  `ApiError(error ?? message)` on `FAILED` or any non-2xx, and otherwise returns `data`.
- **Money** values are in **₹ lakh** (integers), carried as an `estimatedPriceRange`
  band (`minLakh`, `maxLakh`, `label`) — not a single number.
- **Player IDs** are Cricsheet registry ids (8-char hex, stable across competitions),
  falling back to the raw display name for the rare pre-registry match.
- **Scores:** `impactScore` / `readinessScore` are 0–100; skill-radar axes are 0–10;
  `matchScore` / `shareOfSimilarity` are 0–100.

## Endpoint Index

| # | Method | Path | Response (`data`) | Purpose |
|---|---|---|---|---|
| 1 | GET | `/players/search?query=<text>` | `PlayerSearchResult` | Natural-language player search (Discover page) |
| 2 | GET | `/players/{id}` | `PlayerDetails` | Player profile header card |
| 3 | GET | `/players/{id}/skill-radar` | `PlayerSkillRadar \| null` | Skill radar (0–10 per axis) |
| 4 | GET | `/players/{id}/economy-by-phase` | `PlayerEconomyByPhase \| null` | Powerplay/middle/death figures |
| 5 | GET | `/players/similar?query=<text>&minMatchScore=<n>` | `SimilarPlayersResult \| null` | "Players like {name}" ranked by matchScore |
| 6 | GET | `/players/{id}/similar/{candidateId}` | `PlayerComparisonResult \| null` | Why two players are similar |

`null` payloads are a normal, non-error outcome (e.g. a specialist batter has no
bowling figures; a query that names no resolvable player). The frontend degrades to an
empty/greyed state rather than erroring.

---

## 1. `GET /players/search?query=<text>`

The Discover search bar. Free text in, ranked catalogue players out. An LLM parses the
text into `PlayerSearchCriteria` (structured filters + a one-sentence `interpretation`);
deterministic code applies those criteria against the already-scored player list. **The
LLM never sees the catalogue and never ranks** — it only translates language into filters.

**Response `data` (`PlayerSearchResult`):**

```json
{
  "query": "left-arm death bowler under 50 lakh",
  "interpretation": "Left-arm bowlers, best in the death overs, priced up to ₹50 lakh.",
  "criteria": {
    "role": "bowler", "competition": null, "team": null,
    "maxPriceLakh": 50, "minPriceLakh": null, "minImpactScore": null,
    "minMatches": null, "sortBy": "impactScore", "limit": null,
    "interpretation": "…"
  },
  "players": [ /* CricketPlayer[] — see the shared shape below */ ],
  "total": 12
}
```

---

## 2. `GET /players/{id}` → `PlayerDetails`

The scouting profile header. Slimmer than the old contract — skills and phase figures are
their own endpoints (3 and 4).

```json
{
  "id": "a1b2c3d4",
  "name": "Arjun Kumar",
  "role": "bowler",
  "battingHand": "right",
  "bowlingStyle": "right-arm fast",
  "age": { "years": 24, "days": 137 },
  "competition": "smat",
  "matches": 34,
  "teams": ["Tamil Nadu"],
  "currentIPLTeam": null,
  "imageUrl": null,
  "readinessScore": 91,
  "estimatedPriceRange": { "minLakh": 30, "maxLakh": 50, "label": "₹30–50L" },
  "tags": ["Elite death bowling"]
}
```

`battingHand`, `bowlingStyle`, `age`, `imageUrl` are `null` when unmatched (Wikidata/
Wikipedia cross-reference is partial). `tags` may be empty; never fabricated.
**Errors:** `404` (unknown id) → `status: "FAILED"`.

## 3. `GET /players/{id}/skill-radar` → `PlayerSkillRadar | null`

```json
{ "playerId": "a1b2c3d4", "scores": { "batting": 2.1, "bowling": 9.3, "fielding": 6.6, "pressure": 9.1, "consistency": 8.4 } }
```

Each axis is **0–10**. `null` when the player can't be scored.

## 4. `GET /players/{id}/economy-by-phase` → `PlayerEconomyByPhase | null`

```json
{
  "playerId": "a1b2c3d4",
  "phases": [
    { "phase": "powerplay", "economy": 7.4, "strikeRate": null, "wicketPct": 3.1, "dotPct": 44.0 },
    { "phase": "middle",    "economy": 7.1, "strikeRate": null, "wicketPct": 4.8, "dotPct": 41.0 },
    { "phase": "death",     "economy": 6.8, "strikeRate": null, "wicketPct": 7.2, "dotPct": 49.0 }
  ]
}
```

Always exactly 3 entries in `powerplay, middle, death` order. Each figure is `null` when
the player had no legal deliveries bowled/faced in that phase (a specialist batter has
`economy: null`; a specialist bowler has `strikeRate: null`).

---

## 5. `GET /players/similar?query=<text>&minMatchScore=<n>` → `SimilarPlayersResult | null`

"Find players like {name}." The frontend builds the query from the current player's name
(`query=show me similar players like ${name}`) and passes `minMatchScore=75`. An LLM pulls
the player name out of the free text; resolving it to a catalogue player and ranking every
other player by `matchScore` is deterministic.

```json
{
  "query": "show me similar players like Jasprit Bumrah",
  "playerName": "Jasprit Bumrah",
  "seedPlayer": { /* CricketPlayer */ },
  "players": [ { /* CricketPlayer */, "matchScore": 88 } ],
  "total": 6
}
```

`players` are ranked by `matchScore` (0–100) descending and never include the seed. `null`
when the query names no resolvable player.

## 6. `GET /players/{id}/similar/{candidateId}` → `PlayerComparisonResult | null`

The "why are these two similar" detail view opened from the similar list.

```json
{
  "seedPlayer": { /* CricketPlayer */ },
  "candidatePlayer": { /* CricketPlayer */ },
  "matchScore": 88,
  "impactGatePassed": true,
  "verdict": "Both are death-overs specialists with near-identical containment shape.",
  "comparisons": [
    { "feature": "bowling", "label": "Bowling", "seedValue": "9.6/10", "candidateValue": "9.3/10", "shareOfSimilarity": 34 },
    { "feature": "pressure", "label": "Pressure handling", "seedValue": "9.1/10", "candidateValue": "9.0/10", "shareOfSimilarity": 22 }
  ],
  "differences": ["Bumrah has proven IPL pressure exposure; the candidate's is domestic only."],
  "narrativeSource": "ai"
}
```

`comparisons` are skill-radar axes ranked by `shareOfSimilarity` (0–100; rows sum to 100).
`verdict`/`differences` come from an LLM narrating the computed numbers, or a deterministic
template when no model key is configured — `narrativeSource` says which. `differences` is
never empty.

---

## Shared shape — `CricketPlayer`

Returned inside search results (1), the similar list and seed (5), and the comparison (6).

```json
{
  "id": "a1b2c3d4",
  "name": "Arjun Kumar",
  "role": "bowler",
  "battingHand": "right",
  "bowlingStyle": "right-arm fast",
  "age": { "years": 24, "days": 137 },
  "imageUrl": null,
  "competition": "smat",
  "matches": 34,
  "innings": 31,
  "impactScore": 91,
  "estimatedPriceRange": { "minLakh": 30, "maxLakh": 50, "label": "₹30–50L" },
  "tags": [],
  "teams": ["Tamil Nadu"],
  "currentIPLTeam": null
}
```

`role` is one of `batter | bowler | allrounder`. `competition` is `ipl | smat`. `tags` is
currently always `[]` (forward-looking). See `src/lib/types/players.ts` for the full field
documentation.

---

## AI usage (narrow, by design)

Two endpoints use an LLM, and only as a **translator**:

- **Search (1)** — free text → `PlayerSearchCriteria` (structured filters + a plain-English
  restatement). The LLM never sees the player catalogue and never ranks.
- **Similar (5)** — free text → the player name to compare against. Same principle.
- **Comparison verdict (6)** — an LLM narrates the already-computed `comparisons` into a
  `verdict` + `differences`; falls back to a deterministic template with no model key.

Everything else — scoring, ranking, similarity, phase figures — is deterministic backend
computation over Cricsheet-derived data (see `docs/04-data-sources.md`). No client ever
sends stats; the backend assembles every payload itself.
