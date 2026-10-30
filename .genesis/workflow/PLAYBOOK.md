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
- **MUST** complete Phase 3.5 AI review (7 perspectives) before opening a PR; review loops back to Implement ≤2× then escalates (F011).
- **NEVER** invent architecture/contract behavior not in the docs. If code contradicts the docs, **the docs win** — escalate, don't guess.
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
