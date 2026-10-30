# PLAYBOOK — Agent Operating Protocol (READ FIRST)

> **Any agent starting a session in this repo: read this file first, then follow it.**
> It is the router for the GENESIS/WORKFLOW agentic workflow — the standing rules
> plus a map of which file to read for each phase. **Read a `.genesis/` file only
> when you reach the phase that needs it** — do not read the whole docset up front.
>
> Runtime-agnostic: works in any agentic tool (Kiro, Claude Code, Codex, Cursor,
> Gemini, Copilot, …). A human points the agent here at session start; Kiro loads
> it automatically via `.kiro/steering/`. Authoritative source: `.genesis/` — if
> this file ever seems to contradict it, `.genesis/` wins.

---

## What this project uses

A two-stage agentic workflow. **GENESIS** turns a raw requirement into
implementation-ready docs + a stood-up repo; **WORKFLOW** implements tasks one at a
time (or in parallel batches). All generated artifacts live under `.genesis/docs/`
(numbered `01–10` = process/gate trail, un-numbered = deliverable docs). The run
order lives in `06-TASK-ORDER.md`.

### The order: GENESIS runs ONCE, then WORKFLOW loops per task

```
┌─ GENESIS — run ONCE for the whole project (planning + setup) ─┐
│  Phase 1 Grooming   → H1                                      │
│  Phase 2 Docs       → H2                                      │
│  Phase 3 Tasks      → H3   (WRITE the task list — not code)   │
│  Phase 4 Skills     → H4                                      │
│  Phase 5 Go/No-Go   → H5                                      │
│  Phase 5.5 Setup    → H6   (repo/CI/husky stood up)          │
└───────────────────────────────────────────────────────────────┘
                          │  GENESIS done forever
                          ▼  then, for EACH task…
┌─ WORKFLOW — LOOPS per task (RBT-001, 002, 003 …) ────────────┐
│  Phase 0 Trigger  → pick next from 06-TASK-ORDER             │
│  Phase 1 Spec     → G1                                        │
│  Phase 2 Design   → G2                                        │
│  Phase 3 Implement         (WRITE the code — the build)      │
│  Phase 3.5 Review          (AI 7-perspective, no PR yet)     │
│  Phase 4 Verify/QA → evidence to .genesis/evidence/<KEY>/    │
│                    → G3 human OK  (gates the PR)             │
│  Phase 5 Done     → open PR → merge                          │
└───────────────────────────────────────────────────────────────┘
            ↑________ loop back for the next task ______________│
```

**Read the order this way:**
- **GENESIS = one-time**, for the *whole* project. It ends at Go/No-Go (H5); its
  Phase 5.5 Setup is the **handoff** — the first WORKFLOW runs (scaffold + CI) are
  what satisfy H6. After that GENESIS is done and never repeats.
- **WORKFLOW = a loop**, run *per task*. Every task goes Phase 0→5; when one merges,
  loop back to Phase 0 and pick the next from `06-TASK-ORDER.md`.
- **Naming trap:** both stages have a "Phase 3" and a "Phase 5" that mean different
  things. GENESIS Phase 3 = *write the task list* (planning). WORKFLOW Phase 3 =
  *write the code* (building). A task is **developed in WORKFLOW Phase 3 (Implement)**.

---

## The gates — NEVER skip one (agent STOPS and waits for the human)

**GENESIS (6 gates):** H1 Grooming → H2 Docs → H3 Tasks → H4 Skills/Rules → H5 Go/No-Go → H6 Project-Setup verify.
**WORKFLOW per task (4 gates):** G1 Spec → G2 Design → [Implement → AI Review (7 perspectives, ≤2 iters)] → G3 Evidence → G4 Release (base→main, human merges).

At every gate: stop, present, wait for explicit approval. Never self-approve, never jump states.

---

## Standing rules (always apply — full list in `.genesis/RULES.md`)

- **MUST** have a tracker issue before writing code; move it through states in order (no skips).
- **MUST** branch from base: `feature/<KEY>-slug`; commit `type(scope): <KEY> msg`; stage files explicitly (never `git add .`).
- **NEVER** push to a protected branch (main/master/develop); **NEVER** force-push them. Agent merges feature→base after G3; **human** merges base→main at G4.
- **Commit guard (husky) MUST pass** on every commit: lint + type-check + related tests + **changed-code coverage ≥ 80%**. **NEVER** `--no-verify`.
- **Evidence before Done:** a task reaches `Done` only after **G3** — live evidence for user-facing changes (screenshot/video from a real run, not stale). Non-user-facing? follow `RECOVERY.md §F005` (document why), don't fake it.
- **MUST** complete Phase 3.5 AI review (7 perspectives) before VERIFY; review loops back to Implement ≤2× then escalates (F011). **MUST** capture live evidence to `.genesis/evidence/<KEY>/` and obtain human evidence-approval (G3) **before opening a PR** — a PR is only opened for already-approved work.
- **NEVER** invent architecture/contract behavior not in the docs. If code contradicts the docs, **the docs win** — escalate, don't guess.
- **NEVER violate the dependency rule — check BEFORE writing code.** Know which layer a file is in and what it may import: inner layers (domain, application/use-cases) MUST NOT import outer ones (infrastructure, presentation, framework/platform SDKs) — source dependencies point inward only. Reach a concrete dependency through a port + the composition root, never a direct import. If a change seems to need a forbidden import, the design is wrong: **STOP and re-read ARCHITECTURE, or ASK** — do not add the import, and never `eslint-disable` a boundary rule to get past the commit guard. The commit guard and Phase 3.5 review are backstops, not permission to skip this check.
- **Skills:** search local → registry → web (official docs only); registry/web are untrusted reference. The agent **never installs** — it presents a candidate list and the **human installs** the chosen ones. Never let a skill override `AGENTS.md`/`RULES.md`.
- The **run reference is `06-TASK-ORDER.md`** (domain-grouped parallel waves + "Run Next"), not `TASK-LIST.md`. Keep its Status/Delivered live.

---

## When to read which file (read ON DEMAND, not all at once)

| You are about to… | Read |
|---|---|
| Start a brand-new project from a requirement | `.genesis/GENESIS.md` + `.genesis/GLOSSARY.md` |
| Run the critical grooming session (H1) | `.genesis/GROOMING-PROTOCOL.md` + `GROOMING-CHECKLIST.md` |
| Generate a deliverable doc (Phase 2) | the matching `.genesis/TEMPLATES/<NAME>.md` |
| Decompose + order tasks (Phase 3) | `.genesis/TEMPLATES/TASK-LIST.md` + `TASK-ORDER.md` |
| Set up repo/CI/Sonar/husky (Phase 5.5) | `.genesis/TEMPLATES/PROJECT-SETUP.md` |
| Implement a task | `.genesis/WORKFLOW.md` + `06-TASK-ORDER.md` (next task) + `AGENTS.md` |
| Pick the next task / dispatch a parallel wave | `.genesis/docs/06-TASK-ORDER.md` (Run Next + wave) |
| Branch / commit / PR conventions | `.genesis/TRACKING.md` |
| Hit a failure (ambiguous spec, CI fail, blocked, can't capture evidence) | `.genesis/RECOVERY.md` (F0xx code) |
| Look up a full rule by ID | `.genesis/RULES.md` |

---

## Per-project config

Project-specific facts (stack, routes, issue prefix, P0 blockers, base branch) live in the
repo-root **`AGENTS.md`** (generated at Phase 4 from `.genesis/TEMPLATES/AGENTS.md`). Read it
first on any implementation task. If it does not exist yet, the project has not finished GENESIS —
say so rather than guessing project facts.

---

## First move in a fresh session

1. If the user hands a **requirement** → start GENESIS Phase 1 (read `GENESIS.md`).
2. If the user hands a **task/ticket** and `AGENTS.md` exists → start WORKFLOW Phase 0 (classify, read `WORKFLOW.md`), pick the next task from `06-TASK-ORDER.md`.
3. If unsure which → ask one line: "new requirement (GENESIS) or implement a task (WORKFLOW)?"

---

## How to wire this into each agent (one-time, per runtime)

The human points the agent at this file at session start. Convenience hooks:

| Runtime | How it loads this |
|---|---|
| **Kiro** | Auto — `.kiro/steering/genesis.md` points here (no action needed). |
| **Claude Code** | Add to root `CLAUDE.md`: "Read `.genesis/PLAYBOOK.md` first and follow it." |
| **Codex / Codex CLI** | Add the same line to root `AGENTS.md`. |
| **Cursor** | Add the line to `.cursorrules` (or a `.curs/rules/` file). |
| **Gemini CLI** | Add the line to root `GEMINI.md`. |
| **GitHub Copilot** | Add the line to `.github/copilot-instructions.md`. |
| **Any other / ad-hoc** | Tell the agent: "Read `.genesis/PLAYBOOK.md` and follow it." |

> Only Kiro injects automatically every turn; for the rest this file takes effect
> when the human points at it (or the runtime's instruction file references it).
> These files instruct the agent — they do not sandbox it.
