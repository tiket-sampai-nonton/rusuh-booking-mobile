# METRICS.md — Workflow Observability

> What to track to know if the workflow is working.
> Metrics for GENESIS (project setup) and WORKFLOW (implementation).

---

## GENESIS Metrics

### Phase Duration

Track time spent in each GENESIS phase:

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| Phase 1 (Analysis) | < 1 hr | 1-2 hr | > 2 hr |
| Gate H1 (Grooming) | < 2 hr | 2-4 hr | > 4 hr |
| Phase 2 (Doc Gen) | < 2 hr | 2-4 hr | > 4 hr |
| Gate H2 (Doc Review) | < 1 hr | 1-2 hr | > 2 hr |
| Phase 3 (Task Decomp) | < 1 hr | 1-2 hr | > 2 hr |
| Gate H3 (Task Review) | < 30 min | 30-60 min | > 1 hr |
| Phase 4 (Skills) | < 1 hr | 1-2 hr | > 2 hr |
| Gate H4 (Skill Review) | < 30 min | 30-60 min | > 1 hr |
| Phase 5 (Readiness) | < 30 min | 30-60 min | > 1 hr |
| Gate H5 (Approval) | < 30 min | 30-60 min | > 1 hr |
| Phase 5.5 (Project Setup) | < 1 hr | 1-2 hr | > 2 hr |
| Gate H6 (Setup Verify) | < 30 min | 30-60 min | > 1 hr |
| **Total GENESIS** | < 8 hr | 8-12 hr | > 12 hr |

### Grooming Quality

| Metric | Target | Meaning |
|--------|--------|---------|
| Sections completed | 10/10 | All topics covered |
| Challenges raised | where warranted | Agent challenges weak/risky choices (quality, not count — do not manufacture pushback to hit a number) |
| Contradictions found | Tracked | Awareness of conflicts |
| Contradictions resolved | 100% | All conflicts addressed |

### Documentation Completeness

| Metric | Target | Meaning |
|--------|--------|---------|
| Docs generated | 11/11 | All templates filled |
| Docs verified | 11/11 | All docs human-approved |
| Revision rounds | < 2 | Quality on first pass |

---

## WORKFLOW Metrics

### Throughput

| Metric | Formula | Target |
|--------|---------|--------|
| Cycle time | Done date - Start date | < 2 days for S, < 5 days for M |
| Lead time | Done date - Created date | < 1 week for most issues |
| Throughput | Issues done / week | Trending up or stable |

### Quality

| Metric | Formula | Target |
|--------|---------|--------|
| First-pass review | Reviews passing on first attempt / Total reviews | > 80% |
| First-pass CI | PRs passing CI on first push / Total PRs | > 80% |
| Gate rejection rate | Gates rejected / Gates attempted | < 20% |
| Defect escape rate | Bugs found in prod / Total issues | < 5% |
| Rework rate | Issues reopened / Issues completed | < 10% |
| Review iteration avg | Total review iterations / Total reviews | < 1.3 |

### Phase Timing

| Phase | Target | Warning | Critical |
|-------|--------|---------|----------|
| Spec | < 30 min | 30-60 min | > 2 hr |
| Design | < 30 min | 30-60 min | > 2 hr |
| Implement | < 4 hr | 4-8 hr | > 1 day |
| Review | < 15 min | 15-30 min | > 30 min |
| Verify | < 30 min | 30-60 min | > 2 hr |
| Evidence | < 30 min | 30-60 min | > 1 hr |

### Failure Recovery

| Metric | Formula | Target |
|--------|---------|--------|
| CI fix attempts | Avg fixes per failing PR | < 2 |
| Blocker duration | Time in Blocked state | < 1 day |
| Escalation rate | Escalations / Total issues | < 15% |
| Escalation resolution | Time from escalation to resolution | < 4 hr |

---

## Skill Metrics

| Metric | Formula | Target |
|--------|---------|--------|
| Skill hit rate | Skills found / Skills searched | > 70% |
| Skill usefulness | Skills applied / Skills loaded | > 80% |
| Skill conflict rate | Skills conflicting with rules / Skills loaded | < 10% |

---

## Health Indicators

### Green (Healthy)
- GENESIS completes in < 8 hours
- Grooming covers all 10 sections
- No unresolved contradictions
- Review passes on first attempt > 80% of time
- CI passes on first push > 80% of time
- Gate rejection rate < 20%
- Blocker duration < 1 day

### Yellow (Warning)
- GENESIS takes 8-12 hours
- Grooming skips sections
- Contradictions take multiple rounds
- Review first-pass rate 60-80%
- CI first-pass rate 60-80%
- Gate rejection rate 20-40%
- Blocker duration 1-3 days

### Red (Critical)
- GENESIS takes > 12 hours
- Grooming incomplete
- Unresolved contradictions proceed
- Review first-pass rate < 60%
- CI first-pass rate < 60%
- Gate rejection rate > 40%
- Blocker duration > 3 days

---

## Tracking Template

Weekly tracking:

```markdown
## Week of {date}

### GENESIS (if applicable)
- Project: {name}
- Total time: {hours}
- Challenges raised: {count}
- Contradictions: {found} / {resolved}
- Docs generated: {count}/11
- Revision rounds: {count}

### WORKFLOW
- Issues completed: {count}
- Avg cycle time: {days}
- First-pass review rate: {%}
- Review iterations (avg): {n}
- First-pass CI rate: {%}
- Gate rejections: {count}
- Escalations: {count}
- Blockers: {count} (avg {days} to resolve)

### Skills
- Skills searched: {count}
- Skills found: {count}
- Skills applied: {count}
- Skill conflicts: {count}

### Health: {Green/Yellow/Red}
- Concerns: {list}
- Actions: {list}
```

---

## Improvement Triggers

When to review and improve the workflow:

| Trigger | Action |
|---------|--------|
| GENESIS > 12 hr consistently | Review grooming questions, streamline |
| Review first-pass < 60% | Improve specs clarity, better EDGE-CASES.md coverage, review architecture references |
| Gate rejection > 40% | Improve spec quality, add checklists |
| CI first-pass < 60% | Add pre-commit hooks, improve local testing |
| Blocker duration > 3 days | Improve dependency tracking, earlier escalation |
| Skill hit rate < 50% | Improve search keywords, install more skills |
| Escalation rate > 30% | Improve agent knowledge, adjust rules |
