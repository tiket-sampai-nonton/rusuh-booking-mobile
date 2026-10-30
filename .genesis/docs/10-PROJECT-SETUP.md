# PHASE 5.5 — Project Setup (Gate H6)

> GENESIS Phase 5.5 output — stands up repo, CI, static analysis, commit guard, and secrets
> so the first WORKFLOW task (RBT-001) can be implemented → committed (husky green) → pushed →
> scanned → merged with no setup gaps. Derived from `03-GROOMING-DECISIONS.md`, `ARCHITECTURE.md`,
> `PIPELINE.md`, `SECURITY.md`, `TESTING-STRATEGY.md`.
> **Added 2026-10-30:** aligns this project to the 6-gate GENESIS model (H1 Grooming → H2 Docs →
> H3 Tasks → H4 Skills/Rules → H5 Go/No-Go → **H6 Project-Setup verify**).

---

## Status

| Area | Status | Notes |
|------|--------|-------|
| Repository & branch protection | ☐ | GitHub, `RBT` prefix, `develop` base → PR → `main` |
| Local commit guard (husky) | ☐ | lint + typecheck + related tests + changed-code coverage ≥ 80% |
| CI pipeline (GitHub Actions) | ☐ | RBT-005 — see PIPELINE.md |
| Static analysis (SonarCloud) | ☐ | RBT-005 — quality gate incl. new-code coverage |
| Secrets / env | ☐ | `EXPO_PUBLIC_*`, `SONAR_TOKEN`, EAS/registry tokens |
| Project scaffold & deps | ☐ | RBT-001 — single Expo app, Clean-Arch folders, NativeWind |

**Overall:** {READY TO IMPLEMENT | BLOCKED}

> Most rows below are executed by the first-epic stories (RBT-001 scaffold, RBT-005 CI/Sonar).
> H6 **verifies** they are stood up and proven by a green trivial PR — it is the gate between
> "docs ready" (H5) and "building features" (WORKFLOW Phase 0).

---

## 1. Repository (GitHub)

Source: `PIPELINE.md`, repo-root `AGENTS.md`.

- [ ] Repo created on GitHub — `{owner}/{repo}`
- [ ] Default branch: `main`
- [ ] Base/integration branch created: `develop`
- [ ] Branch protection on `main` and `develop`:
  - [ ] Require PR before merge (no direct push)
  - [ ] Require ≥1 approval
  - [ ] Require status checks: typecheck, lint (incl. layer-boundary rules), Jest, coverage, SonarCloud, web-build/SEO check, bundle-size check
  - [ ] No force-push (matches project RULES)
- [ ] `CODEOWNERS` added
- [ ] `.gitignore` covers `.env*`, build output, coverage, `node_modules`, `*.tsbuildinfo`, compiled `.js` next to `.ts/.tsx`
- [ ] PR template added (from `PIPELINE.md`)

## 2. Local Commit Guard (Husky)

Source: `TESTING-STRATEGY.md`, `08-RULES.md` (R008/R009/R017 equivalents), `PIPELINE.md`.

- [ ] `husky` + `lint-staged` installed as dev deps; `"prepare": "husky"` present
- [ ] `.husky/pre-commit` runs: ESLint (staged, **incl. layer-boundary + domain-purity rules**) → `tsc --noEmit` typecheck → related Jest tests → **changed-code coverage ≥ 80%**
- [ ] `.husky/commit-msg` enforces `type(scope): [RBT-xxx] subject` (Conventional Commits + issue key)
- [ ] Verified: a commit that violates a layer boundary, imports React/RN/Expo into `src/domain`/`src/application`, or drops changed-code coverage below threshold is **rejected**
- [ ] NEVER `--no-verify` without recorded human authorization

## 3. CI Pipeline (GitHub Actions) — RBT-005

Source: `PIPELINE.md`.

- [ ] Workflow committed (`.github/workflows/*.yml`)
- [ ] Stages: install → typecheck → lint (incl. boundary rules) → Jest (coverage) → web-build/SEO output check → bundle-size check → SonarCloud
- [ ] Runs on PR to `develop`/`main` + push; stops before deploy/OTA on PRs
- [ ] Playwright + Maestro are **local/manual only** — NOT in cloud CI (per TESTING-STRATEGY §9.1)
- [ ] Coverage lcov uploaded for Sonar ingestion
- [ ] First green run on a trivial PR verified

## 4. Static Analysis (SonarCloud) — RBT-005

Source: `PIPELINE.md`, `SECURITY.md`.

- [ ] Sonar project created: key `{sonar_project_key}`, org `{sonar_org}`
- [ ] `sonar-project.properties` (or CI job): `sonar.sources=apps/client/src`, tests dir, `sonar.javascript.lcov.reportPaths`
- [ ] `sonar.coverage.exclusions` = only non-executable assets (route shells, generated OpenAPI types, pure token modules, thin `.web.tsx`/`.native.tsx` shells) — never hide testable code
- [ ] Quality Gate: **new-code coverage ≥ 90% on shared `src/domain` + `src/application`**; bugs/vulns/smells/duplication thresholds
- [ ] `SONAR_TOKEN` in CI secrets; PR decoration enabled; baseline scan on `develop`

## 5. Secrets & Environment

Source: `PIPELINE.md`, `SECURITY.md`, `ARCHITECTURE.md` env vars.

| Secret / var | Where | Set |
|--------------|-------|-----|
| `EXPO_PUBLIC_API_BASE_URL` | app env (dev/prod) | ☐ |
| `EXPO_PUBLIC_USE_MOCKS` | app env (binds mock vs real adapters) | ☐ |
| `EXPO_PUBLIC_ENV` | app env | ☐ |
| `SONAR_TOKEN` | CI | ☐ |
| `{EAS / registry tokens}` | CI | ☐ |

- [ ] `.env.example` committed (keys only, no values — no secrets in `EXPO_PUBLIC_*`)
- [ ] No secrets in tracked files; secret-scan clean
- [ ] Dependency scanning enabled (Dependabot / `npm audit` in CI)

## 6. Project Scaffold & Dependencies — RBT-001

Source: `ARCHITECTURE.md §3`, grooming stack decisions.

- [ ] Single Expo app `apps/client` scaffolded; boots on web + Android + iOS (dev build)
- [ ] Clean-Architecture folders present: `src/{app,domain,application,infrastructure,presentation,providers,shared}`
- [ ] Path aliases resolve: `@domain/* @application/* @infrastructure/* @presentation/* @providers/* @shared/*`
- [ ] NativeWind wired; `tailwind.config.js` seeded from prototype V5 tokens
- [ ] ESLint layer-boundary + domain-purity rules installed and enforced in pre-commit
- [ ] `tsc --noEmit` strict passes (no `.js` emitted next to source)
- [ ] Core deps from the approved stack only (Expo, Expo Router, Zustand, TanStack Query, RHF+Zod, Reanimated, react-native-svg, NativeWind)
- [ ] `README.md` with clone → run (web/Android/iOS) + test commands

## Done When (H6 pass criteria)

- [ ] Every section above is ☐→✅ or has a tracked exception
- [ ] A **trivial PR goes green end-to-end**: commit (husky passes) → push → CI → SonarCloud gate → mergeable into `develop`
- [ ] No P0 setup blocker open

→ On pass, proceed to `.genesis/workflow/WORKFLOW.md` Phase 0 (TRIGGER) for the first feature task.

---

## GATE H6 — Project-Setup verification (human)

Review checklist:
- [ ] Repo + branch protection match PIPELINE.md and project RULES (no direct push to `main`/`develop`)?
- [ ] Husky commit guard rejects boundary/purity/coverage violations?
- [ ] CI runs the full validation set and stops before deploy on PRs; Playwright/Maestro excluded from cloud CI?
- [ ] SonarCloud quality gate active (new-code coverage ≥ 90% shared core)?
- [ ] Secrets configured, none committed, scan clean?
- [ ] Scaffold matches ARCHITECTURE §3 (single app, Clean-Arch folders, NativeWind, ESLint boundaries)?
- [ ] Trivial PR proven green end-to-end?

**Pass criteria:** all boxes checked; trivial PR merged green. On pass → **WORKFLOW Phase 0** (first feature task).

**GATE H6 STATUS: ⏳ pending (executed by RBT-001 + RBT-005, verified here).**
