# TASK-ORDER.md — Ordered Execution Plan (MAIN RUN REFERENCE)

> Generated at **GENESIS Phase 3**, alongside `05-TASK-LIST.md`.
> `TASK-LIST.md` is the full decomposition (epics/stories/ACs); **this file is the
> run plan** — tasks grouped by domain and ordered into waves the agent executes.
>
> **This is the single source of truth for running the workflow.** WORKFLOW.md
> Phase 0 selects the next task from here, not from TASK-LIST. Keep the Status /
> Delivered columns here authoritative; TASK-LIST carries the detail.
>
> Fill `{...}` placeholders with real values.

---

## How to run this file

1. Work **wave by wave**, top to bottom. A wave starts only when the previous wave is `Done`.
2. Inside a wave, every task is **dependency-free of its wave-siblings and file-disjoint** — so they run in parallel (WORKFLOW §Parallel-Batch Mode: one worker per task, own git worktree). A single agent runs them sequentially in listed order.
3. A task is **eligible** only when every "Depends On" task is `Done`.
4. Update **Status** and **Delivered** here as work progresses — this file, not TASK-LIST, is the live run state.
5. Watch the **shared-file guard**: tasks touching a shared file (lockfile, route registry, barrel/index, migration, DI container) must NOT be in the same wave even if otherwise independent — serialize them.

**Legend:** Status = `Backlog | To Do | In Progress | In Review | QA | Done | Blocked`. Delivered ✅ = merged + CI green + G3 evidence approved.

---

## Run Next

> The one pointer the agent reads first.

**Current wave:** `Wave 1 — {domain}`
**Run next:** `{PREFIX}-001` (or dispatch the whole wave in parallel)

---

## Domains

> Group tasks by the part of the system they belong to. Domains make parallelism
> obvious: different domains rarely share files.

| Domain | Owner area / paths | Tasks |
|--------|--------------------|-------|
| {auth} | `{src/auth/**}` | {PREFIX}-001, {PREFIX}-004 |
| {payments} | `{src/payments/**}` | {PREFIX}-002, {PREFIX}-005 |
| {catalog} | `{src/catalog/**}` | {PREFIX}-003 |
| {platform/infra} | `{ci, config, shared}` | {PREFIX}-010 |

---

## Execution Waves

### Wave 1 — foundation (parallel)

> No dependencies; disjoint files; safe to run all at once.

| Task | Domain | Depends On | Files (disjoint) | Parallel | Status | Delivered |
|------|--------|-----------|------------------|----------|--------|-----------|
| {PREFIX}-001 | {auth} | — | `{src/auth/**}` | ✅ | To Do | ☐ |
| {PREFIX}-003 | {catalog} | — | `{src/catalog/**}` | ✅ | To Do | ☐ |
| {PREFIX}-010 | {platform} | — | `{config/**}` | ✅ | To Do | ☐ |

**Wave 1 gate:** all above `Done` → start Wave 2.

### Wave 2 — depends on Wave 1 (parallel where marked)

| Task | Domain | Depends On | Files (disjoint) | Parallel | Status | Delivered |
|------|--------|-----------|------------------|----------|--------|-----------|
| {PREFIX}-002 | {payments} | 001 | `{src/payments/**}` | ✅ | Blocked | ☐ |
| {PREFIX}-004 | {auth} | 001 | `{src/auth/session/**}` | ✅ | Blocked | ☐ |

**Wave 2 gate:** all above `Done` → start Wave 3.

### Wave 3 — integration (sequential)

> Shares files or integrates multiple domains → run one at a time.

| Task | Domain | Depends On | Shared file / reason | Parallel | Status | Delivered |
|------|--------|-----------|----------------------|----------|--------|-----------|
| {PREFIX}-005 | {payments} | 002 | route registry | ❌ serialize | Backlog | ☐ |
| {PREFIX}-006 | {cross} | 002, 004 | checkout flow spans domains | ❌ serialize | Backlog | ☐ |

---

## Critical Path

> The longest dependency chain — the floor on total duration.

```mermaid
flowchart LR
    T1["{PREFIX}-001"] --> T2["{PREFIX}-002"] --> T5["{PREFIX}-005"] --> MVP([MVP])
```

**Critical path length:** {n} tasks / ~{duration}.

---

## Parallelism Summary

| Wave | Tasks | Max parallel | Blocked by |
|------|-------|--------------|------------|
| 1 | {n} | {n} | — |
| 2 | {n} | {n} | Wave 1 |
| 3 | {n} | 1 (serialized) | Wave 2 |

> **Dispatch rule:** a conductor dispatches one wave as a parallel batch (one worker + one git worktree per task), waits for all to reach `Done` (each through its own G1–G3), then starts the next wave. Never dispatch across waves.

---

## Shared-File Register

> Files that force serialization even across domains. Any two tasks that both
> touch one of these cannot share a wave.

| Shared file | Touched by | Resolution |
|-------------|-----------|------------|
| `{package-lock / yarn.lock}` | {tasks} | serialize |
| `{routes registry}` | {tasks} | serialize |
| `{barrel/index export}` | {tasks} | serialize |
| `{db migration dir}` | {tasks} | serialize, ordered |

---

## Change Log

| Date | Change | By |
|------|--------|-----|
| {date} | Initial order generated at Phase 3 | {agent} |
| {date} | {re-ordered / wave split / status update} | {who} |
