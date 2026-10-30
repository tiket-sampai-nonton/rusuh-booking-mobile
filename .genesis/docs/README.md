# GENESIS — Rusuh Booking Tiket (FE)

> Index of the GENESIS output for this project. Numbered files = the phase/gate
> process trail (read in order). `docs/` = the implementation-ready deliverable set.
> **Gate model: 6 human gates** — H1 Grooming → H2 Docs → H3 Tasks → H4 Skills/Rules → H5 Go/No-Go → H6 Project-Setup.
> **Authoritative order when docs disagree:** `03-GROOMING-DECISIONS.md` → OpenAPI contracts → `docs/FE-BE-align-contract.md` → `docs/FE-Flow-Diagrams.md` → prototype V5.

---

## Process trail (phase order)

| # | File | Phase | Gate | Status |
|---|------|-------|------|--------|
| 01 | `01-PHASE-1-REQUIREMENT-ANALYSIS.md` | 1 — Requirement analysis | — | ✅ |
| 02 | `02-PHASE-1-GROOMING-AGENDA.md` | 1 — Grooming agenda | — | ✅ |
| 03 | `03-GROOMING-DECISIONS.md` | 1 output — **source of truth** | **H1** | ✅ PASSED |
| 04 | `04-PHASE-2-INDEX.md` | 2 — Documentation manifest | **H2** | ✅ PASSED |
| 05 | `05-TASK-LIST.md` | 3 — Task decomposition (9 epics / 44 stories) | **H3** | ✅ PASSED |
| 06 | `06-TASK-ORDER.md` | 3 — **run reference** (domain-grouped waves + Run Next) | **H3** | ✅ PASSED |
| 07 | `07-SKILLS-MAP.md` | 4 — Skills by task | **H4** | ✅ PASSED |
| 08 | `08-RULES.md` | 4 — Project rules (MUST/NEVER/ASK) | **H4** | ✅ PASSED |
| — | `../../AGENTS.md` (repo root) | 4 — Agent manifest | **H4** | ✅ PASSED |
| 09 | `09-IMPLEMENTATION-READINESS.md` | 5 — Readiness check | **H5** | ✅ GO (2026-10-30) |
| 10 | `10-PROJECT-SETUP.md` | 5.5 — Project setup (repo·CI·Sonar·husky·secrets·scaffold) | **H6** | ⏳ pending (RBT-001/005) |

---

## Deliverable documentation set — `docs/`

| Doc | Origin |
|-----|--------|
| `docs/ARCHITECTURE.md` | adopted + **v2 rewrite (2026-10-30): single-app Clean-Arch folders**; web-push v1 |
| `docs/FE-Flow-Diagrams.md` | adopted (payment = follow-prototype correction) |
| `docs/PIPELINE.md` | adopted |
| `docs/FE-BE-align-contract.md` | authoritative FE↔BE gap list |
| `docs/api-contract/*.openapi.json` | 5 service + 2 internal OpenAPI contracts |
| `docs/mock-fixtures/` | Contract-faithful mock responses (RBT-014/065 seed) — user-queue + booking-payment + README |
| `docs/DESIGN-SYSTEM.md` | generated |
| `docs/EDGE-CASES.md` | generated |
| `docs/SECURITY.md` | generated |
| `docs/OBSERVABILITY.md` | generated |
| `docs/TESTING-STRATEGY.md` | generated |

---

## Elsewhere in the repo

- `.genesis/requirement/Tender Rusuh Booking Ticket.pdf` — raw requirement (input).
- `.genesis/workflow/` — the generic GENESIS→IMPLEMENTATION workflow (not project-specific; untouched).
- `.genesis/prototype/Final/` — V5 clickable prototype (UX reference).
- `AGENTS.md` (repo root) — manifest agent runtimes read first.

---

## Key open dependencies (cross-team, non-blocking — FE mocks behind the real port)

| ID | Blocks |
|----|--------|
| O1 | FE-NEED endpoints (buyer-set, anonymous join, `remainingTickets`, `description` JSON, profile-complete flag) |
| O2 | Midtrans `createAttempt` + page-token contract shapes (mock `PaymentRepository` until delivered, D10.5) |
| O4 | `/browse` server filter/sort + event history endpoint |
