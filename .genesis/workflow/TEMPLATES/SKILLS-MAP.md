# SKILLS-MAP.md — Skills by Task

> Generated from GENESIS Phase 4.
> Maps discovered skills to the tasks that require them.
> Fill `{...}` placeholders with actual project values.

---

## Overview

**Project:** {project name}
**Date:** {date}
**Skill Discovery Method:** {tool-driven | manual survey}

---

## Skills by Task

> `Source`: local (already installed) · registry (skills.sh — human must install) · web (official doc URL — reference) · manual (training knowledge).
> Only skills the human approved for install belong here. Proposed-but-not-approved go under "Candidates (not approved)" below.

| Task | Domain | Skill | Source | Approved? | Key Patterns |
|------|--------|-------|--------|-----------|--------------|
| {KEY}-001 | {domain} | {skill name} | {local / registry / web `<url>` / manual} | {✅ human / ☐} | {brief summary} |
| {KEY}-002 | {domain} | {skill name} | {local / registry / web `<url>` / manual} | {✅ / ☐} | {brief summary} |
| {KEY}-003 | {domain} | {skill name} | {local / registry / web `<url>` / manual} | {✅ / ☐} | {brief summary} |

---

## Candidates (not approved)

> Found during discovery but NOT installed/approved yet. The human decides whether to
> install (registry) or accept as reference (web). The agent never installs.

| Domain / task | Candidate skill | Source | Why it helps | Trust note | Decision |
|---|---|---|---|---|---|
| {domain} | {name} | registry `owner/repo/skill` / web `<url>` (date) | {what it gives} | untrusted — evaluate | {install / reference / reject / pending} |

---

## Skills by Domain

### {Domain 1} (e.g., Testing)

- **{skill name}** ({source: local/registry/manual})
  - What it covers: {description}
  - Key pattern: {pattern 1}
  - Key pattern: {pattern 2}
  - Applies to tasks: {KEY}-001, {KEY}-005

### {Domain 2} (e.g., Authentication)

- **{skill name}** ({source})
  - What it covers: {description}
  - Key pattern: {pattern 1}
  - Applies to tasks: {KEY}-010

### {Domain 3} (e.g., Deployment)

- **{skill name}** ({source})
  - What it covers: {description}
  - Key pattern: {pattern 1}
  - Applies to tasks: {KEY}-020

---

## Skill Evaluation

For each skill loaded, confirm alignment with project decisions:

| Skill | Aligns with ARCHITECTURE.md? | Aligns with RULES.md? | Adaptation Needed? |
|-------|------------------------------|----------------------|-------------------|
| {skill} | {yes/no — note if no} | {yes/no — note if no} | {what to adapt} |

---

## Conflicts

Skills that conflict with project decisions and how they were resolved:

| Skill | Conflict | Resolution |
|-------|----------|------------|
| {skill} | {what it recommends vs project decision} | {how resolved — adapt/ignore/escalate} |
| {skill} | {e.g., "suggests Redux, project uses Zustand"} | {e.g., "use Zustand patterns instead"} |

---

## Skills Not Found

Domains where no skill was found and the fallback approach:

| Domain | Queries Tried | Fallback Approach |
|--------|---------------|-------------------|
| {domain} | {search queries} | {manual documentation / training knowledge / escalate} |

---

## Manual Survey (if skill tools unavailable)

If running on a non-Kiro runtime without `skill_search`/`skill_discover`:

| Domain | Known Patterns | External Docs to Consult |
|--------|----------------|--------------------------|
| {domain} | {patterns from training knowledge} | {official docs, guides} |

---

## Skill Loading Log

Track what was loaded during this GENESIS session:

| Skill | Domain | Source | Loaded At | Applied To |
|-------|--------|--------|-----------|------------|
| {skill} | {domain} | {local/registry/manual} | {phase/time} | {task list} |

---

## Ready for Implementation?

- [ ] All task domains have a skill or documented fallback
- [ ] All conflicts resolved or documented
- [ ] Skill patterns adapted to project conventions
- [ ] No skill overrides project RULES.md

**Status:** {READY | NOT READY — reason}
