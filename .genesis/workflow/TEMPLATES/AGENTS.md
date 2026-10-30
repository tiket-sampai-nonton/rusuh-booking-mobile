# AGENTS.md — Project Manifest

> Generated from GENESIS grooming decisions.
> This file goes at the REPO ROOT for agent runtimes to read.
> Fill `{...}` placeholders with actual project values.

---

## Project Identity

- **Name:** {project name}
- **Stack:** {primary technologies}
- **State:** {Pre-implementation | In development | Production}
- **Issue prefix:** `{PREFIX}` (e.g., `PROJ-123`)
- **Tracking:** {Jira | GitHub | Linear} + GitHub
- **Branch base:** `{develop | main}`
- **CI:** {GitHub Actions | GitLab CI | other}

---

## Workflow

Follow the workflow: `.genesis/workflow/WORKFLOW.md`

This project uses:
- **Single-ticket mode** for most work
- **Parallel-batch mode** for independent stories with disjoint files
- **Spike mode** for research tasks

---

## Source of Truth

| Priority | Document | Path |
|----------|----------|------|
| 0 | Grooming decisions (gates all) | `.genesis/docs/03-GROOMING-DECISIONS.md` |
| 1 | Architecture | `.genesis/docs/ARCHITECTURE.md` |
| 2 | API contracts | `.genesis/docs/api-contract/` (+ `.genesis/docs/API-CONTRACT.md`) |
| 3 | Flow diagrams | `.genesis/docs/FLOW-DIAGRAMS.md` |
| 4 | Edge cases | `.genesis/docs/EDGE-CASES.md` |
| 5 | Security | `.genesis/docs/SECURITY.md` |
| 6 | Infrastructure | `.genesis/docs/INFRASTRUCTURE.md` |
| 7 | Testing strategy | `.genesis/docs/TESTING-STRATEGY.md` |
| 8 | Task list (detail) | `.genesis/docs/05-TASK-LIST.md` |
| 8a | **Task order (RUN REFERENCE)** | `.genesis/docs/06-TASK-ORDER.md` |
| 9 | Skills map | `.genesis/docs/07-SKILLS-MAP.md` |
| 10 | Project rules | `.genesis/docs/08-RULES.md` |
| 11 | Readiness | `.genesis/docs/09-IMPLEMENTATION-READINESS.md` |

**If code contradicts these docs, the docs win. Escalate instead of inventing.**

---

## Blockers — Check Before Starting

From `.genesis/docs/09-IMPLEMENTATION-READINESS.md`.

| ID | Status | Blocks |
|----|--------|--------|
| {P0-01} | {Open/Resolved} | {what it blocks} |
| {P0-02} | {Open/Resolved} | {what it blocks} |

---

## Commands

```bash
# Install dependencies
{install command}

# Start development
{dev command}

# Type check
{typecheck command}

# Lint
{lint command}

# Test
{test command}

# Build
{build command}

# Deploy
{deploy command}
```

---

## Project-Specific Rules

These extend the generic rules in `.genesis/workflow/RULES.md`.

### MUST (project)

- **MUST** {project-specific requirement}
- **MUST** {project-specific requirement}
- **MUST** {project-specific requirement}

### NEVER (project)

- **NEVER** {project-specific prohibition}
- **NEVER** {project-specific prohibition}
- **NEVER** {project-specific prohibition}

### ASK (project)

- **ASK** {when to get approval}
- **ASK** {when to get approval}

---

## Architecture

> From `.genesis/docs/ARCHITECTURE.md`

### Structure

```
{repo structure from ARCHITECTURE.md}
```

### Dependency Direction

```
{layer diagram from ARCHITECTURE.md}
```

**Rule:** {key architectural constraint}

---

## Tech Stack

| Concern | Choice |
|---------|--------|
| Language | {language} |
| Framework | {framework} |
| UI | {UI library} |
| State | {state management} |
| Forms | {form library} |
| Testing | {test framework} |
| Build | {build tool} |

---

## Key Patterns

### {Pattern 1}
{Brief description of how to implement this pattern}

### {Pattern 2}
{Brief description of how to implement this pattern}

---

## Skills Required

From `.genesis/docs/07-SKILLS-MAP.md`:

| Domain | Skill | Source |
|--------|-------|--------|
| {domain} | {skill name} | {local/registry} |
| {domain} | {skill name} | {local/registry} |

---

## Escalation

| Unclear about... | Escalate to |
|------------------|-------------|
| Scope, priority | {role/person} |
| API contract | {role/person} |
| Architecture | {role/person} |
| Security | {role/person} |
| Infrastructure | {role/person} |

---

## Routes / Screens

```
{list of routes from FLOW-DIAGRAMS.md}
```

---

## Environment Variables

| Variable | Purpose | Required |
|----------|---------|----------|
| `{VAR_NAME}` | {purpose} | {yes/no} |
| `{VAR_NAME}` | {purpose} | {yes/no} |

**Note:** Never commit actual values. Use `.env.example` for templates.
