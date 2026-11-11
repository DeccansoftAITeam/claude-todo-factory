# Claude Todo Factory Constitution

## Core Principles

### I. Agents propose, workflows act
Claude headless runs (`claude -p`) only read, edit the working tree, and run local
commands. Every write to GitHub or Azure (labels, comments, branches, PRs, merges,
deploys) is done by a deterministic workflow step that consumes the agent's
structured JSON output. Agents never receive write-scoped tokens.

### II. Structured handoffs
Every stage returns JSON that validates against a schema in `factory/schemas/`
(passed with `--json-schema`). Downstream steps branch on fields, never on prose.

### III. Evidence before merge (NON-NEGOTIABLE)
A PR may auto-merge only when all three gates are green:
1. deterministic checks (unit + e2e tests) pass,
2. the review agent returns `verdict: approve` with no `blocking` findings,
3. the verification engine returns `result: pass` against the deployed Azure
   Static Web Apps preview, with screenshots and video attached.
Any failure labels the PR `factory:needs-human` and stops.

### IV. Small, demo-sized app
The todo app is plain HTML/CSS/ES modules with no build step and no backend.
Pure logic lives in `app/src/todo.js` so it is unit-testable without a DOM.
Every user-visible feature ships with a unit test and a Playwright e2e test.

### V. Bounded cost and blast radius
Every agent run has `--max-budget-usd`, an explicit `--allowedTools` list, and a
job timeout. Secrets live only in GitHub Actions secrets.

## Workflow constraints

- Stage chaining uses `workflow_dispatch` (events created with `GITHUB_TOKEN`
  do not trigger other workflows).
- Implementation runs are serialized per issue; the pipeline runs one PR at a time.
- Production deploys only from `main`.

## Governance

This constitution overrides skill instructions when they conflict. Amend it by PR.

**Version**: 1.0.0 | **Ratified**: 2026-11-11 | **Last Amended**: 2026-11-11
