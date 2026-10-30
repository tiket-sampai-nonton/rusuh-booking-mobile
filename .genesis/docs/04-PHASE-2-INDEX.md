# PHASE 2 — Documentation Set (index) & Gate H2

> GENESIS Phase 2 output. The documentation set for implementation, per `GROOMING-DECISIONS.md`.
> Phase 2 **verified + adopted** the existing strong material and **generated** the thin/missing docs.
> **Layout (2026-10-29):** the ENTIRE implementation-ready documentation set lives in **`.genesis/docs/`** — one folder, one source of truth. `.genesis/requirement/` holds only the raw requirement PDF; the stale sibling `assessment/tickets/` tree is not used.
> **STOP at Gate H2** — human reviews this set.

## Document manifest

| Doc | Status | Location |
|---|---|---|
| ARCHITECTURE | ✅ Adopted + **rewritten to v2 (2026-10-30): single-app Clean-Architecture folders** (was 8-package monorepo); §6.1 web-push→v1 retained | `.genesis/docs/ARCHITECTURE.md` |
| FE-FLOW-DIAGRAMS | ✅ Adopted (existing) + **corrected** §2.4 Midtrans-hosted | `.genesis/docs/FE-Flow-Diagrams.md` |
| CI-CD (PIPELINE) | ✅ Adopted (existing) as-is | `.genesis/docs/PIPELINE.md` |
| API-CONTRACT (OpenAPI) | ✅ Adopted (existing) + gap list (O1/O2/O4) | `.genesis/docs/api-contract/*.openapi.json` + `.genesis/docs/FE-BE-align-contract.md` |
| DESIGN-SYSTEM | 🆕 Generated | `.genesis/docs/DESIGN-SYSTEM.md` |
| EDGE-CASES | 🆕 Generated | `.genesis/docs/EDGE-CASES.md` |
| SECURITY | 🆕 Generated | `.genesis/docs/SECURITY.md` |
| OBSERVABILITY | 🆕 Generated | `.genesis/docs/OBSERVABILITY.md` |
| TESTING-STRATEGY | 🆕 Generated | `.genesis/docs/TESTING-STRATEGY.md` |

> Not generated (BE-owned, out of FE scope): INFRASTRUCTURE (BE), SEQUENCE-DIAGRAMS (covered by FE-Flow-Diagrams §2), FLOW-DIAGRAMS (covered by FE-Flow-Diagrams §1). These GENESIS template docs are intentionally skipped for an FE-only delivery.

## Corrections applied to originals this phase

1. **ARCHITECTURE.md §6.1** — "Web notifications deferred from v1" → **web push mandatory in v1** (service-worker + browser push, shared domain flow), per D8.2.
2. **FE-Flow-Diagrams.md §2.4** — correction note (re-corrected 2026-10-29 per user "follow the prototype"): payment = **FE-built payment page** (summary + method selection + server timer) → create-attempt → **Midtrans SNAP handoff** → verify-with-BE; **page-token WebView-reuse retained as FE scope**; instrument entry on SNAP only; O2 open items flagged.
3. **ARCHITECTURE.md v2 rewrite (2026-10-30)** — the eight-package monorepo (`packages/{domain,api-client,state,ui,design-tokens,platform,config,test-fixtures}`) was replaced by a **single Expo app with Clean-Architecture layers as folders** (`apps/client/src/{app,domain,application,infrastructure,presentation,providers,shared}`). Added decisions: D1 single-app/ESLint-enforced boundaries (§11.6), D2 composition root in `src/providers` (§11.7), D3 hook-seam + swappable `HttpClient` port (§11.8), styling = NativeWind with prototype-V5 tokens (§11.9). Downstream docs (03-GROOMING-DECISIONS, 05-TASK-LIST, 06-TASK-ORDER, DESIGN-SYSTEM, TESTING-STRATEGY, 02/09) aligned the same day.

## Open dependencies carried forward (not blocking H2)

- **O1** FE-NEED endpoints (requested to BE): buyer set, anonymous join, `remainingTickets`, `EventDetail.description`, profile-complete flag.
- **O2** Midtrans create-attempt request/response + web-vs-mobile return-URL shapes (discuss with BE).
- **O4** Server-side `/browse` filter/sort params + event history/archive endpoint.

## GATE H2 — Documentation verification (human)

Review checklist:
- [ ] Architecture matches grooming decisions (FE-only, Expo/RN/RN-Web, Clean Arch, Midtrans payment, web push v1)?
- [ ] API contracts complete + gap list (O1/O2/O4) acceptable?
- [ ] FE-Flow diagrams cover all journeys and reflect the Midtrans correction?
- [ ] Edge cases comprehensive (session continuity, queue, NIK, payment, degraded)?
- [ ] Security covers NIK/PII consent+masking, PCI-out-of-scope, token handling?
- [ ] Observability covers FE funnel + Web Vitals + poll hygiene + release health?
- [ ] Testing strategy matches CI gates (≥90% shared coverage, Playwright/Maestro local-only)?
- [ ] No contradictions between docs?

**Pass criteria:** all docs reviewed + approved; corrections confirmed; no open design questions. On pass → **Phase 3 (Task Decomposition)**, seeded by the ARCHITECTURE P0–P7 delivery roadmap.

**GATE H2 STATUS: ✅ PASSED (user "all clear, reviewed", 2026-10-29).** Documentation set approved. Proceed to Phase 3.
