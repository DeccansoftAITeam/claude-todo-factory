# CLAUDE.md

Project rules for every Claude run in this repo, including the headless factory agents.

## What this is
- `app/` — a no-build vanilla JS todo app (ES modules), deployed as-is to Azure Static Web Apps.
- `factory/`, `.claude/skills/`, `.github/workflows/` — the Claude headless software factory. Product changes never touch these.
- `specs/` — spec-kit artifacts (`spec.md`, `plan.md`, `tasks.md`). `.specify/memory/constitution.md` is binding.

## App conventions
- State logic: pure, immutable functions in `app/src/todo.js` (no DOM, no storage). Persistence: `app/src/storage.js`. DOM: `app/src/main.js`.
- Never put user text into `innerHTML`; use `textContent`. No external scripts, fonts or network calls (the CSP is `'self'`).
- Every interactive element gets a `data-testid` and an accessible name. Everything must work from the keyboard.
- Styles: reuse the CSS variables in `app/styles.css`. Both light and dark schemes must look right.
- No new dependencies.

## Tests
- `npm test` — Vitest unit tests in `tests/unit/` (logic only).
- `npm run test:e2e` — Playwright in `tests/e2e/`, served from `app/` on port 4173. Start each test from cleared `localStorage`.
- Every acceptance criterion gets an e2e test. Every new logic function gets a unit test.

## Commits
Conventional commits (`feat:`, `fix:`, `test:`, `docs:`).
