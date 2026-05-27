# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A design prototype for "Martina Gledacheva · Tennis Coaching" — a mobile coaching/CRM app. It is **not** a production app: there is no backend, no build step, no package.json, no tests. Everything is client-side React loaded via CDN and compiled in the browser by Babel standalone. The deliverable is a **design canvas** (Figma-like infinite canvas) presenting one interactive prototype plus a gallery of static screen specimens.

## Running it

Serve the directory over HTTP and open `index.html` (Babel standalone can't compile `text/babel` scripts from `file://`). Any static server works, e.g. `python -m http.server` or `npx serve`.

**Path caveat:** `index.html` references scripts under `js/` (`js/data.js`, `js/icons.jsx`, …) but the source files live in the repo root. To run as-is, either serve with the files placed/symlinked under a `js/` directory, or adjust the `src` paths in `index.html`. Verify which arrangement the server expects before assuming the app is "broken."

There is no lint/test/build tooling. Validation is visual — load the page and inspect the canvas.

## Architecture

No modules/imports. Every file is a plain script that defines globals and attaches its public symbols to `window` (e.g. `Object.assign(window, {...})` or `window.Foo = Foo`). **Load order is therefore load-bearing** and is fixed in `index.html`:

1. `data.js` — sample data → `window.CLIENTS`, `SCHEDULE`, `TODAY_LABEL`, `DRILLS_FALLBACK`. "Today" is hardcoded as Wed May 21 2026.
2. `icons.jsx` — `Icon.*` SVG components.
3. `components.jsx` — shared presentational primitives (`Avatar`, `AppBar`, `TabBar`, `Chip`, `Sheet`, `ScheduleRow`, `ClientRow`, etc.). Pure, no app state.
4. `screens-main.jsx` — `TodayScreen`, `RosterScreen`, `ProfileScreen`, `SettingsScreen`. Also defines `clientsById` (a global `Object.fromEntries` map over `CLIENTS`).
5. `screens-actions.jsx` — `AddClientScreen`, `AddNoteSheet`, `ScheduleSheet`, `ScheduleConfirmSheet`, `LessonConfigScreen`, `LessonLoadingScreen`, `LessonOutputScreen`.
6. `prototype.jsx` — `InteractivePrototype`: the one live, navigable phone. Holds all nav state (`route`, `tab`, `sheet`) in `useState` and switches screens. This is the only stateful composition.
7. `design-canvas.jsx` — the reusable canvas engine (see below).
8. `app.jsx` — composition root. Wraps each screen in static "specimen" wrappers (all callbacks `noop`'d) and lays them out as `DCArtboard`s inside `DCSection`s. Mounts `<App/>` to `#root`.

Because everything shares one global scope, each file aliases React hooks under distinct names (`useSP`/`useSA`/`useS`…) to avoid redeclaration collisions across files. Keep that convention when adding code to an existing file.

### The design canvas (`design-canvas.jsx`)

A self-contained, dependency-free Figma-style canvas. Key pieces:

- `DesignCanvas` — owns runtime state (per-section artboard order, renamed titles/labels, hidden artboards, focus). Persists to a `.design-canvas.state.json` sidecar: **reads** via plain `fetch()`, **writes** via a host bridge `window.omelette?.writeFile(...)` — so editing the arrangement only works inside the omelette runtime, but a saved arrangement renders anywhere the HTML + sidecar are served together.
- `DCViewport` — transform-based pan/zoom written straight to the DOM (bypasses React for 60fps). Distinguishes mouse-wheel vs trackpad-scroll vs pinch heuristically; supports Safari `gesture*` events; persists viewport to `localStorage`; proxies a `__dc_zoom` / `__dc_set_zoom` postMessage protocol with the host toolbar.
- `DCSection` / `DCArtboard` — `DCArtboard` is a marker component (returns `null`); `DCSection` reads artboard children by `type` and renders them via `DCArtboardFrame`. Fragments are flattened (`dcFlatten`) so `<>…</>` grouping doesn't hide them.
- `DCArtboardFrame` — per-artboard chrome: drag-to-reorder, inline-editable label, delete, focus, and PNG/HTML export (`dcExport` inlines computed styles + fonts as data URIs into an SVG `foreignObject`).
- `DCFocusOverlay` — fullscreen single-artboard view (←/→ within section, ↑/↓ across sections, Esc to exit), portaled to `document.body`.
- Chrome counter-scales against zoom via the `--dc-inv-zoom` CSS variable so labels/titles stay a constant on-screen size.

The canvas engine is generic and reusable; the tennis screens are just its content. Treat `design-canvas.jsx` as infrastructure — changes there affect every artboard.

### Styling

All visual styling is in `styles.css` via CSS custom properties (`--ink*`, `--clay*`, `--surface*`, `--line*`, `--font-mono`). Screens mix CSS classes with inline styles; the `clay` color is the brand accent (marks "next"/active). Fonts (Instrument Serif / Geist / Geist Mono) load from Google Fonts in `index.html`.

## Data model

`CLIENTS` covers five coaching archetypes (advanced adult, social/intermediate, beginner, junior red-ball, group) plus extras, each with notes, gear, NTRP, cadence, and next/last lesson. `SCHEDULE` rows reference clients by `clientId` and carry a `status` (`done`/`upcoming`/`scheduled`). `DRILLS_FALLBACK` is the static lesson-plan content keyed by focus area (forehand/backhand/serve/footwork/fitness). The "AI lesson generator" flow is a timed fake (`LessonLoadingScreen` auto-advances after ~3.6s) — there is no real LLM call despite the Settings screen showing an API key field.
