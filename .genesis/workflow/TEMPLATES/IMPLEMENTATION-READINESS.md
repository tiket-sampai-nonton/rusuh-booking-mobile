# IMPLEMENTATION-READINESS.md — Readiness Checklist

> Generated from GENESIS Phase 5.
> Fill `{...}` placeholders with actual project values.
> All items should be ✅ before starting implementation.

---

## Overall Status

**Project:** {project name}
**Date:** {date}
**Status:** {READY | NOT READY}

```
Documentation:  {✅ | ⚠️ | ❌}
Tasks:          {✅ | ⚠️ | ❌}
Skills:         {✅ | ⚠️ | ❌}
Blockers:       {✅ | ⚠️ | ❌}
Infrastructure: {✅ | ⚠️ | ❌}

Overall:        {GO | NO-GO}
```

---

## 1. Documentation Checklist

### Core Documents

| Document | Status | Verified By | Date |
|----------|--------|-------------|------|
| ARCHITECTURE.md | {✅/❌} | {name} | {date} |
| API-CONTRACT.md | {✅/❌} | {name} | {date} |
| FLOW-DIAGRAMS.md | {✅/❌} | {name} | {date} |
| SEQUENCE-DIAGRAMS.md | {✅/❌} | {name} | {date} |
| DESIGN-SYSTEM.md | {✅/❌} | {name} | {date} |
| EDGE-CASES.md | {✅/❌} | {name} | {date} |

### Infrastructure & Operations

| Document | Status | Verified By | Date |
|----------|--------|-------------|------|
| INFRASTRUCTURE.md | {✅/❌} | {name} | {date} |
| CI-CD.md | {✅/❌} | {name} | {date} |
| SECURITY.md | {✅/❌} | {name} | {date} |
| OBSERVABILITY.md | {✅/❌} | {name} | {date} |
| TESTING-STRATEGY.md | {✅/❌} | {name} | {date} |

### Project Configuration

| Document | Status | Verified By | Date |
|----------|--------|-------------|------|
| AGENTS.md | {✅/❌} | {name} | {date} |
| RULES.md | {✅/❌} | {name} | {date} |
| TASK-LIST.md | {✅/❌} | {name} | {date} |
| TASK-ORDER.md (run plan) | {✅/❌} | {name} | {date} |

**Documentation Status:** {All verified | {n} pending}

---

## 2. Task Readiness

### Task Breakdown

| Metric | Value |
|--------|-------|
| Total Epics | {n} |
| Total Stories | {n} |
| Stories with specs | {n}/{n} |
| Stories with estimates | {n}/{n} |
| Dependencies mapped | {yes/no} |
| Critical path identified | {yes/no} |

### Milestone Readiness

| Milestone | Target Date | Stories Ready | Status |
|-----------|-------------|---------------|--------|
| {Milestone 1} | {date} | {n}/{n} | {✅/⚠️} |
| {Milestone 2} | {date} | {n}/{n} | {✅/⚠️} |

**Task Status:** {All ready | {n} stories need work}

---

## 3. Skills Readiness

### Required Skills

| Domain | Skill | Source | Status |
|--------|-------|--------|--------|
| {domain} | {skill} | {local/registry} | {✅/❌} |
| {domain} | {skill} | {local/registry} | {✅/❌} |
| {domain} | {skill} | {local/registry} | {✅/❌} |

### Skill Conflicts

| Skill | Conflict | Resolution |
|-------|----------|------------|
| {skill} | {conflict with project rule} | {how resolved} |

**Skills Status:** {All identified | {n} missing}

---

## 4. Blockers

### P0 Blockers (Must resolve before any work)

| ID | Description | Owner | Status | ETA |
|----|-------------|-------|--------|-----|
| P0-01 | {description} | {owner} | {Open/Resolved} | {date} |
| P0-02 | {description} | {owner} | {Open/Resolved} | {date} |

### P1 Blockers (Must resolve before affected features)

| ID | Blocks | Description | Owner | Status |
|----|--------|-------------|-------|--------|
| P1-01 | {features} | {description} | {owner} | {Open/Resolved} |
| P1-02 | {features} | {description} | {owner} | {Open/Resolved} |

### External Dependencies

| Dependency | Provider | Status | Fallback |
|------------|----------|--------|----------|
| {API/service} | {who} | {Available/Pending} | {if any} |

**Blocker Status:** {No P0 open | {n} P0 blockers}

---

## 5. Infrastructure Readiness

### Repository

| Item | Status | Details |
|------|--------|---------|
| Repo created | {✅/❌} | {url} |
| Branch protection | {✅/❌} | {rules} |
| CODEOWNERS set | {✅/❌} | |
| README exists | {✅/❌} | |

### CI/CD

| Item | Status | Details |
|------|--------|---------|
| CI pipeline configured | {✅/❌} | {tool} |
| CD pipeline configured | {✅/❌} | {tool} |
| Required checks set | {✅/❌} | {checks} |
| Husky commit guard installed | {✅/❌} | pre-commit: lint + typecheck + tests + coverage ≥ {80}% |
| Static analysis (Sonar) configured | {✅/❌} | project key {key}, quality gate new_coverage ≥ {80}% |

### Environments

| Environment | Status | URL |
|-------------|--------|-----|
| Development | {✅/❌} | {url} |
| Staging | {✅/❌} | {url} |
| Production | {✅/Planned} | {url} |

### Secrets

| Secret | Configured | Rotation Set |
|--------|------------|--------------|
| {secret} | {✅/❌} | {✅/❌} |
| {secret} | {✅/❌} | {✅/❌} |

### External Services

| Service | Account Created | API Keys | Integration Tested |
|---------|-----------------|----------|-------------------|
| {service} | {✅/❌} | {✅/❌} | {✅/❌} |

**Infrastructure Status:** {Ready | {n} items pending}

---

## 6. Team Readiness

### Team

| Role | Person | Availability |
|------|--------|--------------|
| {role} | {name} | {available from} |
| {role} | {name} | {available from} |

### Onboarding

| Item | Status |
|------|--------|
| Repo access granted | {✅/❌} |
| Environment access granted | {✅/❌} |
| Documentation reviewed | {✅/❌} |

---

## 7. Go/No-Go Checklist

### Must Have (blocking)

- [ ] All P0 blockers resolved
- [ ] Core documentation verified (ARCHITECTURE, API, FLOW)
- [ ] Task list complete with estimates
- [ ] CI pipeline working
- [ ] Development environment working

### Should Have (important)

- [ ] All documentation verified
- [ ] Skills identified for all tasks
- [ ] Staging environment ready
- [ ] Security checklist reviewed
- [ ] On-call rotation set

### Nice to Have

- [ ] All environments provisioned
- [ ] Performance baseline established
- [ ] Full test coverage plan

---

## 8. Decision

### Recommendation

**Status:** {GO | NO-GO | CONDITIONAL GO}

**Rationale:**
{Explanation of the recommendation}

### If NO-GO

**Blocking Issues:**
1. {issue 1}
2. {issue 2}

**Required Actions:**
1. {action 1} — Owner: {name}, ETA: {date}
2. {action 2} — Owner: {name}, ETA: {date}

**Re-evaluation Date:** {date}

### If CONDITIONAL GO

**Can Start:**
- {what can begin}

**Must Resolve Before:**
- {what must be resolved and by when}

---

## Approval

| Role | Name | Decision | Date |
|------|------|----------|------|
| Product Owner | {name} | {GO/NO-GO} | {date} |
| Tech Lead | {name} | {GO/NO-GO} | {date} |
| {other} | {name} | {GO/NO-GO} | {date} |

---

## Next Steps

If GO:

1. [ ] Communicate GO decision to team
2. [ ] Create first sprint/iteration
3. [ ] Assign first batch of stories
4. [ ] Begin implementation using WORKFLOW.md
5. [ ] Schedule first check-in

If NO-GO:

1. [ ] Communicate blockers to stakeholders
2. [ ] Work on blocking issues
3. [ ] Schedule re-evaluation
