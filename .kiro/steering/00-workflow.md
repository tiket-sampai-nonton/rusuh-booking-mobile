---
inclusion: always
---

# READ FIRST — Per-ticket workflow is MANDATORY

> This is a **thin pointer**, not a copy. The canonical workflow lives in the files
> linked below; read them before acting. Keeping one source of truth avoids drift.

## The one rule that gates everything

**Every task MUST run the full per-ticket workflow — no exceptions, no shortcuts, not even for "obvious" scaffolding or parallel-batch work.**

Sequence (evidence-first, v2):

```
Phase 0  TRIGGER   classify the task
Phase 1  SPEC      → G1 (human approves the spec)
Phase 2  DESIGN    → G2 (human approves the design)
Phase 3  IMPLEMENT write code to the ACs
Phase 3.5 REVIEW   self / independent review (7 perspectives)
Phase 4  VERIFY/QA run gates, capture evidence to .genesis/evidence/<KEY>/
         → G3      (human approves the EVIDENCE — this gates the PR)
Phase 5  PR+MERGE  open PR into develop → merge → Done
```

A PR is **only ever opened for work the human has already approved at G3.**

## Board states (walk the GitHub issue through ALL of them)

```
Backlog → To Do → In progress → QA → In review → Done
```

Never let an issue jump from open to closed with no trail. Each transition gets a
comment citing the evidence path.

## NEVER

- **NEVER** collapse G1/G2 into a dispatch brief because the ACs "seem obvious".
- **NEVER** skip board-state tracking on a parallel-batch or subagent task.
- **NEVER** open a PR before G3 evidence approval.
- **NEVER** merge work whose `.genesis/evidence/<KEY>/` directory is missing or empty.
- **NEVER** `git commit --no-verify` to bypass the husky gate.

## Canonical sources (read these — do not paraphrase from memory)

| What | Path |
|------|------|
| Repo manifest (read first) | `AGENTS.md` |
| The pipeline (phases + gates) | `.genesis/workflow/WORKFLOW.md` |
| State machine + board states | `.genesis/workflow/TRACKING.md` |
| Full rule reference (R-IDs) | `.genesis/workflow/RULES.md` |
| Project-specific rules | `.genesis/docs/08-RULES.md` |
| Grooming decisions (gates all) | `.genesis/docs/03-GROOMING-DECISIONS.md` |

**If code contradicts these docs, the docs win. Escalate, do not invent.**

## Enforcement layers (so this rule is mechanical, not just remembered)

1. **This steering file** — every agent session auto-loads it (awareness).
2. **Husky commit guard** (RBT-005a, live) — local hard stop on lint/boundary/type/coverage + Conventional + RBT key.
3. **CI + branch protection** (RBT-005b) — the un-bypassable team gate: a PR to `develop`/`main` cannot merge unless gates are green, the branch key is valid, `.genesis/evidence/<KEY>/` exists, and a human approved.

Layers 1–2 reduce how often layer 3 has to reject. Layer 3 is the backstop that
makes the workflow unavoidable for the whole team — human or agent.
