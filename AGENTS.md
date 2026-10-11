# AGENTS.md — PasswordMonkey Agent Conventions

Every agent session in this repository starts here, then reads STATE.md.

## Orchestration protocol (ACTIVE — established 2026-10-01)
- `STATE.md` at the repo root is the single source of truth for project state, key decisions, and any approved chunk plan.
- READ `STATE.md` at the start of every session/task, before any other work.
- UPDATE `STATE.md` after every completed step (or report results back so the orchestrator can).
- Decompose work into chunks of 5-7 atomic steps max; present the plan to the user BEFORE writing any code; execute one chunk per session; never start a new chunk without explicit user approval; never edit outside the approved scope.

## Non-negotiables
- All password generation stays client-side (Web Crypto API). Never log, store, or transmit generated passwords.
- Design system: sidebar layout, dark theme, kilo typography (Geist Mono / Hanken Grotesk / JetBrains Mono via `kilo-typography.css`). Marker checklist and migration findings live in `STATE.md`.
- Build step (since 2026-10-11): pages in the repo root are SOURCES carrying `<!--@include partials/... -->` markers; `npm run build` (`scripts/build.mjs`) expands them into `dist/`. Cloudflare Pages builds with command `node scripts/build.mjs`, output dir `dist` — never serve the repo root. Shared chrome (sidebar/topbar/footer/head/fonts/theme) lives in `partials/` — edit there once, rebuild, and it applies sitewide. Local preview = `npm run build` + a static server on `dist/` (`npm start` serves UNEXPANDED sources).
- Long-term team memory: `MEMORY.md` (TencentDB Agent Memory). Query via `node scripts/recall-memory.js "<topic>"` when the gateway (:8420) is running.

## Root strays (do not treat as conventions)
`Exclude`, `fix5.js`, `fix6.js`, `fix7.js` are untracked debris from past patch work — not patterns to follow.
