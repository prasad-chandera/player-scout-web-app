# Player Scout — Moneyball for the IPL

AI scouting assistant that finds **undervalued domestic cricketers** and explains
*why* — similarity search, transparent IPL-readiness scoring, and Claude-generated
scouting reports grounded in computed stats.

This repo is the **frontend** (Next.js App Router + TypeScript + Tailwind CSS +
Recharts). The analytics backend is a separate Node.js project whose full API
contract is documented here.

## Documentation

| File | Contents |
|---|---|
| [docs/01-overview.md](docs/01-overview.md) | Vision, scope, architecture, demo script |
| [docs/02-sections-detailed.md](docs/02-sections-detailed.md) | Every pipeline stage in detail: features (with formulas), similarity, readiness score, LLM layer, page specs |
| [docs/03-api-endpoints-and-ai.md](docs/03-api-endpoints-and-ai.md) | **Backend API contract** — all 11 endpoints with example JSON, plus AI requirements (cosine similarity, scoring, Claude prompts) |
| [docs/04-data-sources.md](docs/04-data-sources.md) | Where the data comes from (Cricsheet, Kaggle) and the ingestion pipeline |
| [docs/05-design-system.md](docs/05-design-system.md) | Design tokens, light/dark theming, and how to change the primary color in one line |

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. The app ships with **mock data** so every page works
with no backend:

| Route | Page |
|---|---|
| `/` | Search ("find the next Bumrah") + readiness rankings |
| `/players/[id]` | Player detail: radar chart, phase stats, comparison table, AI scout report |
| `/undervalued` | Top-10 undervalued players + price-vs-readiness scatter |
| `/team-fit` | Best players for a chosen franchise's needs |

## Connecting the real backend

1. Build the Node.js backend against [docs/03-api-endpoints-and-ai.md](docs/03-api-endpoints-and-ai.md).
2. `cp .env.local.example .env.local`, set `NEXT_PUBLIC_API_URL`, and set `NEXT_PUBLIC_USE_MOCK=false`.
3. No component changes needed — `src/lib/api.ts` switches from mock to fetch.

Key source files: [src/lib/types.ts](src/lib/types.ts) (shared API shapes),
[src/lib/api.ts](src/lib/api.ts) (typed client + mock switch),
[src/lib/mock/players.ts](src/lib/mock/players.ts) (fictional demo data).

## Data & attribution

Ball-by-ball data for the real pipeline comes from [Cricsheet](https://cricsheet.org)
(ODC-By license). All bundled mock stats are fictional, including those attached to
real player names.
