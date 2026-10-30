# GLOSSARY.md — Term Definitions

> Precise definitions for terms used in this workflow.
> When a term appears in the workflow, it means exactly what's defined here.

---

## Workflow Terms

### GENESIS
The meta-workflow that transforms raw requirements into implementation-ready documentation. 5 phases + Phase 5.5 (Project Setup), 6 human gates (H1–H6). Produces all project documentation and a stood-up repo before implementation begins.

### Gate
A checkpoint where the agent stops and waits for human approval before proceeding. Gates are the human control points in the pipeline.

### Phase 5.5 (PROJECT SETUP)
The preparation phase between readiness approval (H5) and the first implementation task. The agent stands up the project from groomed decisions: repo + branch protection, CI pipeline, static analysis (Sonar), the husky commit guard, secrets/env, and the project scaffold. Verified at Gate H6 by a trivial PR going green end-to-end. Output: `10-PROJECT-SETUP.md`.

### Commit Guard (Husky)
A local `pre-commit` git hook (husky) that runs before every commit and must pass: lint + type-check + related tests + a **changed-code coverage gate (≥ 80% default)**. It keeps red/undertested code out of history and mirrors the CI gate. Bypassing it with `--no-verify` is forbidden (RULES R009). See TESTING-STRATEGY.md §Pre-Commit Coverage Gate.

### Execution Order / Task Order
The ordered run plan in `06-TASK-ORDER.md` — tasks grouped by domain and arranged into parallel-aware **execution waves** (each wave dependency-free and file-disjoint so it can run in parallel), with a "Run Next" pointer, critical path and shared-file register. This is the **main run reference**: WORKFLOW Phase 0 selects the next task from it, and its Status/Delivered columns are the live run state. `05-TASK-LIST.md` holds the full decomposition detail; the order file governs what runs next.

### Delivery Checklist
The section of `TASK-LIST.md` tracking what has actually shipped — each task's PR / merged / evidence-approved / Delivered state. A task is Delivered only when its issue reaches `Done`.

### Phase
A distinct stage of work in the pipeline. Each phase has defined inputs, actions, and outputs.

### Grooming
The structured conversation where agent asks questions and human provides decisions about the project. Unlike traditional grooming, the agent challenges decisions per GROOMING-PROTOCOL.md.

### Spec
A specification document that defines what to build for a single issue. Contains requirements, acceptance criteria, scope, and affected files.

### ADR
Architecture Decision Record. A short document capturing a significant decision, the context, options considered, and rationale for the choice.

### REVIEW (Phase 3.5)
A mandatory multi-perspective AI quality gate that runs after implementation but before VERIFY (and before any PR). It checks 7 perspectives: acceptance criteria, architecture, API contract conformance, edge cases, security, test coverage, and style. It is agent-executed with no human gate. If it passes, the task proceeds to Phase 4 VERIFY/QA (evidence capture) — the PR is opened later, only after human evidence-approval (G3). If it fails after 2 iterations, the issue moves to Blocked and escalates to human (see RECOVERY.md §F011). It is distinct from human review, which happens at Gate G3 (evidence approval).

---

## Imperative Terms

### MUST
Required. Always do this. No exceptions without explicit approval.

### NEVER
Forbidden. Never do this. No exceptions.

### ASK
Stop and get human approval before proceeding. Do not assume approval.

---

## Issue States

### Backlog
Issue is identified but not yet prioritized for work.

### To Do
Issue is prioritized and ready to be picked up. (Tasks enter To Do from GENESIS Phase 3 decomposition, or when added ad-hoc. The per-task spec and its approval — Gate G1 — happen in WORKFLOW Phase 1 and gate the move **To Do → In Progress**, not entry into To Do.)

### In Progress
Issue is actively being worked on. Branch exists, coding happening, includes Phase 3.5 REVIEW before PR opens.

### In Review
PR is open, awaiting code review and CI checks.

### QA
REVIEW passed, gates green, and live evidence captured to `.genesis/evidence/<KEY>/`; awaiting human approval (Gate G3). **No PR yet** — G3 approval is what opens the PR.

### Done
Issue is complete. Code merged, evidence approved, issue closed.

### Blocked
Issue cannot progress due to an unresolved dependency.

---

## Task Types

### Story
A user-facing feature or capability. Delivers value to end users.

### Bug
A defect in existing functionality. Something that worked (or should work) is broken.

### Spike
A time-boxed research task. Produces findings and recommendations, not code.

### Chore
Maintenance work that doesn't directly deliver user value but is necessary. Refactoring, upgrades, tech debt.

---

## Execution Modes

### Single-Ticket Mode
One agent works on one issue through all phases. Standard mode for most work.

### Parallel-Batch Mode
A conductor dispatches multiple workers, each handling one issue with non-overlapping files. Workers report back; conductor verifies and consolidates.

### Spike Mode
Research-only mode. No code, no PR. Time-boxed investigation producing findings and recommendations.

---

## Architecture Terms

### Domain Layer
Pure business logic with no external dependencies. No framework imports, no HTTP, no database calls. Just rules and calculations.

### Adapter
Code that connects the domain to external systems. HTTP clients, database repositories, file handlers.

### Use Case
A single unit of business logic that orchestrates domain operations. Called by UI, invokes domain and adapters.

### Feature
A cohesive set of UI + logic that delivers a user-facing capability. Contains screens, components, hooks, and connects to use cases.

---

## Skill Terms

### Skill
A reusable procedure document (SKILL.md) that provides specialized knowledge for a specific domain or technology.

### Local Skill
A skill installed in the project or user's skill directory. Found via `skill_search`.

### Registry Skill
A skill in the public skills.sh registry. Found via `skill_discover`, fetched via `skill_fetch`.

### Skill Discovery
The process of identifying unknown domains in a task and searching for skills to fill knowledge gaps.

---

## Quality Terms

### CI
Continuous Integration. Automated pipeline that runs on every push: build, lint, test, security scan.

### CD
Continuous Deployment/Delivery. Automated pipeline that deploys code to environments after CI passes.

### Evidence
Proof that the implementation works as specified. Screenshots, videos, test results from live runs.

### Coverage
The percentage of code exercised by automated tests. Usually expressed as line coverage, branch coverage, or function coverage.

---

## Failure Terms

### Blocker
Something that prevents work from proceeding. Must be resolved before implementation can continue.

### P0
Priority zero. Critical blocker that must be resolved immediately. Nothing can proceed with an open P0.

### P1
Priority one. Important issue that must be resolved soon, but work can proceed with awareness.

### Escalation
Handing a problem to a human or higher authority when agent cannot resolve it. Includes context about what was tried.

---

## Git Terms

### Base Branch
The branch that feature branches are created from and merged back into. Often `develop` or `main`.

### Feature Branch
A branch created for a specific issue. Named `feature/<KEY>-slug`.

### PR (Pull Request)
A request to merge a feature branch into the base branch. Includes code changes, description, and linked issue.

### CI Green
All automated checks in the CI pipeline have passed. Required before merge.

---

## Documentation Terms

### Source of Truth
The authoritative document for a given topic. When code contradicts the source of truth, the document wins. Escalate rather than inventing.

### AGENTS.md
The project manifest that defines project-specific rules, architecture, stack, and documentation references.

### RULES.md
The rule reference with MUST/NEVER/ASK imperatives. Generic rules in workflow, project-specific rules in AGENTS.md.

---

## Grooming Terms

### Critical Advisor
The agent's role during grooming. Not a passive note-taker but an active challenger of decisions.

### Challenge
When the agent questions a human decision, presents risks, and suggests alternatives.

### Contradiction
When two answers from the human conflict with each other. Must be resolved before proceeding.

### Section
One of the 10 topic areas in the grooming checklist: Business, Architecture, Design Patterns, Tech Stack, Infrastructure, CI/CD, Security, Observability, Quality, Operations.

---

## Time Terms

### Time Box
A fixed duration allocated for a task. Spike tasks are always time-boxed.

### Max Time
The maximum duration for a phase before escalation is required. Exceeding max time triggers F008.

### Typical Time
The expected duration for most tasks. Used for planning, not enforcement.
