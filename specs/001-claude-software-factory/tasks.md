# Tasks: Claude Software Factory for a Todo App

**Input**: `specs/001-claude-software-factory/{spec.md,plan.md}`

## Phase 1: Setup

- [x] T001 `git init`, `specify init --integration claude`, constitution
- [x] T002 [P] `package.json` with vitest, @playwright/test, http-server scripts
- [x] T003 [P] `vision.md`, `roadmap.md`, `CLAUDE.md` (guide triage + agents)

## Phase 2: Foundational — the todo app (baseline)

- [x] T010 `app/src/todo.js` add/toggle/remove/list (pure)
- [x] T011 `app/src/storage.js`, `app/src/main.js`, `app/index.html`, `app/styles.css`
- [x] T012 [P] `tests/unit/todo.test.js`, `tests/e2e/todo.spec.js`
- [x] T013 `app/staticwebapp.config.json`

## Phase 3: US1 Triage (P1)

- [x] T020 `factory/scripts/claude-run.sh` (auth header, budget, schema, logs)
- [x] T021 `factory/schemas/triage.json`, `.claude/skills/triage/SKILL.md`
- [x] T022 `.github/workflows/triage.yml` (agent job read-only → apply job writes, dispatches implement)

## Phase 4: US2 Implementation (P1)

- [x] T030 `factory/schemas/implementation.json`, `.claude/skills/implementation/SKILL.md`
- [x] T031 `.github/workflows/implement.yml` (agent edits → workflow commits, opens PR, dispatches pipeline)

## Phase 5: US3 Review + Verify + Auto-merge (P1)

- [x] T040 `factory/schemas/review.json`, `.claude/skills/review-pr/SKILL.md`
- [x] T041 `factory/schemas/verification.json`, `factory/mcp/playwright.json`, `.claude/skills/verify-behavior/SKILL.md`
- [x] T042 `factory/scripts/publish-evidence.sh` (orphan branch + markdown report)
- [x] T043 `.github/workflows/pipeline.yml` (checks, preview deploy, review, verify, gate, merge, dispatch deploy)
- [x] T044 `.github/workflows/close-preview.yml`

## Phase 6: US4 Production deploy (P2)

- [x] T050 `.github/workflows/deploy.yml` (SWA production + smoke verification)

## Phase 7: Provision & run

- [ ] T060 Create public repo `DeccansoftAITeam/claude-todo-factory`, labels, Actions write + PR-create permission
- [ ] T061 Create Azure RG `rg-claude-todo-factory` + SWA `swa-claude-todo-factory` (Free, eastus2); store deployment token secret
- [ ] T062 Set secrets `ANTHROPIC_API_KEY`, `ANTHROPIC_WORKSPACE_ID`, `AZURE_STATIC_WEB_APPS_API_TOKEN`
- [ ] T063 Push `main`; confirm baseline production deploy
- [ ] T064 File issue 1 (filters) → watch triage → PR → verify → merge → deploy
- [ ] T065 File issue 2 (inline edit) → same
- [ ] T066 File issue 3 (items-left counter + clear completed) → same

## Dependencies

Phase 2 before 3–6. T060–T063 before T064. T064 → T065 → T066 sequential (avoid conflicts).
