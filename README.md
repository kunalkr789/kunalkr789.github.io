# kunalkr789.github.io

My interactive portfolio: **[kunalkr789.github.io](https://kunalkr789.github.io)**

I build workflow builders and rules engines for a living, so this portfolio **is a workflow**. Every section is a node on a canvas, with a type, an id, ports, edges and an inspector, just like the builders I ship at work. Press **Run flow** and it executes node by node as a 20-second guided tour.

| Node | What's live | Shows |
|---|---|---|
| Trigger · intro | Payload with key numbers that count up as they appear | |
| Action · shipped platforms | Three case studies, each with a "test step": an AND/OR **rules engine** feeding a multi-tenant **outreach-plan simulator** (WhatsApp/SMS/email/voice, Twilio/SES/Infobip, AI-agent call forwarding, GuardDuty PDF scan), a Steris **tree data grid** over 10,000 rows (infinite scroll, debounced server search, notification polling, nested menus, certificates, real `.xlsx` export), an **interconnected assignment form**, **live MUI theming** (sliders drive a nested `createTheme`), an **intent-matching chat** | Redux Toolkit, `useDeferredValue`, token-driven theming |
| **Sub-flow · DWAR Foundation** | A full case study of the NGO platform I built pro bono: before/after, a playable volunteer journey (register → verify → event → attendance → certificate → QR verification), and a role matrix | |
| Condition → HTTP request | A real **REST API** with routing, middleware, a 60 req/min rate limit, validation and pagination | An Express-style router I wrote, running in the browser |
| Action · quality gate | Pipeline run, AI-assisted workflow, and **live Core Web Vitals** for this page | `PerformanceObserver`, perf budgets |
| Loop · side projects | Society Maintainer, QR Menu SaaS, Shreshva storefront, realtime trading-signal engine | |
| Data · career + GitHub | Experience you can filter, plus a live **GitHub growth timeline** (2020 practice repos → 2025–26 products) | RTK Query, caching, fallback data |
| Output · contact | A validated form that opens the visitor's mail app | Shared API validation |
| Studio chrome | Node palette, inspector, scroll-synced **minimap**, `/` command menu, light/dark canvas | One IntersectionObserver feeding Redux |

## Stack

React 19 · TypeScript (strict) · **MUI** (custom theme built from the design tokens) · Redux Toolkit and RTK Query · Framer Motion · Vite · Vitest · Playwright · GitHub Actions → GitHub Pages

## Quality gates

Every push runs **typecheck → unit tests (Vitest) → E2E tests (Playwright, desktop + mobile)** before deploying. It's the same idea as the 450+ test GitLab pipeline I built at work, at a smaller scale.

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests
npm run test:e2e   # Playwright (builds and serves the production bundle)
```

## Performance

The build **prerenders the page** (`src/entry-server.tsx` + `scripts/prerender.mjs`): the HTML ships with MUI's critical CSS and the site CSS inlined, hero fonts preloaded, and the JS entry started after first paint, so content paints before any JavaScript runs. Below-the-fold nodes use `content-visibility: auto`.

Lighthouse (production build): **desktop 100 / 100 / 100 / 100**, **mobile 87–89 / 100 / 100 / 100**.

Measure the production build, not the dev server (which serves hundreds of unbundled modules):

```bash
npm run build && npm run preview   # then run Lighthouse on http://localhost:4173
```

## Structure

```
src/
  app/          store (RTK slices) and the GitHub API (RTK Query)
  components/   Toolbar (Run flow), Panels (palette, inspector, minimap), FlowNode, CommandPalette
  data/         profile content + flow.ts (the node registry everything reads from)
  features/     one folder per node (hero, work, backend, engineering, more)
  lib/          miniServer (router), portfolioApi, rules engine, bot, hooks
tests/e2e/      Playwright specs
```
