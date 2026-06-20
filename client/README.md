# AI Trust Assistant — Frontend

Svelte 5 + TypeScript + Tailwind v4 frontend for the AI Trust Assistant fraud-detection
engine. Three screens: sign in / create account, paste-a-link case intake, and a case-file
results page with trust score, scraped exhibit data, red flags, and a buy-through link.

## Quick start

```bash
npm install
cp .env.example .env      # point this at your Express backend
npm run dev               # http://localhost:5173
```

```bash
npm run build              # production build -> dist/
npm run check               # svelte-check (types)
```

## ⚠️ Before you wire this up to your real backend

Your blueprint specifies `POST /api/analysis` and the `AnalysisRecord` shape exactly, so that
part is wired to match. It does **not** specify your auth routes, so I built `src/lib/api.ts`
against the common Express/Mongoose convention below. **Everything that talks to the network
lives in that one file** — if your real routes or payload shapes differ, that's the only file
you need to touch.

| Method | Path | Body | Returns | Auth |
|---|---|---|---|---|
| POST | `/auth/register` | `{ name, email, password }` | `{ token, user }` | — |
| POST | `/auth/login` | `{ email, password }` | `{ token, user }` | — |
| POST | `/analysis` | `{ targetUrl }` | `AnalysisRecord` | Bearer token |
| GET | `/analysis/:id` | — | `AnalysisRecord` | Bearer token (defined but not currently called — see note below) |

Auth is assumed to be a **JWT returned in the response body**, which the frontend stores in
`localStorage` and sends back as `Authorization: Bearer <token>`. If your backend instead sets
an http-only session cookie, swap the `Authorization` header in `api.ts` for `credentials:
'include'` on the `fetch` call, and drop the token plumbing in `auth.svelte.ts`.

`getAnalysis(id)` is included for a follow-up you may want: refetching a case by id so a
results page survives a hard refresh (right now the result only lives in memory after a
successful `POST /analysis`, so reloading the results page drops you back to the intake
screen). Wire it up to a route like `/case/:id` if you add a real router later — see "Routing"
below.

## Project structure

```
src/
  lib/
    types.ts                 # AnalysisRecord, AuthUser, etc. — mirrors your Mongoose schema
    api.ts                   # the only file that calls fetch() — endpoint paths live here
    verdict.ts                # verdict/score -> color tone mapping
    stores/
      auth.svelte.ts          # token + user, persisted to localStorage (Svelte 5 runes)
      app.svelte.ts           # which screen is showing + the active case
    components/
      AuthView.svelte         # sign in / create account
      AnalyzeView.svelte      # paste-a-link intake + staged "pipeline" animation
      ScanProgress.svelte     # the 3-step scrape -> web evidence -> AI review animation
      ResultsView.svelte      # case file: score, exhibit data, red flags, buy-through link
      TrustGauge.svelte       # radial 0-100 score gauge
      VerdictStamp.svelte     # rotated rubber-stamp verdict badge
      SpecsTable.svelte       # renders scrapedData.specs
      RedFlagList.svelte      # renders aiAssessment.redFlags
      TopBar.svelte
  App.svelte                  # switches between the three views
  app.css                     # Tailwind v4 theme tokens (see "Design" below)
```

## Routing

There's no router library — `appState.view` in `app.svelte.ts` is a plain `'auth' |
'analyze' | 'results'` switch, since the brief was three sequential screens rather than a
multi-route site. If you outgrow that (e.g. a case history list, shareable result URLs), drop
in `svelte-spa-router` or move the project into SvelteKit and split these three components into
real routes — they're already self-contained and don't assume anything about how they're
mounted.

## Design notes

The visual direction is an "evidence desk" rather than a generic SaaS dashboard: a case file
gets opened, evidence gets attached (Exhibit A = scraped listing, Exhibit B = red flags), and a
verdict gets stamped on it. Palette, fonts, and component tokens are defined once in
`src/app.css` under `@theme` (Tailwind v4's CSS-first config) — `desk-*` for the dark UI
surfaces, `paper-*` for the "exhibit" cards, `brass-*` as the single accent, and
`trust-*`/`caution-*`/`risk-*` for verdict color-coding. Change those variables to retheme the
whole app without touching components.

## Known gaps / things you'll likely want next

- **No password-reset or email-verification flow.** Not in scope, not in the blueprint.
- **Results don't survive a refresh.** See the `getAnalysis(id)` note above.
- **No case history page.** Each analysis is shown once, right after you run it.
- **Image fallback:** if `scrapedData.imageUrl` 404s or hotlinking is blocked by the source
  site, the UI shows a "No image" placeholder instead of a broken-image icon.
