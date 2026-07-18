# Player Scout — Data Sources & Ingestion Pipeline

Everything the project needs is public and free. This doc lists each source, exactly what it feeds, and the step-by-step pipeline from download to `players.json` / Postgres seed.

---

## 1. Cricsheet — primary source (ball-by-ball data)

**URL:** https://cricsheet.org/downloads/

Free, no API key, no signup. One JSON file per match. Licensed **ODC-By** (Open Data Commons Attribution) — attribute Cricsheet in the app footer.

### Datasets to download

| Dataset | Why | Direct zip |
|---|---|---|
| **Indian Premier League** (male, JSON) | Reference players (Bumrah etc.), IPL benchmarks, readiness calibration | https://cricsheet.org/downloads/ipl_json.zip |
| **Syed Mushtaq Ali Trophy** (male, JSON) | **The undiscovered-talent pool** — India's domestic T20 competition; this is where the hidden gems live | https://cricsheet.org/downloads/sma_json.zip |
| **Vijay Hazare Trophy** (optional) | Domestic List-A (50-over) — extra sample size for consistency/pressure features | https://cricsheet.org/downloads/vht_json.zip |

> Verify the exact zip filenames on the downloads page — Cricsheet occasionally renames archives. Total download is a few hundred MB; a full parse runs in under a minute.

### JSON structure (what feeds what)

```jsonc
{
  "info": {
    "dates": ["2023-10-16"],
    "venue": "Wankhede Stadium",        // → home/away splits
    "teams": ["Mumbai", "Baroda"],
    "players": { "Mumbai": ["..."] },
    "registry": { "people": { "JJ Bumrah": "462411" } },  // → stable player IDs
    "outcome": { "winner": "Mumbai" }    // → successful-chase detection
  },
  "innings": [
    {
      "team": "Mumbai",
      "overs": [
        {
          "over": 16,                    // → phase tagging (16–20 = death)
          "deliveries": [
            {
              "batter": "SA Yadav",
              "bowler": "A Kumar",
              "non_striker": "...",
              "runs": { "batter": 0, "extras": 0, "total": 0 },   // → dots, boundaries, SR, economy
              "wickets": [               // present only on dismissal
                { "kind": "caught", "player_out": "SA Yadav",
                  "fielders": [{ "name": "R Nair" }] }            // → catches, run-outs
              ]
            }
          ]
        }
      ],
      "target": { "runs": 187, "overs": 20 }   // 2nd innings only → required run rate → pressure features
    }
  ]
}
```

Field → feature mapping:

| Cricsheet field | Features it feeds |
|---|---|
| `over` index | Powerplay/middle/death splits (economy, SR, dot %) |
| `runs.batter`, `runs.total` | SR, boundary %, singles %, dot-ball %, economy |
| `wickets[].kind` + `bowler` | Wicket %, bowled/lbw rate (death containment proxy) |
| `wickets[].fielders` | Catches, run-outs per match |
| `innings.target` + running score | Required run rate → **pressure performance** |
| `info.venue` + team | Home/away splits |
| `info.outcome` + innings order | Successful-chase contribution |
| `info.registry.people` | Stable player IDs (join key across all files) |

## 2. Cricsheet people registry — player identity

**URL:** https://cricsheet.org/register/people.csv

Canonical ID for every player across competitions — this is how the same bowler's SMAT and IPL records get joined. **Always join on this ID, never on name strings** (spellings differ between files).

## 3. Kaggle — auction prices & player metadata

Needed for the **Undervalued Talent page** (expected price) and for bowler-type/batting-hand lookups. Search Kaggle for:

| Search term | What you get | Feeds |
|---|---|---|
| "IPL auction dataset" / "IPL player auction prices" (e.g. *IPL Player Auction Dataset (2013–2025)*) | Sold price, base price, team, year per player | `expectedPriceLakh`, value-gap calibration |
| "IPL complete dataset ball by ball" (e.g. *IPL Complete Dataset 2008–2024*) | Alternative pre-flattened CSVs if you'd rather skip JSON parsing for IPL | Convenience only — Cricsheet remains the source of truth |
| "cricket players profile dataset" | Batting hand, bowling style, DOB | Bowler-type & handedness lookups (spin/pace, LHB/RHB splits), age |

> Kaggle requires a free account. Dataset titles change — search by the terms above rather than relying on one exact title. Spot-check a few known prices (e.g. recent marquee sales) before trusting any auction CSV.

**Uncapped players' base prices:** official IPL auction lists (published by BCCI each season, widely mirrored in news coverage) put uncapped players at ₹20–40 lakh base price. For demo purposes, `expectedPriceLakh` for an uncapped SMAT player = their base price bracket — which is precisely the "undervalued" story.

## 4. ESPNcricinfo Statsguru — verification only

**URL:** https://stats.espncricinfo.com/ci/engine/stats/index.html

Use for **manual spot-checks** (does my computed SR for player X match Statsguru?) and to fill missing metadata (age, bowling style) by hand for showcase players.

> **Do not scrape it** — automated scraping violates ESPNcricinfo's terms of use, and you don't need to: Cricsheet covers all bulk data. Manual lookups for a handful of players are fine.

## 5. What is deliberately NOT sourced

| Wanted feature | Why it's excluded | Honest proxy used instead |
|---|---|---|
| Yorker % / delivery length | Not present in any public ball-by-ball dataset | Death-overs containment: dot % + bowled/lbw rate in overs 16–20 (doc 02 §2.2) |
| Misfields, reaction speed | Requires video tracking data (Hawk-Eye), not public | Fielding limited to catches + run-outs |
| Bowling speed | Broadcast-only data | Bowling style tag (pace/spin) from metadata |
| Video analysis | Out of hackathon scope entirely | — |

Saying "we don't have this data, here's our honest proxy" out loud is part of the demo — it builds trust in every number that *is* shown.

---

## 6. The ingestion pipeline (hackathon-sized: ~1 day)

```
Step 1  Download zips        ipl_json.zip + sma_json.zip + people.csv     (~15 min)
Step 2  Parse & aggregate    one-off script: every delivery → per-player
                             tallies with phase/matchup buckets           (~3–4 h to write)
Step 3  Metadata join        people.csv IDs + Kaggle metadata
                             (bowling style, hand, age) + auction prices  (~1–2 h)
Step 4  Filter               ≥10 matches AND (≥120 balls faced or bowled);
                             per-feature minimum samples (≥30 balls/phase)(~30 min)
Step 5  Normalize & score    0–1 per feature per role → vectors →
                             readiness scores (weights from doc 02 §4)    (~1–2 h)
Step 6  Emit                 players.json + Postgres seed; pre-warm
                             Claude explanation cache (doc 03 §AI-3)      (~1 h)
```

**Expected output size:** 300–500 players (SMAT pool after filtering) + ~150 IPL reference players. Small enough that the entire dataset lives in backend memory; Postgres is for persistence and the explanation cache.

**Script language:** the ingestion script is offline and throwaway-ish — Node.js keeps the whole stack one language; Python/pandas is fine too if faster for you. Its only contract is the output shape consumed by the backend (doc 03 endpoint 2).

## 7. Mock-data fallback (already in this repo)

The frontend ships with `src/lib/mock/players.ts` — ~10 hand-written players matching the doc 03 response shapes exactly, so **all UI pages render before any real data exists**. Keep mock stats plausible (economies 6–9, SRs 110–160) so charts look right. When the backend is live, flip `NEXT_PUBLIC_USE_MOCK=false` — no component changes needed.

## 8. Licensing & attribution checklist

- [ ] Footer: "Ball-by-ball data © Cricsheet, ODC-By license" with link.
- [ ] Kaggle datasets: check each dataset's license tab; cite in README.
- [ ] No ESPNcricinfo scraping; manual reference only.
- [ ] Player names/photos: names are facts (fine); don't hotlink photos from cricket sites — use initials avatars in the UI.
