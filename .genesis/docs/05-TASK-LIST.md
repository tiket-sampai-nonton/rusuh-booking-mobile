# TASK-LIST.md — Rusuh Booking Tiket (FE) — Task Decomposition

> GENESIS Phase 3 output. Conforms to `GROOMING-DECISIONS.md` + the Phase 2 doc set.
> Scope: **FE only** (Expo + RN + RN Web). BE is a consumed contract. Prefix: **RBT**.
> Seeded by `ARCHITECTURE.md §13` delivery roadmap (P0–P7) and FR/BR/NFR coverage.
> **This file is the DETAIL** (epics/stories/ACs). The **run reference is `06-TASK-ORDER.md`** (domain-grouped waves + "Run Next") — WORKFLOW Phase 0 selects the next task there, not here.
> **STOP at Gate H3** — human verifies the breakdown.

---

## Overview

**Total Epics:** 9 · **Total Stories:** 44 · **Estimated Duration:** ~9–11 weeks (5-person team, 2 web FE + 1 mobile FE effectively on the shared codebase)

> Estimates are **story points (S/M/L/XL)**, not calendar promises. The team is 1 mobile + 2 web FE (per tender); the shared RN/RN-Web codebase means most work is shared, with platform-specific tails (`.web.tsx`/`.native.tsx`).

## Epic Overview

| Epic | Name                                                                             | Priority | Stories | Est. Points | Roadmap |
| ---- | -------------------------------------------------------------------------------- | -------- | ------- | ----------- | ------- |
| E1   | Foundations (Expo app, Clean-Arch folders, NativeWind, CI)                       | P0       | 5       | 26          | P0      |
| E2   | API client, contracts, server-clock, idempotency, mock adapter                   | P0       | 5       | 29          | P1      |
| E3   | Auth / profile (OTP, NIK, consent)                                               | P0       | 4       | 21          | P1      |
| E4   | Events: Home, Browse, Event detail (+SEO)                                        | P0       | 5       | 29          | P2      |
| E5   | Queue / Waiting room (state machine, adaptive polling, refresh-safe)             | P0       | 5       | 34          | P3      |
| E6   | Checkout / booking hold (NIK/attendee, timer, idempotent hold)                   | P0       | 5       | 37          | P4      |
| E7   | Payment (FE page + method selection → SNAP handoff → verify; mock-first adapter) | P0       | 6       | 36          | P5      |
| E8   | E-ticket + Notifications (QR, download/share, native+web push)                   | P0       | 4       | 26          | P6      |
| E9   | Hardening: a11y, perf/bundle, load test, QA, release readiness                   | P0/P1    | 5       | 24          | P7      |

---

## Team Assignment (3 developers)

> Division across **Ray**, **Eld**, **Riz**. **Riz is platform lead** — owns the ENTIRE foundation + Core-API rails (E1+E2: scaffold, router, NativeWind, DI, CI/Sonar/husky, OpenAPI ports, ServerClock, idempotency, errors, mock) plus one simple feature (E8). Eld and Ray are feature owners. Balanced by **story points** (~82/84/82). Owner tags mirrored in `06-TASK-ORDER.md`. (v3 2026-10-30 — platform-lead model, supersedes the earlier feature-split versions.)

### Lanes

| Developer | Owns                                                                         | Pts    | Role                                                                              |
| --------- | ---------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------- |
| **Riz**   | **E1 Foundations + E2 Core-API (all rails)** + **E8 E-ticket/Notifications** | **82** | Platform lead — builds the rails everyone rides, then a light independent feature |
| **Eld**   | **E5 Queue** + **E6 Booking** (transaction spine, in-lane) + a11y            | **84** | Owns the Queue→Booking critical chain end-to-end                                  |
| **Ray**   | **E3 Auth** + **E4 Events** + **E7 Payment** + perf/load/QA/release          | **82** | Feature breadth: identity, discovery, payment                                     |

### Full per-developer allocation (points: S=3·M=5·L=8)

**Riz — 82 pts** (ALL rails + E8)
| Task | Pts | Epic | Depends on |
|------|-----|------|-----------|
| RBT-001 Single Expo app skeleton + Clean-Arch folders | 8 | E1 | — (kicks off everything) |
| RBT-002 Expo Router + route tree + guards | 5 | E1 | RBT-001 |
| RBT-003 Design tokens (NativeWind) + theme | 5 | E1 | RBT-001 |
| RBT-004 DI composition root + ports | 5 | E1 | RBT-001 |
| RBT-005 CI skeleton — Actions + SonarCloud + **husky commit guard** + branch protection | 8 | E1 | RBT-001 |
| RBT-010 OpenAPI types + repositories | 8 | E2 | RBT-004 |
| RBT-011 Server-authoritative clock (ServerClock) | 5 | E2 | RBT-010 |
| RBT-012 Idempotency-Key handling | 5 | E2 | RBT-010 |
| RBT-013 Error taxonomy + Bahasa + Retry-After | 5 | E2 | RBT-010 |
| RBT-014 Mock adapter + test fixtures | 5 | E2 | RBT-010 |
| RBT-070 Success page + order summary | 5 | E8 | RBT-063 (Ray) |
| RBT-071 E-ticket QR + download/share | 5 | E8 | RBT-070 |
| RBT-072 Native notifications | 5 | E8 | RBT-004 (self) |
| RBT-073 Web push (service worker) | 8 | E8 | RBT-072 |

> Riz owns the whole rails surface, so "wait for foundation / the API layer / CI" is **one owner**. E8 is the lightest, most independent feature — notifications need only Riz's own DI port; success/QR just read a paid-booking status.

**Eld — 84 pts** (Queue + Booking spine, in-lane)
| Task | Pts | Epic | Depends on |
|------|-----|------|-----------|
| RBT-040 Queue state machine (domain) | 8 | E5 | RBT-011 (Riz) |
| RBT-041 Join (anon) + refresh-safe persistence | 8 | E5 | RBT-040, RBT-023 (Ray) |
| RBT-042 Adaptive polling (+ SSE fallback) | 8 | E5 | RBT-040 |
| RBT-043 Waiting room UI | 5 | E5 | RBT-042 |
| RBT-044 Auto-claim + redirect + error states | 5 | E5 | RBT-040 |
| RBT-050 Booking session create/restore + timer | 8 | E6 | RBT-044, RBT-011 (Riz) |
| RBT-051 Ticket item list + category/quantity rules | 8 | E6 | RBT-050 |
| RBT-052 NIK validation + attendee + single-use buyer-NIK | 8 | E6 | RBT-051 |
| RBT-053 Buyer data + set-buyer + confirm-leave | 5 | E6 | RBT-052, RBT-022 (Ray) |
| RBT-054 Create booking (idempotent hold) | 8 | E6 | RBT-053, RBT-012 (Riz) |
| RBT-080 Accessibility (WCAG 2.1 AA) | 5 | E9 | feature epics |

> Queue→Booking (044→050) is **in-lane** — no cross-dev wait on the tightest link.

**Ray — 82 pts** (Auth + Events + Payment)
| Task | Pts | Epic | Depends on |
|------|-----|------|-----------|
| RBT-020 OTP request/verify | 5 | E3 | RBT-010 (Riz) |
| RBT-021 Registration — name + NIK + consent | 8 | E3 | RBT-020 |
| RBT-022 Profile store + checkout auto-fill | 3 | E3 | RBT-021 |
| RBT-023 Secure token storage + session | 5 | E3 | RBT-020 |
| RBT-030 Home — event list + status + nearby/history | 8 | E4 | RBT-010 (Riz) |
| RBT-031 Browse — URL-driven filters | 5 | E4 | RBT-030 |
| RBT-032 Event detail — categories + availability + CTA | 5 | E4 | RBT-030 |
| RBT-033 Public SEO rendering (static/server) | 8 | E4 | RBT-030, RBT-005 (Riz) |
| RBT-034 Nearby + history derivation | 3 | E4 | RBT-030 |
| RBT-060 Payment page (summary + method + timer) | 8 | E7 | RBT-054 (Eld), RBT-011 (Riz) |
| RBT-061 Create-attempt + SNAP handoff | 8 | E7 | RBT-060, RBT-012 (Riz) |
| RBT-062 Page-token WebView reuse | 5 | E7 | RBT-061 |
| RBT-063 Callback verify + result routing | 5 | E7 | RBT-061 |
| RBT-064 Failure/expiry recovery | 5 | E7 | RBT-063 |
| RBT-065 Mock PaymentRepository + SNAP simulator | 5 | E7 | RBT-014 (Riz), RBT-060 |
| RBT-081 Performance + bundle budgets | 5 | E9 | RBT-033 + features |
| RBT-082 Flash-crowd load test | 8 | E9 | RBT-042/050/054 (Eld) |
| RBT-083 QA suites — Playwright + Maestro | 8 | E9 | feature epics |
| RBT-084 Release readiness — OTA, rollback, summary | 5 | E9 | RBT-005 (Riz)/081/082/083 |

**Balance:** Riz 82 · Eld 84 · Ray 82 (±2% of ~83).

### Cross-developer dependencies

> Riz owns ALL rails, so most cross-edges are **Riz's frozen ports fanning out** (build once, everyone reads the interface). Feature-chain crossings are few:

| Handoff                            | From → To                         | Interface                                              | When                         |
| ---------------------------------- | --------------------------------- | ------------------------------------------------------ | ---------------------------- |
| Rails: ports + clock + idempotency | **Riz (010/011/012)** → Eld + Ray | `src/domain/repositories` + `HttpClient` + `ClockPort` | freeze end of rails (Wave 2) |
| Token/session                      | Ray (023) → Eld (041 queue join)  | session/visitor-token port                             | Wave 3                       |
| **Booking hold → Payment**         | **Eld (054) → Ray (060)**         | booking id + `PaymentRepository` port                  | critical-path cross-edge     |
| Paid booking → Success             | Ray (063) → Riz (070 success/QR)  | payment-status PAID                                    | Wave 6                       |
| Load test                          | Eld (queue/booking) → Ray (082)   | runs against Eld's flows                               | Wave 7                       |

**Platform-lead advantage:** every foundation/API/CI dependency resolves to **one person (Riz)** — the hardest-to-split concern has no seams. The only feature-chain cross-edges are Booking→Payment (Eld→Ray) and Paid→Success (Ray→Riz), each at a frozen port.

**Ordering:** Riz lands RBT-001, then builds the rails (router/tokens/DI/CI, then Core-API) and freezes the ports; Eld + Ray start their lanes the moment the ports they need are published. Riz's E8 comes late (needs paid-booking), so Riz front-loads rails then does E8 while others finish features.

## Dependency Graph

```
E1 Foundations
   └── E2 API client + contracts + ServerClock + idempotency + mock
          ├── E3 Auth/profile ──────────────┐
          ├── E4 Events (Home/Browse/Detail) │
          └── E5 Queue/Waiting ──────────────┤
                                             ▼
                                   E6 Checkout/hold (needs E3 profile, E5 admission)
                                             │
                                             ▼
                                   E7 Payment (needs E6 booking)
                                             │
                                             ▼
                                   E8 E-ticket + Notifications (needs E7 PAID)
                                             │
                                             ▼
                                   E9 Hardening (cross-cutting, finalizes all)
```

## Critical Path

```
E1 skeleton → E2 API layer+clock+idempotency → E5 queue→admission → E6 hold → E7 payment → E8 e-ticket → E9 release-ready
  (L)              (XL)                            (XL)             (XL)       (L)         (L)          (L)
≈ the booking spine; E3/E4 run in parallel off E2 and merge in at E6/E4.
```

---

## Epic 1 — Foundations

**Delivers:** the Expo Universal single app, Clean-Architecture folder skeleton (`src/{app,domain,application,infrastructure,presentation,providers,shared}`), Expo Router, NativeWind + prototype tokens, ESLint boundary rules, and the CI skeleton. **Priority:** P0. **Dependencies:** none.

#### RBT-001: Single Expo app skeleton + Clean-Architecture folders

Type: Story · P0 · L · Deps: none

- AC1: `apps/client` Expo app boots on web, Android, iOS (dev build).
- AC2: `src/{app,domain,application,infrastructure,presentation,providers,shared}` folders exist with build wiring + path aliases (`@domain/*`, `@application/*`, `@infrastructure/*`, `@presentation/*`, `@providers/*`, `@shared/*`).
- AC3: TypeScript strict passes; path aliases resolve; NativeWind + `tailwind.config.js` wired; ESLint layer-boundary rules installed in the pre-commit guard.
- Skills: Expo, Clean Architecture, NativeWind, TypeScript.

#### RBT-002: Expo Router + route tree + layout guards

Type: Story · P0 · M · Deps: RBT-001

- AC1: Routes for `/`, `/browse`, `/events/[eventId]`, `/waiting/[eventId]`, `/checkout/[sessionId]`, `/payment/[bookingId]`, `/success/[bookingId]`, `/expired/[resourceId]`.
- AC2: `src/app` contains routing only (no API/business logic — lint rule enforces).
- Skills: Expo Router.

#### RBT-003: Design tokens (NativeWind) + theme provider

Type: Story · P0 · M · Deps: RBT-001

- AC1: `apps/client/tailwind.config.js` with color/type/spacing/radius/motion tokens (ported from prototype V5), light+dark; `presentation/theme` re-exports for non-className use.
- AC2: Every surface sets background+text pair (no fixed literals). Reduced-motion flag wired.
- Skills: design systems, RN styling.

#### RBT-004: DI composition root + ports

Type: Story · P0 · M · Deps: RBT-001

- AC1: Composition root (`src/providers/container.ts`, manual DI — no library) wires ports (`QueueRepository`, `PaymentRepository`, `ClockPort`, `NotificationPort`, `FileSharePort`, `HttpClient`) to concrete adapters; `EXPO_PUBLIC_USE_MOCKS` toggles mock/real.
- AC2: Domain/application layers import no React/RN/Expo/browser/native (lint-enforced dependency rule).
- Skills: Clean Architecture, DI.

#### RBT-005: CI skeleton (GitHub Actions + SonarCloud) + issue-state automation

Type: Story · P0 · L · Deps: RBT-001

- AC1: PR workflow runs typecheck, lint (incl. layer-boundary rules), Jest, `npm audit`, SonarCloud; stops before deploy.
- AC2: Branch model `develop`/`main` with the PIPELINE.md gates wired; branch protection on `main`/`develop` (require PR + checks, no direct push); secrets referenced (not committed).
- AC3: Bundle-size + SEO-output checks stubbed for web release.
- AC4: **Husky commit guard** installed (`.husky/pre-commit`): lint (staged) → type-check → related tests → changed-code coverage ≥80%; `.husky/commit-msg` enforces `type(scope): [RBT-xxx]` Conventional Commits. Never `--no-verify` (project RULES).
- AC5: **Issue-state automation** (per TRACKING.md §Issue States + Automation Hooks): a status mechanism exists (status labels `status:in-progress|qa|in-review|done|blocked`, or a GitHub Projects board with those columns) AND a GitHub Actions workflow moves the linked issue automatically — **PR opened → In Review**, **PR merged → Done** (the **→ QA** transition is set pre-PR by the agent on evidence capture, since QA precedes the PR in the evidence-first flow) — so transitions are enforced by the repo where a PR event exists. Branch/PR must reference the issue (`RBT-xxx` / `Closes #N`) so the Action can resolve it. `In Progress` is set when the feature branch is first pushed (or by the agent at task start per PLAYBOOK).
- Skills: GitHub Actions, SonarCloud, EAS config, husky/lint-staged.

---

## Epic 2 — API client, contracts, server-clock, idempotency, mock

**Delivers:** the typed API layer every feature depends on. **Priority:** P0. **Deps:** E1.

#### RBT-010: OpenAPI-generated types + repositories

Type: Story · P0 · L · Deps: RBT-004

- AC1: Types generated from `.genesis/docs/api-contract/*`; repositories per service (User/Queue/Booking/Payment) implement domain ports via a swappable `HttpClient` port (axios/fetch adapter).
- AC2: `{meta,data}` + `ErrorEnvelope` unwrap centralized. TanStack Query confined to `presentation/hooks` (the D3 seam), never in repositories.
- Skills: OpenAPI codegen, TanStack Query, ports/adapters.

#### RBT-011: Server-authoritative clock (`ServerClock`)

Type: Story · P0 · M · Deps: RBT-010

- AC1: offset sync from `serverTime`; `remaining(expiresAt)` ≥0; device-clock change/refresh does not reset (unit-tested). (FR-19, D3.2)
- Skills: domain/timer math.

#### RBT-012: Idempotency-Key handling

Type: Story · P0 · M · Deps: RBT-010

- AC1: key generated per action, persisted with action/session, reused on retry/refresh, cleared on terminal. (FR-25, D3.3)
- AC2: double-submit uses one key (unit-tested).
- Skills: domain, state.

#### RBT-013: Error taxonomy + Bahasa mapping + Retry-After

Type: Story · P0 · M · Deps: RBT-010

- AC1: every contract `errorCode` → typed domain error → Bahasa message; `Retry-After`/backoff honored; reads deduped. (D3.4/D3.5)
- Skills: domain, i18n.

#### RBT-014: Mock adapter + test fixtures

Type: Story · P0 · M · Deps: RBT-010

- AC1: mock adapters in `src/infrastructure/__fixtures__` + contract-shaped data in `src/shared/test-fixtures` (≥5 events incl. SOLD_OUT/NOT_STARTED/CLOSED) behind the repository ports; `EXPO_PUBLIC_USE_MOCKS` toggles real/mock. Covers FE-NEED gaps (O1) until BE delivers.
- Skills: MSW/fixtures.

---

## Epic 3 — Auth / profile

**Delivers:** **OPTIONAL** OTP login, registration with NIK + consent, profile auto-fill source. Login is never forced — a guest completes the whole flow without it (D8.5); NIK+consent is collected at checkout regardless (see RBT-052/053). **P0. Deps:** E2.

#### RBT-020: OTP request/verify flow (optional sign-in)

Type: Story · P0 · M · Deps: RBT-010

- AC1: email → OTP → token; returning user signs straight in. Sign-in is **entry-point optional** — never a blocking gate on browse/queue/checkout. (User Svc, D8.5)
- Skills: forms (RHF+Zod), auth.

#### RBT-021: Registration — name + NIK + consent gate

Type: Story · P0 · L · Deps: RBT-020

- AC1: new account (`hasNik=false`) must complete name + NIK (16-digit, validated); email read-only.
- AC2: **consent checkbox required before NIK/email collection** (D7.1); success pop-up.
- Skills: forms, privacy/PII handling.

#### RBT-022: Profile store + checkout auto-fill source

Type: Story · P0 · S · Deps: RBT-021

- AC1: logged-in profile (fullName/nikMasked/emailMasked) available to prefill checkout ("Terisi dari akun").
- Skills: Zustand state.

#### RBT-023: Secure token storage + session lifecycle

Type: Story · P0 · M · Deps: RBT-020

- AC1: native tokens in `expo-secure-store`; web secure cookie; clear on logout/terminal. (D7.2)
- AC2: session-token used as logged-in slot key (D9.3).
- Skills: platform adapters, security.

---

## Epic 4 — Events (Home, Browse, Event detail)

**Delivers:** discovery surface + SEO. **P0. Deps:** E2.

#### RBT-030: Home — event list + status + nearby/history

Type: Story · P0 · L · Deps: RBT-010

- AC1: `listEvents()`; status enum → badge (Tersedia/Stok Menipis/Sold Out, disabled when sold out); price-from `minorToIDR`; date `DD MMM YYYY`. (FR-01/02/03)
- AC2: skeletons + empty state; defensive null-checks.
- Skills: RN lists, design system.

#### RBT-031: Browse — URL-driven filters

Type: Story · P1 · M · Deps: RBT-030

- AC1: `/browse?genre&province&time&sort`; client-filter until BE params (O4); removable chips, reset. Invalid values safe.
- Skills: Expo Router query, filtering.

#### RBT-032: Event detail — categories + availability + queue CTA

Type: Story · P0 · M · Deps: RBT-030

- AC1: `getEvent()` → categories + `priceMinor` + available; parse rich `description` fields (`longDesc`, `lineup`, `location`, `gallery`, `terms`) defensively. The live runtime provides these fields; the 07-11 machine-readable schema still needs updating. (FR-11/12)
- AC2: "Masuk Antrean" CTA → anonymous join.
- Skills: RN, contracts.

#### RBT-033: Public SEO rendering (static/server)

Type: Story · P0 · L · Deps: RBT-030, RBT-005

- AC1: `web.output: static`; `/` + `/events/[eventId]` produce indexable HTML; `single` rejected by CI.
- AC2: route metadata, canonical, OG, JSON-LD, sitemap/robots; transactional pages `noindex`.
- Skills: Expo static rendering, SEO.

#### RBT-034: Nearby + history derivation

Type: Story · P1 · S · Deps: RBT-030

- AC1: "Konser Terdekat" (upcoming asc), "History Event" (past/CLOSED desc); rolling windows from `serverNow`; archive endpoint is O4 (fallback for now).
- Skills: domain/date logic.

---

## Epic 5 — Queue / Waiting room

**Delivers:** the virtual waiting room — the system's core risk surface. **P0. Deps:** E2.

#### RBT-040: Queue state machine (domain)

Type: Story · P0 · L · Deps: RBT-011

- AC1: WAITING/ADMITTED/CLAIMED/MISSED/LEFT/SOLD_OUT/CLOSED/ENDED transitions; only ADMITTED authorizes (unit-tested). (FR-05/08)
- Skills: domain state machines.

#### RBT-041: Join (anonymous) + refresh-safe persistence

Type: Story · P0 · L · Deps: RBT-040, RBT-023

- AC1: anonymous join (FE-NEED body O1); persist entryId+queueToken; restore on refresh/re-join (no duplicate). (FR-10, BR-07, D9.3)
- AC2: slot keyed session-token (logged-in) / visitor-token (guest).
- Skills: platform persistence, state.

#### RBT-042: Adaptive polling (+ SSE fallback)

Type: Story · P0 · L · Deps: RBT-040

- AC1: honor `nextPollAfterMs` (far/mid/near); one poller/session; jitter; cancel on unmount/background; no request storm. (NFR-05/06, ARCH §9.2)
- Skills: TanStack Query polling, perf.

#### RBT-043: Waiting room UI (position, zones, estimate)

Type: Story · P0 · M · Deps: RBT-042

- AC1: "orang di depan" + "estimasi"; zone color+label (GUARANTEED/POSSIBLE/NOT_ENOUGH); live region on change; ETA (FR-09, in).
- Skills: RN UI, a11y.

#### RBT-044: Auto-claim + redirect + error states

Type: Story · P0 · M · Deps: RBT-040

- AC1: on turn, auto-claim (no button) → admissionToken (TTL ~60s) → redirect checkout; TURN_MISSED/EVENT_SOLD_OUT error states. (FR-08)
- Skills: state, routing.

---

## Epic 6 — Checkout / booking hold

**Delivers:** ticket selection, NIK/attendee validation, buyer data, idempotent hold, booking timer. **P0. Deps:** E5 (admission), E3 (profile).

#### RBT-050: Booking session create/restore + timer

Type: Story · P0 · L · Deps: RBT-044, RBT-011

- AC1: create session from admissionToken; restore via `current` without resetting `expiresAt`; countdown from server deadline; SESSION_EXPIRED → expired. (FR-17/18/19, D9.2)
- Skills: state, timer.

#### RBT-051: Ticket item list + category/quantity rules

Type: Story · P0 · L · Deps: RBT-050

- AC1: item list (min1, max `maxSelectable`); reject over-stock/over-3/accumulation-over-3; `allowMixedCategories`. (FR-13/14)
- Skills: domain rules, forms.

#### RBT-052: NIK validation + attendee checks + single-use buyer-NIK

Type: Story · P0 · L · Deps: RBT-051

- AC1: NIK mandatory, 16-digit; each ticket carries attendee NIK; buyer NIK usable on exactly one row (single-use checkbox disables others). (D9.1)
- AC2: debounced `attendee-checks`: ALREADY_REGISTERED blocks, CHECK_LIMIT_REACHED does not.
- AC3: **guest path** — since login is optional (D8.5), the NIK **consent gate (D7.1)** is rendered inline here at checkout for users who did not register; logged-in users who already consented at registration skip it.
- Skills: domain, forms, debounce, privacy/PII.

#### RBT-053: Buyer data + set-buyer + confirm-leave

Type: Story · P0 · M · Deps: RBT-052, RBT-022

- AC1: buyer NIK+email (auto-fill if logged in); set-buyer (FE-NEED O1 mock); back → confirm-leave dialog ("re-queue").
- Skills: forms, state.

#### RBT-054: Create booking (idempotent hold) + error handling

Type: Story · P0 · L · Deps: RBT-053, RBT-012

- AC1: `POST /bookings` with Idempotency-Key → hold; redirect payment; map CATEGORY_UNAVAILABLE/BUYER_QUOTA_EXHAUSTED/QUANTITY_EXCEEDS_LIMIT/MIXED/DUPLICATE. (FR-16, FR-25)
- Skills: domain, contracts.

---

## Epic 7 — Payment (FE payment page → Midtrans SNAP handoff)

**Delivers:** FE-built payment page (order summary + method selection + server timer) → create-attempt → SNAP handoff → verify → recovery, per **prototype `payment.html`/`snap.html`**. **P0. Deps:** E6.

> **Planning baseline (D10.5, 2026-10-29):** every story below is production code built against the `PaymentRepository` port; the initial implementation used a mock adapter. The live BE payment adapter is now integrated. The original mobile page-token story below is a planning baseline; the current native SNAP handoff and recovery behavior are documented in `AS-BUILT-ALIGNMENT-2026-11-13.md`.

#### RBT-060: Payment page (summary + method selection + timer)

Type: Story · P0 · L · Deps: RBT-054, RBT-011

- AC1: `GET /payments/{id}/page` → order summary (total == `amountMinor`, **no service/hidden-fee line**), `paymentExpiresAt`+serverTime → 10-min server-authoritative countdown. (FR-20/21, D10.1)
- AC2: **method-selection UI** driven by server `page.methods` — VA (BCA/BNI/BRI/Permata) · QRIS · GoPay, no credit card; VA-number / QR instruction area shown when applicable. Default = first method; "Bayar Sekarang" enabled on selection.
- Skills: RN, forms, timer, design system.

#### RBT-061: Create-attempt + SNAP handoff (web redirect / mobile WebView)

Type: Story · P0 · L · Deps: RBT-060, RBT-012

- AC1: "Bayar" → `createAttempt(bookingId, method, Idempotency-Key)` → BE `redirectUrl`; web redirects, native opens that backend-issued SNAP URL in its in-app WebView. The mobile page-token flow below is retained as a planning baseline, not the current native handoff. (FR-24, D10.2; runtime correction 2026-11-13)
- AC2: refresh-safe — `currentAttempt.status==='PENDING'` restores selected method + SNAP redirect state ("Kembali ke SNAP").
- Skills: payment integration, platform adapters, WebView.

#### RBT-062: Page-token WebView reuse (mobile)

Type: Story · P0 · M · Deps: RBT-061

> Historical implementation requirement: the currently approved native path opens the BE-issued SNAP redirect URL directly. The same-origin `/pay/{bookingId}` page-token bootstrap remains available for web where used; it is not a required step in native checkout. See the RBT-140 current runtime and contract report.

- AC1: mobile path `POST /payments/{id}/page-tokens` → one-time `pageToken` and site-relative `/pay/{id}` URL → resolve against `EXPO_PUBLIC_SITE_URL` → WebView loads the same-origin HTTPS payment page → exchange token once to set `rb_pay`. Do not inject the token on another origin/path; preserve the server-authoritative timer. (FR-24, D10.3)
- Skills: WebView, platform adapters, session handoff.

#### RBT-063: Callback verify + result routing

Type: Story · P0 · M · Deps: RBT-061

- AC1: success/failed callback (`successReturnUrl`/`failedReturnUrl`) → `GET /payments/{id}/status`; render success only if PAID (never trust callback); VERIFYING/REVIEW/UNKNOWN → processing + backoff poll; deadline-passed reconciled from serverTime. (FR-25, D10.4)
- Skills: state, polling.

#### RBT-064: Failure/expiry recovery

Type: Story · P0 · M · Deps: RBT-063

- AC1: FAILED+payable → retry new attempt; `BOOKING_NOT_PAYABLE`/deadline passed → expired(reason=payment) + re-queue path. (FR-23)
- Skills: state, routing.

#### RBT-065: Mock `PaymentRepository` adapter + SNAP simulator

Type: Story · P0 · M · Deps: RBT-014, RBT-060

- AC1: mock adapter implements the **full `PaymentRepository` port** (`getPaymentPage`, `createAttempt`, `getPaymentStatus`, `createPageToken`, `snapCallback`) with contract-shaped data ({meta,data}, `amountMinor`, `paymentExpiresAt`+`serverTime`, `redirectUrl`, `successReturnUrl`/`failedReturnUrl`, `currentAttempt`). Liskov-substitutable with the future BE adapter. (D10.5)
- AC2: local **SNAP simulator** page (equivalent to prototype `snap.html`) — success/failed buttons drive `snapCallback`; server-authoritative timer honored across handoff; VERIFYING/UNKNOWN paths selectable for testing.
- AC3: **composition-root swap** — one DI binding / `EXPO_PUBLIC_*` toggle selects mock vs real; integrating BE changes only the binding (RBT-014 toggle extended). No UI/domain/use-case change required.
- Skills: ports/adapters, test-fixtures, DI.

---

## Epic 8 — E-ticket + Notifications

**Delivers:** success/e-ticket + QR + download/share + native & web push. **P0. Deps:** E7.

#### RBT-070: Success page + order summary

Type: Story · P0 · M · Deps: RBT-063

- AC1: verify PAID → order summary (orderId, qty, amount, masked buyer NIK). (FR-22)
- Skills: RN, contracts.

#### RBT-071: E-ticket QR + download/share

Type: Story · P0 · M · Deps: RBT-070

- AC1: `getTickets` → one card/ticket with QR (`react-native-svg`, no raw NIK); show each ticket's `categoryCode`, `attendeeName`, and masked attendee NIK on Success and in the My Tickets QR sheet; native file-system+share, web Blob/print.
- Skills: QR, platform file adapters.

#### RBT-072: Native notifications (`expo-notifications`)

Type: Story · P0 · M · Deps: RBT-004

- AC1: permission, token registration, required flows (expiry reminder, payment success, admission, event reminder); tap → deep link.
- Skills: expo-notifications, deep links.

#### RBT-073: Web push (service worker) — v1 mandatory

Type: Story · P0 · L · Deps: RBT-072

- AC1: service-worker + browser Notification/Push permission + web adapter behind shared notification flow; same required flows; feature-detect/degrade. (D8.2)
- Skills: web push, service workers.

---

## Epic 9 — Hardening (cross-cutting)

**Delivers:** a11y, perf/bundle budgets, flash-crowd load test, QA, release readiness. **P0/P1. Deps:** all.

#### RBT-080: Accessibility (WCAG 2.1 AA, web + native)

Type: Story · P0 · M · Deps: all feature epics

- AC1: WCAG 2.1 AA on web — contrast, focus order, keyboard nav, live regions on queue/timer/status changes; status never color-only (pairs with a label/icon).
- AC2: native screen-reader labels (VoiceOver/TalkBack) on interactive controls; reduced-motion honored across animated surfaces.
- AC3: automated a11y lint/axe pass in CI where feasible; manual checklist for the rest.
- Skills: a11y, RNTL, axe.

#### RBT-081: Performance + bundle budgets

Type: Story · P0 · M · Deps: RBT-033, all feature epics

- AC1: web budgets met — p75 LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 (mobile 4G profile); initial JavaScript **≤1MB gzip per route** enforced by CI.
- AC2: code-split transactional routes; lazy-load heavy deps; image/QR render without layout shift.
- AC3: debounced NIK checks + one-poller-per-session verified (no request storm).
- Skills: perf profiling, bundling, Web Vitals.

#### RBT-082: Flash-crowd load test (core risk)

Type: Story · P0 · L · Deps: RBT-042, RBT-050, RBT-054

- AC1: FE load-test baseline against a test BE — **50k public / 10k waiting / 1k checkout** concurrent; adaptive-polling `nextPollAfterMs` honored under load (no FE-induced storm).
- AC2: session-continuity ("jangan PHP") holds across refresh/background/kill at load; server-authoritative timer + idempotent hold verified under contention (no oversell observable from FE).
- AC3: results documented with pass/fail vs targets; regressions filed.
- Skills: load testing, perf, domain verification.
- **Highest-risk story in the project** — proves the no-oversell / flash-crowd NFR; keep it independently trackable.

#### RBT-083: QA suites — Playwright (web) + Maestro (native), local/manual

Type: Story · P0 · L · Deps: all feature epics

- AC1: Playwright web + Maestro native suites green **locally/manually** (NOT in cloud CI, per D6.5); cover the 13 acceptance scenarios (TESTING-STRATEGY §4).
- AC2: happy path (queue→hold→pay→e-ticket) + key edge cases (expiry, re-queue, payment failed/verifying) scripted.
- Skills: Playwright, Maestro, e2e.

#### RBT-084: Release readiness — OTA channels, rollback, release summary

Type: Story · P0/P1 · M · Deps: RBT-005, RBT-081, RBT-082, RBT-083

- AC1: EAS Update channels (`development`/`production`) + OTA-vs-native routing rehearsed; rollback path tested (per PIPELINE.md + D5.3).
- AC2: release summary/checklist wired; SEO output + bundle gates green on web release; go/no-go evidence collected for H5.
- Skills: EAS, GitHub Actions, release management.

#### RBT-119: Research and refactor the Expo client for clean code and separation of concerns

Type: Chore · P1 · XL · Scope: `apps/client` (web, iOS, Android)

> Post-H3 cross-cutting task. Execution authorized on 2026-11-04; G1/G2/G3 explicitly bypassed by the user. Do not invent or change BE contract assumptions.

- **AC1 — Research and analysis:** Research screen orchestration, screen-specific fragments, reusable components, styling, testing, SOLID, and Clean Architecture. Here, `fragments` means screen-local components, not React's `<Fragment>`. Record sources, structural/coverage/log baseline, risks, and verification plan.
- **AC2 — Preservation and branch:** Preserve unrelated work and use an isolated feature branch based on `develop`.
- **AC3 — Naming and folders:** Inventory filenames under `apps/client`, remove V2 filename prefixes and update imports/references. Give each component its own file/folder; screen-only UI belongs under its screen's `fragments`; reusable UI belongs under shared `components`.
- **AC4 — Screen responsibility:** Screens orchestrate data, state, actions, and composition. Fragments render screen-specific UI and may consume shared components. Put reusable UI logic in appropriate utilities without violating layer boundaries.
- **AC5 — Styling:** Remove inline styling. Prefer NativeWind; use named styles, factories, or animation styles for dynamic/platform-specific cases. Preserve output across platforms.
- **AC6 — Architecture and data:** Improve clean code/SOLID while maintaining inward-only Clean Architecture dependencies. Replace hardcoded dynamic values with authoritative data/config; preserve server-authoritative timers, guest access, payment boundaries, and current API behavior.
- **AC7 — Errors and warnings:** Resolve actionable errors/warnings; document remaining environment/external limitations with evidence, without suppressing logs.
- **AC8 — Coverage:** Target at least 90% coverage for each applicable file; report per-file metrics and scope. Identify generated/unmeasurable files and state their treatment explicitly.
- **AC9 — Behavior and visual verification:** Preserve behavior/output; retest screens, actions, and available happy/edge flows on web, iOS, and Android. Run typecheck, lint, relevant tests, and capture before/after evidence under `.genesis/evidence/RBT-119/`.
- **Organization interpretation:** “More than 1 component per file” means each screen composes multiple fragment components; each component declaration remains in its own file/folder.
- Skills: React, React Native, frontend design, testing/evidence, architecture, performance.

#### RBT-128: Align FE HTTP adapters with BE API

Type: Story · P0 · L · Deps: RBT-010, E5/E6/E7 ports

> Post-H3 integration task, tracked in [GitHub #165](https://github.com/tiket-sampai-nonton/rusuh-booking-mobile/issues/165). FE only. The FE branch is based on `develop`; the available BE repository currently has no `develop` branch, so its `main` implementation and OpenAPI contracts are the reference.

- **AC1 — Wire alignment:** FE paths, request bodies, headers, envelopes, and DTO mappings match current BE handlers/contracts across catalog, queue, booking, payment, auth, and tickets.
- **AC2 — Visitor identity:** Native requests identify as mobile and reuse the stored visitor token; web continues to use HttpOnly cookies without exposing visitor credentials to JavaScript.
- **AC3 — Safe composition:** Mock adapters remain the default and usable; real HTTP adapters remain selected only when `EXPO_PUBLIC_USE_MOCKS=false|0`.
- **AC4 — No invented contract:** Unsupported rich event description shapes and environment/backend gaps are documented; no BE code or BE-consumed contract assumptions are changed.
- **AC5 — Verification:** Targeted adapter tests, typecheck, and lint pass. Live read-only API checks and any blocked full-flow verification are recorded in `api-contract/07-11/INTEGRATION-RBT-128.md`.
- **Skills:** No added dependencies; TypeScript/Expo integration and repository workflow.

---

## Ad hoc Follow-up

#### RBT-140: Cross-platform readiness, payment recovery, and documentation alignment

Type: Task · Priority: P1 · Size: XL · Deps: current payment/BE contract review

**Execution note:** implementation was authorized. Work was based on `origin/develop` at `4e1231f795c48bb2f3ac82d2a97d0d151027b61f` on `fix/RBT-140-cross-platform-readiness`. Commits `becedb7` and `57f2eb9` were pushed; PR [#198](https://github.com/tiket-sampai-nonton/rusuh-booking-mobile/pull/198) merged into `develop` at `dac991be87ecb2f89b2a77767abee330967e6709` on 2026-11-13. No issues were closed.

- AC1: Run web Lighthouse against the current app and make all applicable category results green; save the report and summarize any environment-dependent limits.
- AC2: Review every file under `.genesis/docs/` against the current source and approved decisions. Update documentation that has drifted. When implementation conflicts with an authoritative project decision, follow the documented escalation rule and record the conflict instead of silently rewriting the decision.
- AC3: Inventory open GitHub issues, classify whether this task resolves them, and prepare proposed closure and exception lists. Do not close issues until the user separately confirms the closure scope.
- AC4: In Home and Browse filters, selecting a category replaces the `SEMUA` pill. Show the selected category, waktu, urutan, and `HAPUS PENYARINGAN` in one same-height row; preserve usable behavior on narrow screens.
- AC5: Native payment page Back before SNAP requests the BE cancellation endpoint and reconciles the returned/current payment status before choosing the next route.
- AC6: On native cold start after the app was closed during payment, restore the saved payment reference, query BE status, and resume the payment route only when the BE confirms the payment is still resumable. Route terminal or expired states appropriately.
- AC7: On a normal SNAP close/back event in native, request cancellation when the BE contract permits it and reconcile status. Do not treat force-closing the app as a guaranteed cancellation callback.
- AC8: Apply equivalent recovery behavior on web for internal Back, SNAP close, page refresh, and a later browser reopen. Treat unload/page-hide cancellation as best effort; use persisted references and BE status reconciliation for reliable recovery.
- AC9: Confirm whether an existing payment attempt can reopen SNAP or needs a new page token using the current BE contract. Implement only supported behavior; document any BE or provider limitation as a blocker.
- AC10: Handle airplane mode and signal loss during checkout, the payment page, and SNAP on web and native. Preserve the resumable journey and user input, show a clear connection state, and retry/reconcile safely after connectivity returns. While the server-authoritative checkout/payment timer remains valid, let the user continue without duplicating booking, payment-attempt, or cancellation actions. If the BE reports expiry or a terminal payment state, route accordingly.
- AC11: Verify the payment, connectivity-recovery, and filter flows on web and native, capture task evidence, and report successful paths, failures, and lifecycle cases that cannot be guaranteed by the client.

**Proposed solution and execution details**

1. **Branch and baseline.** Fetch `develop`, create a task branch from its current head, and preserve any existing work. Record the baseline commit, environment, known issues, and current web/native behavior before changing code. (Completed: branch `fix/RBT-140-cross-platform-readiness`, base `4e1231f795c48bb2f3ac82d2a97d0d151027b61f`.)
2. **Lighthouse (AC1).** Run Lighthouse against a production-like web build with documented URL, device profile, network settings, and repeatable data. Record baseline Performance, Accessibility, Best Practices, and SEO scores; target green (90 or above) for each applicable category. Fix the highest-impact findings, rerun under the same conditions, and save before/after reports. Report external API or environment limitations rather than hiding them.
3. **Documentation (AC2).** Inventory every file under `.genesis/docs/`, compare routes, architecture, contracts, configuration, flows, security, and operational steps with the current implementation and approved decisions, then record discrepancies. Update stale descriptions and cross-references; identify decisions where the code violates the authoritative docs and escalate as required. Verify links and avoid exposing secrets or personal data.
4. **GitHub issues (AC3).** List open issues, inspect their status and dependencies, and produce a proposed closure list and an exceptions list. Do not close any issue during this task; report the inventory and ask the user to confirm closure scope separately.
5. **Filter row (AC4).** Derive the pills from the same applied filter state used by Home and Browse. When a category is selected, display it in place of `SEMUA`; place category, waktu, urutan, and the clear action in one row with consistent height. Keep the row usable on small screens with horizontal scrolling where needed. Verify default, selected, cleared, and Home-to-Browse states on web and native.
6. **Contract and cancellation (AC5, AC7, AC9).** Inspect the current BE contract and deployed behavior for `POST /booking-sessions/{sessionId}/cancel`, `POST /bookings/{bookingId}/cancel`, payment page/status, and attempt creation. Determine which resource exists at each step and confirm authentication, idempotency, error responses, and payment-versus-cancellation races. Route a confirmed payment-page exit or normal SNAP close through the appropriate use case and port, show progress, reconcile the returned/current status, and offer recovery if the result is unknown. A successful payment takes precedence over an assumed cancellation.
7. **Native restore (AC6, AC9).** Persist only the minimum non-sensitive journey references using the existing platform storage architecture, and ensure the required visitor/auth context can be restored. On cold start or return to foreground, query the BE before choosing a route. Resume an eligible payment page, expose `Kembali ke SNAP` only when the active attempt can be reopened, and route paid, cancelled, or expired journeys to their proper screens. Clear stale references after a confirmed terminal outcome. Verify whether the provider URL is reusable or requires a fresh token; record any contract gap.
8. **Web lifecycle (AC8).** Use the same server reconciliation for refresh and later reopen, with persistent references scoped to the current user or visitor. Handle an explicit in-app Back or SNAP close through the normal cancellation flow. Browser unload/tab close is best effort only; on return, query the BE instead of assuming cancellation. Ensure expired or terminal journeys do not redirect back into payment.
9. **Connectivity recovery (AC10).** Detect loss and return of connectivity on checkout, payment, and SNAP; show a human-readable offline state and preserve the current screen and permissible input. Do not automatically cancel just because connectivity is lost. When online again, re-fetch the server clock and authoritative session/payment status before retrying or resuming. Reuse the same idempotency key for an uncertain action, avoid parallel retries, and show a clear expired or terminal state when the BE says the timer ended. Keep raw NIK out of persistent storage; any NIK held in memory may need re-entry after a process restart. SNAP and server actions require a working connection.
10. **Verification and evidence (AC11).** Exercise web plus available Android and iOS devices across explicit Back, normal SNAP close, app/tab close and reopen before and after SNAP, payment success racing with cancellation, offline/reconnect, retry, expiry while offline, and repeated reopen. Check API calls, status transitions, duplicate prevention, user messages, and filter behavior at mobile and desktop widths. Capture sanitized recordings/screenshots and API/status evidence without raw NIK, tokens, or payment credentials; save Lighthouse reports and document platform or BE limitations.

**Clarification before issue closure:** confirm whether “all GitHub issues” means every open repository issue, including unrelated or incomplete work, or only issues verified as resolved. Do not close unrelated or incomplete issues without that confirmation.

**Execution status — 2026-11-13:** Filter persistence, payment recovery/cancellation reconciliation, connectivity feedback, lazy web event-card images, checkout rule separation, and documentation updates were implemented. Both commit hooks passed: checkout group (31 suites / 298 tests) and recovery group (15 suites / 168 tests). PR #198 passed all required checks and merged to `develop` at `dac991be87ecb2f89b2a77767abee330967e6709`. A source-wide architecture review of 696 TypeScript/TSX files found no Clean Architecture boundary violations; lint enforces the documented import direction. Web verification passed for 9 public routes, 17 transactional routes, SEO artifacts, and gzip budgets. Desktop Lighthouse scores are all 90+; mobile Lighthouse Performance is 67–76, so AC1 remains unmet. Android emulator and iOS Simulator evidence is saved under `.genesis/evidence/RBT-140/`; payment lifecycle, SNAP, airplane-mode, and reconnect scenarios were not completed end to end on physical devices. See `AS-BUILT-ALIGNMENT-2026-11-13.md` for score tables, test details, issue inventory, architecture review, and blockers. No issues were closed.

#### RBT-141: E-ticket redesign, PDF export, logout cleanup, and component organization

Type: Task · Priority: P1 · Size: L · Deps: merged develop (`dac991be87ecb2f89b2a77767abee330967e6709`)

> Tracked in [GitHub #199](https://github.com/tiket-sampai-nonton/rusuh-booking-mobile/issues/199). FE only. Implement on `feat/RBT-141-eticket-pdf-component-structure`, branched from the `develop` head containing merged RBT-140.

- **AC1 — E-ticket presentation:** Redesign the e-ticket detail to follow the user-provided reference on web, Android, and iOS. Present event title, attendee name, masked NIK, ticket category, date, time, venue, QR, and ticket reference with responsive dimensions and no clipping. Keep the QR and essential ticket data readable when printed or exported.
- **AC2 — PDF download:** The download action must produce a valid PDF, never an HTML file renamed as a ticket. Verify the document opens, includes the same ticket details and QR, and behaves appropriately on web and both native platforms.
- **AC3 — Logout data cleanup:** Clear app-owned persisted authentication, profile/PII, checkout, queue, payment, and user-scoped cache/state on logout across web and native. Use the supported server logout operation for HttpOnly cookies where the FE cannot clear them directly. Do not retain raw NIK or credentials after logout. Preserve only explicitly non-user-scoped application preferences if the storage architecture requires them, and document that boundary.
- **AC4 — Icon component name:** Rename `presentation/components/ArrowIcon` to `presentation/components/Icon`, update exports and all imports/usages, and preserve current icon visuals and behavior.
- **AC5 — Component directory layout:** Move each component directory directly under `presentation/components/`; e.g. `components/design-system/BottomNav` becomes `components/BottomNav`. Update every import and remove the old `design-system` nesting without duplicate implementations or case-sensitive path regressions.
- **AC6 — Architecture and regression:** Keep rendering and interaction composition in presentation, business rules in domain/application, and persistence/adapters in infrastructure. Add/update focused tests, run typecheck/lint/relevant tests, and verify ticket details, PDF export, and logout cleanup on available platforms.
- **AC7 — Native-change OTA notification:** When the release workflow detects a native-affecting change and skips OTA, Telegram must headline the outcome as `NATIVE BUILD REQUIRED` and must not report the release as `SUCCESS`. OTA-disabled runs must be identified as partial releases.
- **Reference:** User-provided e-ticket design image in the task conversation.

**Contract finding for payment lifecycle:** the current BE `POST /bookings/{bookingId}/cancel` refuses cancellation after payment lock while an attempt is active. The current public Payment API has no separate cancel-attempt endpoint. In that state, FE must reconcile and offer resume/status recovery; a true SNAP cancellation requires BE contract support. Do not call booking cancel and claim SNAP was cancelled.

## Milestones

- **M1 — Walking skeleton** (E1 + E2): app boots, typed API + clock + idempotency + mock, CI green.
- **M2 — Discovery** (E3 + E4): auth/profile + Home/Browse/Event + SEO.
- **M3 — Booking spine** (E5 + E6): queue → admission → checkout → hold (the core "jangan PHP" path).
- **M4 — Pay & deliver** (E7 + E8): Midtrans payment + verify + e-ticket + notifications.
- **M5 — Release-ready** (E9): a11y/perf/load/QA + OTA/rollback → production.

## Parallel Work Opportunities (disjoint files)

- **Batch A (after E2):** E3 (auth, `presentation/screens` + feature folders), E4 (events), E5 (queue) — file-disjoint feature areas, shared only via `src/domain` + `src/application` (frozen interfaces).
- **Batch B (after E6):** E7 (payment) sequential on booking; E8 notifications (RBT-072/073) can start in parallel with E7 since they only need the DI port.
- **Serialize:** anything touching `src/domain` state machines or `src/domain/repositories` ports (shared writers) — land interface changes first.

## Risk Register

| Story           | Risk                                                                                                                            | Impact | Mitigation                                                                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| RBT-041/042     | Queue correctness + no request storm under flash crowd                                                                          | H      | Domain unit tests + load test (RBT-080); honor nextPollAfterMs; one poller/session                                                                                            |
| RBT-061/062/065 | Payment WebView rollout requires the matching `/pay/[bookingId]` route on the configured site, plus device-level cookie/SNAP QA | M      | `PaymentRepository` owns token exchange; deploy the web route before testing native handoff. Confirm cookie persistence and callback routing on physical iOS/Android devices. |
| RBT-073         | Web push browser support/permissions                                                                                            | M      | Feature-detect + graceful degrade; test across browsers                                                                                                                       |
| RBT-050/054     | Hold/timer race on refresh/expiry                                                                                               | H      | Server-authoritative only; reconcile with BE; acceptance scenarios 1/3/6                                                                                                      |
| O1 FE-NEED gaps | BE endpoints not delivered in time                                                                                              | M      | Mock adapter keeps FE unblocked; track delivery                                                                                                                               |

## Out of Scope (FE build)

| Item                                                                 | Reason                                                                                                                            |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| BE services (Queue/Booking/Payment/Notification/User impl)           | Other team                                                                                                                        |
| Stock atomicity, queue fairness enforcement                          | BE (NFR-04/05)                                                                                                                    |
| Payment card/instrument entry (card no., CVV, VA auth, e-wallet PIN) | Happens on Midtrans SNAP hosted page — PCI out of scope (D7.3). FE builds only the method-selection page + summary + timer (D10). |
| Admin/back-office                                                    | Out of scope (requirement §2)                                                                                                     |

## Tracking

States: Backlog → To Do → In Progress → QA → In Review → Done. Labels: `blocked`, `needs-spec`, `needs-review`, `tech-debt`.

---

**GATE H3 — Task verification.** ✅ **PASSED 2026-10-29 (user: "split it, approve as is").** Epic 9 split into per-concern stories (RBT-080…084); flash-crowd load test (RBT-082) surfaced as the independently-tracked highest-risk story. Breakdown: 9 epics / 44 stories, FR/BR/NFR traceable, deps + critical path sound. → Phase 4 (Skills & Rules).
