# PROJECT-SETUP.md — Project Preparation (Pre-Implementation)

> Generated at **GENESIS Phase 5.5 (PROJECT SETUP)** — after the tech stack is
> groomed and docs/tasks are verified, and **before** the first WORKFLOW trigger.
> Every item here is derived from grooming decisions (ARCHITECTURE, CI-CD,
> SECURITY, TESTING-STRATEGY, TRACKING). Fill `{...}` with real project values.
>
> **Purpose:** stand up the repo, CI, static analysis, hooks, and secrets so the
> very first task can be implemented, committed (husky guard passes), pushed,
> scanned, and merged without any setup gaps.

---

## Status

| Area | Status | Notes |
|------|--------|-------|
| Repository & branch protection | ☐ | |
| Local commit guard (husky) | ☐ | |
| CI pipeline | ☐ | |
| Static analysis (Sonar) | ☐ | |
| Secrets / env | ☐ | |
| Project scaffold & deps | ☐ | |

**Overall:** {READY TO IMPLEMENT | BLOCKED}

---

## 1. Repository (GitHub / GitLab)

Source: `CI-CD.md`, `TRACKING.md`.

- [ ] Repo created: `{owner}/{repo}` — {url}
- [ ] Default branch: `{main}`
- [ ] Base/integration branch created: `{develop}`
- [ ] Branch protection on `{main}` and `{develop}`:
  - [ ] Require PR before merge
  - [ ] Require {n} approval(s)
  - [ ] Require status checks to pass: `{lint}`, `{typecheck}`, `{test}`, `{coverage}`, `{sonar}`
  - [ ] No force-push / no direct push (matches RULES R005/R006)
- [ ] `CODEOWNERS` added
- [ ] `.gitignore` covers `.env*`, build output, coverage, `node_modules` (RULES R051)
- [ ] PR template added (from `TRACKING.md §PR Description Template`)

```bash
# Example (GitHub CLI)
gh repo create {owner}/{repo} --private
gh api repos/{owner}/{repo}/branches/{main}/protection -X PUT -f ...
```

---

## 2. Local Commit Guard (Husky)

Source: `TESTING-STRATEGY.md §Pre-Commit Coverage Gate`, `CI-CD.md §Local Git Hooks`.

- [ ] `husky` + `lint-staged` installed as dev deps
- [ ] `"prepare": "husky"` script present (hooks auto-install on `{install command}`)
- [ ] `.husky/pre-commit` runs: lint (staged) → type-check → related tests → **coverage gate ≥ {coverage_threshold}% (default 80%)**
- [ ] `.husky/commit-msg` enforces issue-key + Conventional Commits (optional)
- [ ] Verified: a commit that drops changed-code coverage below threshold is **rejected** (RULES R008/R017)

```bash
{pkg-manager} add -D husky lint-staged
npx husky init
# add .husky/pre-commit per TESTING-STRATEGY.md
```

---

## 3. CI Pipeline

Source: `CI-CD.md`.

- [ ] Pipeline file committed: `{.github/workflows/ci.yml | .gitlab-ci.yml | ...}`
- [ ] Stages: Install → Lint → Type-check → Test (**coverage ≥ {coverage_threshold}%**) → Build → Scan
- [ ] Runs on: PR to `{develop}`/`{main}` + push
- [ ] Required checks wired to branch protection (section 1)
- [ ] Coverage report uploaded (lcov) for Sonar ingestion
- [ ] First green run on an empty/trivial PR verified

---

## 4. Static Analysis (SonarQube / SonarCloud)

Source: `CI-CD.md §SAST`, `SECURITY.md`.

- [ ] Sonar project created: key `{sonar_project_key}`, org `{sonar_org}` — {url}
- [ ] `sonar-project.properties` (or CI job) committed:
  - [ ] `sonar.projectKey={key}`
  - [ ] `sonar.sources=src`, `sonar.tests={test dir}`
  - [ ] `sonar.javascript.lcov.reportPaths={coverage/lcov.info}`
  - [ ] `sonar.coverage.exclusions={only non-executable: scss, html, i18n maps, static, loadable wrappers, test helpers}`
- [ ] `SONAR_TOKEN` / `SONAR_HOST_URL` added to CI secrets (section 5)
- [ ] Quality Gate chosen: `{Sonar way | custom}`; **new_coverage ≥ {coverage_threshold}%**
- [ ] PR decoration enabled (Sonar comments on PRs)
- [ ] Baseline scan on `{develop}` run once

> Note: exclusions are for genuinely non-executable assets only — never hide testable code behind `sonar.coverage.exclusions`.

---

## 5. Secrets & Environment

Source: `CI-CD.md §Secrets Management`, `SECURITY.md`.

| Secret | Where | Set | Rotation |
|--------|-------|-----|----------|
| `SONAR_TOKEN` | CI | ☐ | {freq} |
| `{REGISTRY_TOKEN}` | CI | ☐ | {freq} |
| `{DEPLOY_KEY}` | CI | ☐ | {freq} |

- [ ] `.env.example` committed (keys only, no values)
- [ ] No secrets in tracked files (RULES R015/R051); secret-scan clean
- [ ] Dependency scanning enabled: `{Dependabot | Snyk | npm audit}`

---

## 6. Project Scaffold & Dependencies

Source: `ARCHITECTURE.md`, grooming tech-stack decisions.

- [ ] Project scaffolded with `{framework/CLI}` matching ARCHITECTURE.md layout
- [ ] Core deps installed (from the approved stack only — RULES R054)
- [ ] Lint + formatter config committed: `{eslint}`, `{prettier}`
- [ ] Type-check config committed: `{tsconfig}`
- [ ] Test runner config committed with `coverageThreshold` = {coverage_threshold}%
- [ ] `README.md` with setup/run/test commands
- [ ] `AGENTS.md` present at repo root (points at `.genesis/docs/…`)

---

## 7. Other (per grooming output)

> Add any additional prep the grooming surfaced that isn't above — e.g. feature-flag
> provider, error tracking (Sentry), observability agent, container registry,
> preview-env provider, design-token sync. Each row ties back to a grooming decision.

| Item | Source decision | Set | Notes |
|------|-----------------|-----|-------|
| {item} | {doc §} | ☐ | |

---

## Done When

- [ ] Every section above is ☐→✅ or has a tracked exception
- [ ] A trivial PR goes green end-to-end: commit (husky passes) → push → CI → Sonar gate → mergeable
- [ ] No P0 setup blocker open

→ On completion, proceed to `WORKFLOW.md` Phase 0 (TRIGGER) for the first task from `06-TASK-ORDER.md` (Run Next).
