# ScoutIQ — Design System (Tokens & Theming)

ScoutIQ uses a **design-token** system: components never hardcode colors — they reference
semantic tokens, which resolve to different values per theme. This gives you light/dark
switching and one-line brand re-coloring for free.

All tokens live in **[src/app/globals.css](../src/app/globals.css)**.

---

## The two tiers

### Tier 1 — Brand knob (change the primary color here)

At the very top of `globals.css`:

```css
:root {
  --brand: #2a78d6;          /* PRIMARY — change this one line to re-theme */
  --brand-strong: #1c5cab;   /* hover / active */
  --brand-contrast: #ffffff; /* text/icon on a brand fill */
}
```

Change `--brand` and **every** button, link, active chip, similarity/readiness badge, and
chart series updates — in both themes. Dark mode overrides `--brand` to a slightly lighter
step (`#3987e5`) so it stays legible on the dark surface; change that line too if you want a
different dark-mode primary.

> Want per-theme brand colors? Set `--brand` inside the light block and the dark blocks
> separately. Otherwise the single top-level value applies everywhere.

### Tier 2 — Semantic tokens (what components use)

Defined once per theme. These are the names components reference (via Tailwind utilities like
`bg-surface`, `text-ink-muted`, `border-hairline`, `text-series`):

| Token | Tailwind utility | Role | Light | Dark |
|---|---|---|---|---|
| `--background` | `bg-background` | Page plane | `#f9f9f7` | `#0d0d0d` |
| `--surface` | `bg-surface` | Cards / chart surface | `#fcfcfb` | `#1a1a19` |
| `--foreground` | `text-foreground` | Primary ink | `#0b0b0b` | `#ffffff` |
| `--ink-secondary` | `text-ink-secondary` | Secondary ink | `#52514e` | `#c3c2b7` |
| `--ink-muted` | `text-ink-muted` | Labels / axes | `#898781` | `#898781` |
| `--grid` | `stroke-grid`* | Chart gridlines | `#e1e0d9` | `#2c2c2a` |
| `--baseline` | `stroke-baseline`* | Chart axis / track | `#c3c2b7` | `#383835` |
| `--border` | `border-hairline` | Hairline borders | `rgba(11,11,11,.1)` | `rgba(255,255,255,.1)` |
| `--series-1` | `bg-series` / `text-series` | Data / brand series (= `--brand`) | blue | blue |
| `--good` | `text-good` | Positive / strengths | `#0ca30c` | `#0ca30c` |
| `--warning` | `text-warn` | Caution / weaknesses | `#b26a00` | `#fab219` |
| `--brand-contrast` | `text-on-primary` | Text on a brand fill | `#ffffff` | `#ffffff` |
| `--chart-cursor` | — (used via `var()` in charts) | Recharts hover cursor | `rgba(11,11,11,.05)` | `rgba(255,255,255,.05)` |

\* Charts pass these as `var(--grid)` / `var(--baseline)` directly to Recharts props, not as
Tailwind classes.

Palette values come from the validated dataviz reference palette, so both themes are
contrast-checked out of the box.

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
