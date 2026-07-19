# Player Scout

AI scouting assistant for Indian domestic cricket: **search** for players in plain
English, open a **player profile** (skill radar + phase-by-phase figures), and see
**who they're similar to** — with a per-axis breakdown of *why*.

This repo is the **frontend** (Next.js App Router + TypeScript + Tailwind CSS +
Recharts). The analytics backend is a separate Node.js project whose API contract is
documented here; the frontend talks to it through `src/lib/api.ts`.

## Documentation

| File | Contents |
|---|---|
| [docs/01-overview.md](docs/01-overview.md) | Vision, scope, architecture |
| [docs/02-sections-detailed.md](docs/02-sections-detailed.md) | Pipeline stages: data, features, similarity, skill-radar & phase figures, page specs |
| [docs/03-api-endpoints-and-ai.md](docs/03-api-endpoints-and-ai.md) | **Backend API contract** — the 6 endpoints, the response envelope, and how the LLM is used |
| [docs/04-data-sources.md](docs/04-data-sources.md) | Where the data comes from (Cricsheet) and the ingestion pipeline |
| [docs/05-design-system.md](docs/05-design-system.md) | Design tokens, light/dark theming, changing the primary color in one line |

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000. The frontend calls the backend directly (no bundled mock
data), so it needs a running backend to show players — see below.

| Route | Page |
|---|---|
| `/` | Discover — natural-language player search |
| `/players/[id]` | Player detail: skill radar, economy-by-phase, similar players, why-similar comparison |

## Connecting the backend

1. Build/run the Node.js backend against [docs/03-api-endpoints-and-ai.md](docs/03-api-endpoints-and-ai.md).
2. `cp .env.local.example .env.local` and set `NEXT_PUBLIC_API_URL` to the **full API base**
   (e.g. `https://api.pssc.livetronics.ai/api`). The client appends `/players/...` to it, so
   a search resolves to `https://api.pssc.livetronics.ai/api/players/search`.

Key source files: [src/lib/types/](src/lib/types/) (shared API shapes),
[src/lib/api.ts](src/lib/api.ts) (typed fetch client + response-envelope handling).

## Data & attribution

Player data comes from [Cricsheet](https://cricsheet.org) (ODC-By license) via the
backend; names/photos are cross-referenced from Wikidata/Wikipedia where available.
