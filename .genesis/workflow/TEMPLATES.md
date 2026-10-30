# TEMPLATES.md — Task Dispatch Templates

> Copy-paste templates for dispatching agents.
> Fill `{...}` placeholders with actual values.

**Note:** These are **task dispatch templates** (copy-paste prompts for dispatching agents).
For **document templates** (ARCHITECTURE.md, SECURITY.md, TASK-LIST.md, etc.),
see the `TEMPLATES/` directory — those are used throughout GENESIS Phases 2-5.

---

## 0. Grooming Decisions Template

Use this to capture the output of Gate H1 (Grooming Session). This document becomes the input for Phase 2 (Documentation Generation).

```markdown
# Grooming Decisions: {project name}

**Date:** {date}
**Participants:** {names}
**Duration:** {X hours}

---

## 1. BUSINESS

### 1.1 Who are the users?
**Answer:** {human's answer}
**Agent Challenge:** {if agent challenged, what was said}
**Final Decision:** {resolved answer}
**Rationale:** {why this decision}

### 1.2 What is the core problem being solved?
**Answer:** {human's answer}
**Agent Challenge:** {if any}
**Final Decision:** {resolved answer}
**Rationale:** {why}

{... repeat for each question in GROOMING-CHECKLIST.md ...}

---

## 2. ARCHITECTURE

### 2.1 Monolith vs microservices?
**Answer:** {human's answer}
**Agent Challenge:** {if any}
**Final Decision:** {resolved answer}
**Rationale:** {why}

{... continue for all 10 sections ...}

---

## Summary of Key Decisions

| Section | Key Decision | Rationale |
|---------|--------------|-----------|
| Business | {decision} | {why} |
| Architecture | {decision} | {why} |
| Design Patterns | {decision} | {why} |
| Tech Stack | {decision} | {why} |
| Infrastructure | {decision} | {why} |
| CI/CD | {decision} | {why} |
| Security | {decision} | {why} |
| Observability | {decision} | {why} |
| Quality | {decision} | {why} |
| Operations | {decision} | {why} |

---

## Unresolved Items

| Item | Section | Status | Owner |
|------|---------|--------|-------|
| {item} | {section} | {open/deferred} | {who} |

---

## Contradictions Flagged & Resolved

| Contradiction | Resolution | Accepted Risk |
|---------------|------------|---------------|
| {statement A vs statement B} | {how resolved} | {if any} |

---

## Ready for Phase 2?

- [ ] All 10 sections addressed
- [ ] All critical decisions have rationale
- [ ] No unresolved contradictions
- [ ] Blockers identified (if any)

**Status:** {READY | NOT READY — reason}
```

---

## 1. Spec Template

```markdown
# Spec: {feature name} ({KEY})

## Source of Truth
- GENESIS docs: `.genesis/docs/`
- Architecture: `.genesis/docs/ARCHITECTURE.md` — {relevant section}
- API Contract: `.genesis/docs/API-CONTRACT.md` — {relevant endpoint}
- Flow: `.genesis/docs/FLOW-DIAGRAMS.md` — {relevant flow}

## Blockers
- [ ] No blockers in IMPLEMENTATION-READINESS.md for this feature

## Requirements
- {Requirement 1 — from GENESIS docs, not invented}
- {Requirement 2}

## Acceptance Criteria
- [ ] AC1: {observable, testable}
- [ ] AC2: {observable, testable}

## Scope
- In: {what is included}
- Out: {what is NOT included}

## Affected Files
- `{path/to/file1.ts}`
- `{path/to/file2.ts}`

## Skills Required
- {skill name} — for {domain}

## Test Plan
- Unit: {what to test}
- E2E: {scenario description}

## Open Questions
- {Question — escalate to {owner} if blocking}
```

---

## 2. Story Task (single ticket)

```
Implement {KEY}: {description}

Spec: {link or "attached below"}

Pre-work:
1. Confirm spec is approved (if not, STOP)
2. Check IMPLEMENTATION-READINESS.md for blockers
3. Identify unknown domains in task
4. Load skills if needed (SKILLS-PROTOCOL.md)
5. Log skills loaded

Implementation:
6. Transition issue → In Progress
7. Create branch: feature/{KEY}-{slug}
8. Implement against spec — affected files ONLY
9. Write tests with real assertions
10. Commit: type(scope): {KEY} description
11. Run: type-check + lint + tests
12. Push branch (do NOT open PR yet)

Review (Phase 3.5):
13. Run AI review (7 perspectives):
    - Acceptance criteria satisfied?
    - Architecture boundaries respected?
    - API contracts followed?
    - Edge cases from EDGE-CASES.md handled?
    - Security (no secrets, input validation)?
    - Test coverage adequate?
    - Style matches RULES.md?
14. If review finds issues: fix and re-review (max 2 iterations)
15. If review PASS after ≤2 iterations: continue
16. If review FAIL after 2 iterations: escalate to human, STOP

PR (only after review PASS):
17. Open PR into base branch: [{KEY}] description
18. Wait for CI green
19. Run security checklist (if applicable)
20. Capture live evidence (if user-facing)
21. Report PR URL and STOP — await G3 approval

Do NOT merge before G3 approval. After G3, use Post-G3 Merge template.
If spec is unclear, STOP and escalate.
If skill conflicts with project rules, adapt or escalate.
```

---

## 3. Bug Task

```
Fix {KEY}: {bug title}

Repro:
1. {Step 1}
2. {Step 2}

Expected: {expected behavior}
Actual: {actual behavior}

1. Reproduce the bug (confirm it exists)
2. Identify root cause
3. Check if related skill exists
4. Transition issue → In Progress
5. Create branch: fix/{KEY}-{slug}
6. Write a test that FAILS before the fix
7. Fix the code
8. Confirm test PASSES after fix
9. Run full test suite for affected area
10. Push branch (do NOT open PR yet)

Review (Phase 3.5):
11. Run AI review (7 perspectives):
    - Does fix address root cause, not just symptom?
    - Could fix cause regressions elsewhere?
    - Are edge cases around the bug handled?
    - Is the fix consistent with architecture?
    - API contract conformance? (could fix accidentally alter response shape?)
    - Is the test sufficient to prevent recurrence?
    - Style matches RULES.md?
12. If review finds issues: fix and re-review (max 2 iterations)
13. If review PASS: continue
14. If review FAIL after 2 iterations: escalate to human, STOP

PR (only after review PASS):
15. Open PR
16. Wait for CI green
17. Capture evidence showing the fix
18. Report PR URL and STOP — await G3 approval

Do NOT merge before G3 approval. After G3, use Post-G3 Merge template.
```

---

## 4. Spike Task

```
Spike {KEY}: {research question}

Time box: {X hours}

Context:
- Why we need this research
- What decision it will inform

Deliverables:
1. Summary of findings
2. Recommendation (Option A vs B vs C with rationale)
3. ADR note if a decision is made
4. Follow-up tasks identified (if any)
5. Skills discovered (if any new skills needed)

Do NOT write production code.
Do NOT open PR.
Report findings and STOP.
```

---

## 5. Worker Brief (for parallel batch)

```
You are a worker for issue {KEY}.

Issue: {KEY}
Spec: {link or inline}

Files you may change:
- {file1}
- {file2}

Skills loaded by conductor (apply these, do not re-search):
- {skill_name}: {key patterns to apply}

Acceptance:
- [ ] {AC1}
- [ ] {AC2}

1. Transition → In Progress
2. Branch: feature/{KEY}-{slug}
3. Implement + tests (listed files ONLY)
4. Apply skill patterns where relevant
5. Commit with issue key
6. Push branch (do NOT open PR yet)

Review (Phase 3.5):
7. Run AI review (7 perspectives: AC, architecture, contract, edge cases, security, tests, style)
8. If issues found: fix and re-review (max 2 iterations)
9. If PASS: continue. If FAIL after 2: escalate, STOP.

PR (only after review PASS):
10. Open PR: [{KEY}] {title}
11. Wait for CI
12. Capture evidence
13. Report PR URL and STOP

Do NOT merge before G3 approval.
Do NOT touch files outside the list.
Do NOT re-search for skills already loaded above.
If you need additional skills, follow SKILLS-PROTOCOL.md.
If unclear, STOP and escalate.
```

---

## 6. CI Fix Loop

```
Fix CI for {KEY}.

PR: {PR URL}
Failing gate: {name}
Error: {message}

1. Read the failure carefully
2. If error is unfamiliar:
   - skill_search(query="{error type} {technology}")
   - If not found: skill_discover(query="{error}")
   - Apply fix pattern from skill
3. Fix the code
4. Commit: fix(scope): {KEY} fix {gate}
5. Push
6. Wait for CI
7. Loop (max 3 iterations)
8. If green → report success
9. If still failing after 3 → escalate to human

Do NOT merge.
Max 2 skill searches per topic (see R075).
```

---

## 7. Parallel Batch Dispatch

```
Work in parallel:
- {KEY1}: {description1}
- {KEY2}: {description2}
- {KEY3}: {description3}

Pre-checks:
1. All specs are approved
2. File sets are disjoint (no overlap)
3. No dependencies between issues
4. Host resources adequate (resource_status)

Skill discovery:
5. Identify all domains across tasks
6. Load skills once (don't repeat per worker)
7. Include skill context in each worker brief

Dispatch one worker per issue using Worker Brief template.
Each worker reports PR URL and STOPs.
After all complete, verify CIs + evidence, then report consolidated status.

Do NOT merge PRs until G3 approval for each.
After G3 approval, use Post-G3 Merge template for each.
```

---

## 7a. Post-G3 Merge (Phase 5)

```
Merge approved PR for {KEY}.

G3 approval received: {date/confirmation}
PR: {PR URL}

1. Confirm G3 was approved (do not proceed without approval)
2. Merge PR to base branch
3. Transition issue → Done
4. Update any affected docs (if needed)
5. Report: "{KEY} merged and Done"

This is Phase 5 execution. Only run after G3 approval.
```

---

## 8. GENESIS Kickoff

```
Start GENESIS for: {project name}

Raw requirement:
{paste requirement or link to document}

Follow GENESIS.md workflow:
1. Phase 1: Analyze the requirement
2. Gate H1: Conduct critical grooming (GROOMING-CHECKLIST.md)
3. Phase 2: Generate all documentation
4. Gate H2: Wait for doc verification
5. Phase 3: Decompose into tasks (TASK-LIST.md) + order into parallel waves (TASK-ORDER.md)
6. Gate H3: Wait for task verification
7. Phase 4: Discover skills, generate RULES.md + AGENTS.md
8. Gate H4: Wait for skill verification
9. Phase 5: Run readiness checklist
10. Gate H5: Wait for final approval (Go/No-Go)
11. Phase 5.5: Stand up the project (repo, CI, Sonar, husky, secrets)
12. Gate H6: Wait for setup verification (trivial PR green end-to-end)

Use GROOMING-PROTOCOL.md behavior — challenge decisions, don't just accept.

Output all docs to: `.genesis/docs/` (see GENESIS.md "Output Layout" — numbered 01-10 for the phase/gate trail, un-numbered for the deliverable set, AGENTS.md at the repo root).
```

---

## 9. Grooming Session

```
Conduct grooming for: {project name}

Requirement already analyzed. Proceed with GROOMING-CHECKLIST.md.

Behavior:
- Ask questions section by section
- Challenge weak or risky decisions
- Identify contradictions
- Suggest alternatives with reasoning
- Do NOT accept answers without evaluation
- Do NOT skip sections

Sections:
1. BUSINESS
2. ARCHITECTURE  
3. DESIGN PATTERNS
4. TECH STACK
5. INFRASTRUCTURE
6. CI/CD & DELIVERY
7. SECURITY
8. OBSERVABILITY
9. QUALITY
10. OPERATIONS

After all sections complete, summarize decisions and ask for confirmation to proceed.
```

---

## 10. Verification Checklist

```
Verification for {KEY}:

Issue tracking:
[ ] Issue exists and state is correct?
[ ] No blockers unresolved?

Code:
[ ] Branch from base, name has issue key?
[ ] All commits have issue key?
[ ] Type check passes?
[ ] Lint passes?
[ ] Tests pass for changed files?

Architecture:
[ ] Layer boundaries respected?
[ ] No prohibited imports?

Review (Phase 3.5):
[ ] AI review passed (all 7 perspectives)?
[ ] All required fixes from review resolved?
[ ] Review iterations: ≤2?

PR:
[ ] PR into base branch?
[ ] Title has issue key?
[ ] CI is green?

Evidence:
[ ] Evidence attached (if user-facing)?
[ ] Security checklist passed (if applicable)?

Security:
[ ] No secrets committed?
[ ] No sensitive data in logs?
```

---

## 11. Readiness Check

```
Run readiness check for: {project name}

Check each item in IMPLEMENTATION-READINESS.md:

Documentation:
[ ] ARCHITECTURE.md verified?
[ ] API-CONTRACT.md verified?
[ ] FLOW-DIAGRAMS.md verified?
[ ] SEQUENCE-DIAGRAMS.md verified?
[ ] EDGE-CASES.md verified?
[ ] INFRASTRUCTURE.md verified?
[ ] CI-CD.md verified?
[ ] SECURITY.md verified?
[ ] OBSERVABILITY.md verified?
[ ] TESTING-STRATEGY.md verified?

Tasks:
[ ] All epics defined?
[ ] All stories specified?
[ ] Dependencies mapped?
[ ] Critical path identified?

Skills & Rules:
[ ] Skills mapped to tasks?
[ ] RULES.md generated?
[ ] AGENTS.md generated?

Blockers:
[ ] No P0 blockers open?
[ ] P1 blockers have mitigation?

Report status and recommendation: GO or NO-GO with reasons.
```
