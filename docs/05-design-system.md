# Player Scout — Design System (Tokens & Theming)

Player Scout uses a **"Pitch & Gold"** cricket-broadcast theme built on a **design-token** system:
components never hardcode colors — they reference semantic tokens, which resolve to different
values per theme. This gives you light/dark switching and one-line brand re-coloring for free.

**Identity:** field-green primary + auction-gold accent + seam-red highlight, on a warm
parchment (light) / night-pitch (dark) surface. Headings use a condensed display face
(**Oswald**, via `next/font`) for a sporty broadcast feel; body stays Geist.

All tokens live in **[src/app/globals.css](../src/app/globals.css)**.

---

## The two tiers

### Tier 1 — Brand knob (change the primary color here)

At the very top of `globals.css`:

```css
:root {
  --brand: #0f7a44;          /* PRIMARY — field green. Change this to re-theme */
  --brand-strong: #0b6236;   /* hover / active */
  --brand-contrast: #ffffff; /* text/icon on a brand fill */
  --accent: #b7841f;         /* auction gold */
  --accent-contrast: #1a1200;
  --ball: #c2362f;           /* seam red — value-gap, alerts, motifs */
}
```

Change `--brand` and **every** button, link, active chip, similarity/readiness badge, and
chart series updates — in both themes. Dark mode overrides `--brand` to a brighter step
(`#28b265`) so it stays legible on the night-pitch surface; change that line too if you want a
different dark-mode primary. `--accent` (gold) and `--ball` (red) are secondary knobs used for
value emphasis, medallions, seam motifs, and the second chart series.

> Want per-theme brand colors? Set `--brand` inside the light block and the dark blocks
> separately. Otherwise the single top-level value applies everywhere.

### Tier 2 — Semantic tokens (what components use)

Defined once per theme. These are the names components reference (via Tailwind utilities like
`bg-surface`, `text-ink-muted`, `border-hairline`, `text-series`):

| Token | Tailwind utility | Role | Light | Dark |
|---|---|---|---|---|
| `--background` | `bg-background` | Page plane (parchment / night pitch) | `#f4efe2` | `#0b1710` |
| `--surface` | `bg-surface` | Base surface / chips | `#fbf8f0` | `#10201a` |
| `--surface-raised` | `bg-surface-raised` | Elevated cards (`.card`) | `#ffffff` | `#16281f` |
| `--foreground` | `text-foreground` | Primary ink | `#15221a` | `#eaf3ec` |
| `--ink-secondary` | `text-ink-secondary` | Secondary ink | `#4a5a50` | `#a9bdb0` |
| `--ink-muted` | `text-ink-muted` | Labels / axes | `#8a8377` | `#7c8a80` |
| `--grid` | via `var()` in charts | Chart gridlines | `#e4ddcb` | `#1e3228` |
| `--baseline` | via `var()` in charts | Chart axis / track | `#cfc6b0` | `#2a3e33` |
| `--border` | `border-hairline` | Hairline borders | `rgba(20,30,20,.1)` | `rgba(255,255,255,.09)` |
| `--series-1` | `bg-series` / `text-series` | Primary data series (= `--brand`) | green | green |
| `--series-2` | `text-series-2` | Second data series (= `--accent`) | gold | gold |
| `--accent` | `text-accent` / `bg-accent` | Auction gold (value, medallions) | `#b7841f` | `#e7b23c` |
| `--ball` | `text-ball` | Seam red (highlights, role stripe) | `#c2362f` | `#e24b41` |
| `--good` | `text-good` | Positive / strengths (= brand) | green | green |
| `--warning` | `text-warn` | Caution / weaknesses | `#a85a12` | `#e7b23c` |
| `--brand-contrast` | `text-on-primary` | Text on a brand fill | `#ffffff` | `#ffffff` |
| `--chart-cursor` | via `var()` in charts | Recharts hover cursor | `rgba(20,30,20,.05)` | `rgba(255,255,255,.06)` |

Also available: elevation/effect tokens `--shadow-1`, `--shadow-2`, `--glow-brand`,
gradients `--grad-brand` (green→teal) and `--grad-gold`, and hero-aura tints `--aura-1/2`.

## Typography

- **Display / headings & big numbers:** Oswald (condensed), loaded in
  [layout.tsx](../src/app/layout.tsx) as `--font-display`; use via `font-display`. Pair with
  `tabular-nums` for stats.
- **Body:** Geist Sans (`font-sans`, the default).

## Motif & effect utilities (in `globals.css`)

The cricket-broadcast character comes from a handful of reusable utilities:

| Class | What it does |
|---|---|
| `.card` / `.card-hover` | Elevated raised surface with shadow; `.card-hover` adds a lift + brand-tinted border on hover |
| `.seam` | Cricket-ball **seam-stitch divider** (gold dashed) |
| `.pitch-line` | The 22-yard gold rule under section headings (see `SectionHeading`) |
| `.hero-aura` | Ambient radial green+gold glow behind hero sections |
| `.grain` | Subtle noise overlay (on `<body>`) to avoid a flat look |
| `.text-gradient` | Green→gold gradient text for hero headlines |
| `.rise-in` | Gentle entrance animation (disabled under `prefers-reduced-motion`) |

Shared building blocks: [Logo](../src/components/Logo.tsx) (seamed cricket-ball mark),
[SectionHeading](../src/components/SectionHeading.tsx), [StatTile](../src/components/StatTile.tsx)
(broadcast stat tile), and [SimilarityBadge](../src/components/SimilarityBadge.tsx) (green→gold
gauge).

---

## How theming resolves

The app **follows the OS by default** and lets an explicit choice win:

```css
:root { color-scheme: light; /* light values */ }

@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) { /* dark values */ }
}

:root[data-theme="dark"] { /* dark values — beats OS light */ }
:root[data-theme="light"] { color-scheme: light; /* beats OS dark */ }
```

- **No `data-theme` attribute** → follow the OS setting.
- The header toggle ([src/components/ThemeToggle.tsx](../src/components/ThemeToggle.tsx)) stamps
  `data-theme="light"` or `"dark"` on `<html>` and saves it to `localStorage["scoutiq-theme"]`.
- An **anti-FOUC inline script** in [src/app/layout.tsx](../src/app/layout.tsx) applies the
  saved choice before first paint, so there's no flash of the wrong theme on reload.

---

## Recipes

**Change the primary color:** edit `--brand` (and optionally the dark-mode `--brand`) in
`globals.css`. Nothing else.

**Add a new semantic token:**
1. Add `--my-token` to the light `:root` block and to **both** dark blocks (the
   `@media` one and the `[data-theme="dark"]` one).
2. Expose it to Tailwind in the `@theme inline` block: `--color-my-token: var(--my-token);`.
3. Use it as `bg-my-token` / `text-my-token`, or `var(--my-token)` inside a chart prop.

**Use a token in a component:** prefer the Tailwind utility (`bg-surface`, `text-series`); for
Recharts props that take raw color strings, pass `var(--token)`.

**Don't** hardcode hex/rgba in components — that's what breaks theming. The only file with raw
color values is `globals.css` (plus franchise brand colors in mock data, which are real-world
data, not UI chrome).
