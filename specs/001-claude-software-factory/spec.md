# Feature Specification: Claude Software Factory for a Todo App

**Feature Branch**: `001-claude-software-factory`
**Created**: 2026-11-11
**Status**: Approved
**Input**: User description: "Re-implement the warpdotdev cloud-factory-demo (Oz agents) using Claude Code headless. Use a simple todo web app, create 3 GitHub issues and PRs, deploy to Azure Static Web Apps, and run a verification engine."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Issue is triaged automatically (Priority: P1)

A maintainer opens a GitHub issue. Within minutes the factory comments with a
triage summary and applies exactly one readiness label:
`ready-to-implement`, `ready-to-spec`, `needs-info`, or `wait-to-implement`.

**Why this priority**: Triage is the entry point; nothing else runs without it.

**Independent Test**: Open an issue; observe one label plus one triage comment.

**Acceptance Scenarios**:
1. **Given** a clear, small feature request, **When** the issue is opened, **Then** it is labeled `ready-to-implement` and implementation is dispatched.
2. **Given** a vague request, **When** it is opened, **Then** it is labeled `needs-info` with concrete questions.

### User Story 2 - Ready issue becomes a PR (Priority: P1)

For a `ready-to-implement` issue, a Claude headless agent implements the change
with tests, and the workflow opens a PR that references the issue (`Closes #N`).

**Independent Test**: Label an issue `ready-to-implement`; a PR appears with code + tests and passing CI.

**Acceptance Scenarios**:
1. **Given** a ready issue, **When** implementation finishes, **Then** a PR exists on branch `factory/issue-N` with a summary, test notes, and `Closes #N`.
2. **Given** the agent cannot finish, **When** it returns `status: blocked`, **Then** no PR is opened and the issue gets an explanatory comment.

### User Story 3 - PR is reviewed, verified on Azure, and auto-merged (Priority: P1)

Every factory PR is deployed to an Azure Static Web Apps preview environment.
A review agent reviews the diff; a verification agent drives the preview URL in
a real browser (Playwright MCP), checks every acceptance criterion from the
issue, and records screenshots + video. If all gates pass, the PR auto-merges
and production deploys.

**Independent Test**: Dispatch the pipeline for a PR; observe review, verification evidence comment, merge, and a production URL showing the feature.

**Acceptance Scenarios**:
1. **Given** a correct PR, **When** the pipeline runs, **Then** it posts a review, a verification report with per-criterion pass/fail and embedded screenshots, merges, and deploys to production.
2. **Given** verification fails any criterion, **When** the pipeline ends, **Then** the PR is not merged and is labeled `factory:needs-human`.

### User Story 4 - Production is verified after deploy (Priority: P2)

After a production deploy, the verification engine runs a smoke pass against
the production URL and reports on the issue/PR.

### Edge Cases

- Two PRs touching the same file: pipeline runs are serialized; a PR that is no longer mergeable is labeled `factory:needs-human`.
- Agent exceeds budget or times out: the job fails closed (no merge).
- Agent output fails schema validation: treated as failure.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Triage MUST run on `issues.opened` and apply exactly one readiness label.
- **FR-002**: Implementation MUST run on `workflow_dispatch` (from triage) or when a human applies `ready-to-implement`.
- **FR-003**: Agents MUST NOT hold GitHub write tokens; workflows perform writes from agent JSON.
- **FR-004**: Every PR MUST get an Azure SWA preview environment and the verification engine MUST run against that URL.
- **FR-005**: Verification evidence (screenshots, video) MUST be uploaded as run artifacts and screenshots embedded in the PR comment.
- **FR-006**: Auto-merge MUST require tests green + review approve + verification pass.
- **FR-007**: Merge to `main` MUST deploy production and run a production smoke verification.
- **FR-008**: The todo app MUST persist todos in `localStorage` and have no backend.

### Key Entities

- **Triage decision**: `{label, summary, comment, acceptance_criteria[]}`
- **Implementation result**: `{status, pr_title, pr_body, summary, tests_run[]}`
- **Review**: `{verdict, summary, findings[{path, line, severity, body}]}`
- **Verification report**: `{result, target_url, criteria[{id, description, status, evidence[], notes}], screenshots[]}`

## Success Criteria *(mandatory)*

- **SC-001**: 3 issues go from opened → merged → deployed with zero human action.
- **SC-002**: Each merged PR has a verification comment with ≥1 screenshot per acceptance criterion and a video artifact.
- **SC-003**: Production URL serves each feature after its merge.

## Assumptions

- Anthropic API key is not workspace-scoped, so every request sends `anthropic-workspace-id` (via `ANTHROPIC_CUSTOM_HEADERS`).
- Public repo `DeccansoftAITeam/claude-todo-factory`; Azure SWA Free tier.
- Human operator files demo issues one at a time to avoid merge conflicts.
