# RBT-040 — Queue state machine (domain) — Evidence

**Ticket:** RBT-040 · Epic E5 Queue · Type: Story (P0, L)
**Branch:** `feature/RBT-040-queue-state-machine` (commit `d8eb291`)
**Classification:** logic-only (pure domain, no UI) → evidence = live gate output (per RECOVERY §F005).

## Acceptance criteria
- **AC1:** WAITING/ADMITTED/CLAIMED/MISSED/LEFT/SOLD_OUT/CLOSED/ENDED (+COMPLETED from the frozen port superset) transitions; only ADMITTED authorizes. Unit-tested. ✅

## Live gate run (verified by orchestrator, not self-reported)
- `npm run typecheck` (tsc --noEmit) → **exit 0**, 0 errors
- `npm run lint` (ESLint incl. layer-boundary rules) → **exit 0**, 0 errors
- `npx jest src/__tests__/domain/queue-state-machine.test.ts` → **15/15 pass**
- Coverage on `src/domain/state-machines/**` → **100% stmts / 100% branch / 100% funcs / 100% lines**

Raw log: `test-coverage-20261101-164044.log` (this folder).

## Design notes
- Pure TS domain. Imports only `@domain/errors/domain-error` + type-only `QueueStatus` from the port. Zero React/RN/Expo/infra/presentation imports (ESLint boundary rules pass).
- Modeled to the **port's 9-status enum** (superset of the ticket's 8); `COMPLETED` treated as terminal alongside `ENDED` — a strict superset, no contradiction (docs-win rule, resolved without escalation).
- Illegal transitions throw `DomainError(kind=conflict, code=INVALID_QUEUE_TRANSITION)`; terminal states reject all transitions; `authorizes()`/`isAdmitted()` return true only for ADMITTED.

## Regression
Full suite on branch: no regressions (domain-only addition; 15 new tests).
