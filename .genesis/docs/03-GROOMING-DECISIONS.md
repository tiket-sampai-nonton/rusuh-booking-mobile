# GROOMING-DECISIONS.md — Source of Truth

> Output of **Gate H1 (PASSED, 2026-10-29)**. Consolidates every decision from the grooming
> session. This document **gates Phase 2 documentation generation** — all generated docs must
> conform to it. Where code/prototype/contract contradicts a decision here, **this wins**
> (escalate, don't silently diverge). Open items are tracked explicitly at the end.
>
> **Upstream source-of-truth order:** requirement PDF → OpenAPI contracts (`.genesis/docs/api-contract/`)
> → `.genesis/docs/FE-BE-align-contract.md` → `.genesis/docs/FE-Flow-Diagrams.md` → prototype V5.
> **Governing FE architecture:** `/Users/rizkyrachmawan/MyProject/telkomsel/assessment/ticketing/.genesis/docs/ARCHITECTURE.md`.
> **CI/CD reference:** `/Users/rizkyrachmawan/MyProject/telkomsel/assessment/ticketing/.genesis/docs/PIPELINE.md`.

---

## D0 — Project framing

| # | Decision |
|---|----------|
| D0.1 | **Deliverable = running production system** (not a docs-only package). The prototype V5 is a UX reference, not the deliverable. |
| D0.2 | **Team scope = FRONT-END only.** The Backend is delivered by a separate team. BE OpenAPI contracts + FE-BE-align are a **consumed integration contract**, not our implementation. |
| D0.3 | Product flow: Event discovery → preview → waiting room → admission → buyer/NIK validation → ticket selection → booking hold → payment → e-ticket. |

## D1 — Business

| # | Decision |
|---|----------|
| D1.1 | Tender context: vendor expertise evaluation; documentation + AI-usage trail must be retained (requirement R5). |
| D1.2 | **Scale targets (FE load-test baseline):** 50,000 concurrent public browsers · 10,000 concurrent waiting-room clients · 1,000 concurrent checkout clients. BE confirms final launch capacity/SLOs. |
| D1.3 | **MVP = all-in for v1** (see D8 for the full feature list). |
| D1.4 | NIK is sensitive PII (16-digit national ID); privacy obligations apply (see D7). |

## D2 — Architecture (LOCKED — per ARCHITECTURE.md)

| # | Decision |
|---|----------|
| D2.1 | **Clean Architecture + SOLID.** One shared TypeScript core (UI → Application/use-cases → Domain → Ports/Contracts); dependency rule points inward. Domain/application must not import React, RN, Expo, browser globals, or native modules. |
| D2.2 | **Single Expo app, Clean-Architecture layers as folders (v2, 2026-10-30 — supersedes the 8-package monorepo).** One `apps/client` app; layers are folders under `src/`: `app` (Expo Router routes only), `domain`, `application`, `infrastructure`, `presentation`, `providers` (composition root), `shared`. No package split. Boundaries are **ESLint-enforced in the commit guard** (not package graph): ban React/RN/Expo imports in `domain/**` and `application/**`; justification comment required on any boundary `eslint-disable`. Routes contain no business logic/API calls. Revisit toward packages only if a second app or a shared BE contract package appears. See ARCHITECTURE §11.6 (D1). |
| D2.2a | **Composition root in `src/providers` (ARCHITECTURE §11.7, D2).** `src/app` = Expo Router routes only; `src/providers` holds manual DI `container.ts` + QueryClient + state + theme. No DI library. |
| D2.2b | **Server-data boundary: hook-seam + swappable `HttpClient` port (ARCHITECTURE §11.8, D3).** TanStack Query lives only in `presentation/hooks`; use cases/repositories are framework-free; HTTP client (axios/fetch) is swapped at the composition root. |
| D2.2c | **Styling = NativeWind; tokens from prototype V5 (ARCHITECTURE §11.9).** Single token source of truth = `apps/client/tailwind.config.js`; `presentation/theme` only re-exports values for non-className use. |
| D2.3 | **Platform split is presentation-only.** `.web.tsx` / `.native.tsx` / `.ios.tsx` / `.android.tsx` are escape hatches; **logic never splits**. One web + one native variant is the normal max; >~25% duplication triggers shared-primitive extraction. |
| D2.4 | **Backend is authoritative** for stock, queue order, ticket limits, holds, payment state, expiry. Client validation improves UX only; never replaces server checks. |

## D3 — Design patterns

| # | Decision |
|---|----------|
| D3.1 | API envelope `{meta, data}` + `ErrorEnvelope`; OpenAPI-generated TypeScript types/client. |
| D3.2 | **Server-authoritative clock** (`ServerClock` offset): `remaining = max(0, expiresAt − serverNow())`, `serverNow = deviceNow + (serverTime − deviceNow@sync)`. FE only displays; BE enforces. |
| D3.3 | **Idempotency-Key** generated once per user action, persisted with the resumable action/session, reused across refresh + network retry, cleared only on terminal result/abandon — for every contract-declared-idempotent mutation. For non-keyed mutations (queue join/claim), follow the endpoint reconciliation contract; never invent an unsupported header. |
| D3.4 | `Retry-After` honored for rate limits; identical reads deduped; exponential backoff on transient failure. |
| D3.5 | Error-code → user-facing (Bahasa) domain-error mapping; correlation IDs in logs with NIK/payment redacted. |

## D4 — Tech stack (LOCKED)

| Concern | Choice |
|---------|--------|
| App framework | **Expo** (SDK, Router, config plugins, dev builds) |
| UI | **React Native** |
| Web renderer | **React Native Web** (`.web.tsx` escape hatch) |
| Navigation | **Expo Router** (file-based, deep links, browser URLs, guards) |
| Language | **TypeScript** |
| Client/UI state | **Zustand** |
| Server data | **TanStack Query** (cache, retries, polling, mutation lifecycle) |
| Forms/validation | **React Hook Form + Zod** |
| Animation | **React Native Reanimated** (CSS/SVG/Canvas only for web-specific) |
| QR | `react-native-svg` + QR lib + platform export adapter |
| Notifications | `expo-notifications` (native) **+ web push (service worker) — v1, see D8.2** |
| Files | `expo-file-system` + `expo-sharing`; browser download fallback |
| Secure storage | `expo-secure-store` (native); secure cookie/session (web) |
| Local persistence | **AsyncStorage** (non-authoritative drafts/restore metadata). **SQLite out of scope for v1.** |
| Contracts | OpenAPI-generated TS types/client |
| Package manager | **npm** (committed `package-lock.json`) |

## D5 — Infrastructure / delivery

| # | Decision |
|---|----------|
| D5.1 | **CI = GitHub Actions; static quality = SonarCloud; native build/submit/update = EAS.** |
| D5.2 | Two environments + branches: **`develop`** (EAS `development` channel + dev web host) and **`main`** (EAS `production` channel + prod web host/CDN). Feature → PR `develop`; `develop` → PR `main` (approval required). |
| D5.3 | **OTA vs native-build routing:** JS/asset-only → EAS Update OTA; native-affecting (native dep, Expo config/plugin, permissions, icons/splash, SDK/RN bump, WebView/payment/camera/biometric config) → native build, never OTA. RN Web always ships via web deployment, never EAS OTA. |

## D6 — CI gates & quality

| # | Decision |
|---|----------|
| D6.1 | Merge-blocking gates: TS strict typecheck · ESLint + Prettier · Jest + RNTL · `npm audit --omit=dev --audit-level=high` · SonarCloud quality gate. |
| D6.2 | Web-release-only gates: Expo export SEO-output check (`single` rejected for public routes) · bundle budget **public ≤300KB gzip / transactional ≤500KB gzip**. |
| D6.3 | **Coverage: ≥90% shared domain/application** (SonarCloud new-code gate) unless explicitly waived. |
| D6.4 | **Contract validation is intentionally OUT of cloud CI merge/OTA gates** — run locally / separate integration process. |
| D6.5 | **E2E tooling local/manual only, NOT in cloud CI:** Playwright (web), Maestro (native). |
| D6.6 | Web perf budgets: p75 LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 (mobile 4G profile). **WCAG 2.1 AA** for web. |

## D7 — Security & privacy

| # | Decision |
|---|----------|
| D7.1 | **NIK consent + masking required.** FE renders required consent before collecting NIK/email; NIK masked in display; never log full NIK/tokens/QR; no raw NIK in local storage or QR payload. |
| D7.2 | Native tokens in `expo-secure-store`; web uses secure cookie/session. Treat all client state as tamperable. |
| D7.3 | **PCI out of scope** — card entry happens on the Midtrans SNAP hosted page, never our UI. |
| D7.4 | Clear checkout/session state on success, expiry, logout, or explicit cancellation. Validate deep-link params before rendering sensitive order data. |
| D7.5 | Never store NIK/payment/secrets/signing keys in repo or client-exposed `EXPO_PUBLIC_*`. |

## D8 — Scope & flows (v1 = all-in)

| # | Decision |
|---|----------|
| D8.1 | **Screens:** Home · Browse (URL filters) · Event detail · Waiting room · Checkout · Payment · Success · Expired/failed. Maintenance/degraded states in scope (e.g. "Kami segera kembali"). |
| D8.2 | **Notifications: native (`expo-notifications`) AND web push BOTH in v1.** Web push is **mandatory** — build service-worker + browser Notification-permission + web adapter behind the shared notification flow. **This overrides ARCHITECTURE.md §6.1's "web push deferred" — correct that doc in Phase 2.** |
| D8.3 | FR-09 ETA display: **in.** `/browse` genre/province/time/sort filter: **in** (client-side until BE adds server filter params — tracked dependency). |
| D8.4 | **Queue UX per prototype V5** (shared + agreed by both teams): anonymous join → `WAITING` shows waiting room with adaptive polling + zones; `ADMITTED` auto-claims → checkout. Refresh-safe via persisted token, revalidated with BE. |
| D8.5 | **Login is OPTIONAL (CORRECTED 2026-10-29, user).** A guest can browse, join the queue anonymously, and go all the way through checkout → payment → e-ticket without ever logging in. NIK/consent is collected **at checkout**, not gated behind login. Logging in only adds convenience (profile auto-fill, stable cross-device slot key). Nothing in the flow may force a login. The OTP/registration flow (name + NIK + consent) applies **when a user chooses to register/sign in**, and the same NIK+consent collection also happens inline at checkout for guests. |

## D9 — Domain rules (resolved)

| # | Decision |
|---|----------|
| D9.1 | **NIK mandatory** (no NIK-less path; FR-13 wins, BR-01's per-session clause void). One **buyer NIK** reserves up to **3 tickets/event**; **every ticket carries an attendee NIK**; the buyer's NIK may be the attendee on **exactly one** ticket ("Gunakan NIK pembeli", single-use). Quota of 3 enforced per buyer-NIK per event, atomic, across sessions/devices (BE). |
| D9.2 | **TTLs are BE-configurable** (booking ~5 min, payment 10 min are defaults/examples). FE renders server `expiresAt`/`serverTime`; never hard-codes. |
| D9.3 | **One active slot per customer per event (BR-07):** logged-in → keyed on account/session token; guest → keyed on browser/visitor token (`rb_visitor`/`X-Visitor-Token`). FE restores the existing entry on re-join (no duplicate/no error). Final backstop = atomic NIK quota at booking (BE). |

## D10 — Payment (FE payment page → Midtrans SNAP handoff)

> **CORRECTED 2026-10-29 (user):** "payment prototype is mocking, I think that's fine — **follow the prototype**." This REVERSES the earlier "FE builds NO payment page" read. The prototype V5 (`.genesis/prototype/Final/payment.html` + `snap.html`) is the authoritative UX/flow reference.

| # | Decision |
|---|----------|
| D10.1 | **FE DOES build the payment page** (per prototype `payment.html`): order summary (total == server `amountMinor`, **no service/hidden fee line**), **payment-method selection UI** (VA BCA/BNI/BRI/Permata · QRIS · GoPay — set driven by server `page.methods`, no credit card), and the server-authoritative 10-min timer (`paymentExpiresAt` + `serverTime`). |
| D10.2 | **"Bayar Sekarang" → `createAttempt(bookingId, method, Idempotency-Key)` → BE returns a SNAP `redirectUrl` → FE hands off to Midtrans SNAP** (web: redirect; mobile: WebView/in-app browser). SNAP (the 3rd-party gateway) owns the actual charge UI; the prototype simulates it with `snap.html`. **Two callbacks: success / failed** (`successReturnUrl` / `failedReturnUrl`) → result page → FE **verifies status with BE** (`GET /payments/{id}/status`). **Never trust the callback alone** — render PAID only on BE confirmation. |
| D10.3 | **Page-token WebView-reuse IS in prototype scope** (`POST /payments/{bookingId}/page-tokens` → `pageUrl` + one-time `pageToken` → `POST /payment-page-sessions {pageToken}` sets `rb_pay` cookie → the same FE payment page is reused in the mobile WebView). Timer stays server-authoritative across the handoff. This satisfies **FR-24** (consistent web+mobile payment page without rebuilding native UI). |
| D10.4 | Refresh-safe: if `page.currentAttempt.status==='PENDING'`, restore the selected method + SNAP redirect state. VERIFYING/REVIEW/UNKNOWN → FE shows "processing" and polls `GET /payments/{id}/status` with backoff to a terminal `bookingStatus`; no FE-side fraud logic. PCI stays out of scope — card/instrument entry happens on the SNAP page, never on the FE page (the FE page only selects the *method bucket* and shows VA number / QR when applicable). |
| D10.5 | **MOCK-FIRST behind the real architecture (user, 2026-10-29).** The BE payment service is still being built, so v1 ships a **mock `PaymentRepository` adapter**, NOT throwaway UI. The mock implements the **same `PaymentRepository` port** (`getPaymentPage`, `createAttempt`, `getPaymentStatus`, `createPageToken`, `snapCallback`) the production BE adapter will implement — Liskov-substitutable per ARCHITECTURE §SOLID-L. Everything above it (payment page UI, method selection, server-authoritative timer, create-attempt + SNAP handoff, verify loop, recovery) is **production code** built against the port; only the concrete adapter is a mock. The mock's data shapes mirror the OpenAPI contract + the prototype's `api.js` ({meta,data}, `amountMinor`, `paymentExpiresAt`+`serverTime`, `redirectUrl`, `successReturnUrl`/`failedReturnUrl`, `currentAttempt`). SNAP itself is simulated by a local page equivalent to the prototype's `snap.html`. **Swap at the composition root** (one DI binding / `EXPO_PUBLIC_*` env toggle, per RBT-014) — integrating real BE later changes only the bound adapter, zero change to domain/UI/use-cases. Keep the mock adapter in `src/infrastructure/__fixtures__` (contract-shaped data in `src/shared/test-fixtures`) as the dev/demo default; production env binds the real adapter. |

---

## Open items tracked into Phase 2 (not blocking)

| # | Item | Owner | Status |
|---|------|-------|--------|
| O1 | **FE-NEED endpoints** already requested to BE: `POST /booking-sessions/{id}/buyer`, anonymous `JoinRequest`, `remainingTickets`, `EventDetail.description` JSON, profile-complete indicator on `verify`. | BE team | Requested — FE uses mock adapter until delivered |
| O2 | **Midtrans/payment contract detail** (per the follow-prototype model, D10): exact `createAttempt` request/response, web-vs-mobile `successReturnUrl`/`failedReturnUrl` shapes, **and the page-token endpoints** (`POST /payments/{id}/page-tokens`, `POST /payment-page-sessions`) the prototype uses for mobile WebView reuse. | FE↔BE | To discuss later (user, 2026-10-29). **BE payment service still in progress → FE ships a mock `PaymentRepository` adapter behind the real port (D10.5); swap to BE adapter at integration, no UI/domain change.** |
| O3 | **ARCHITECTURE.md §6.1 correction**: make web push v1 (per D8.2). | FE (us) | Do in Phase 2 |
| O4 | `/browse` server-side filter/sort params + event history/archive endpoint. | BE team | Tracked dependency |

## Phase 2 instructions derived from this document

Phase 2 **verifies + adopts** the existing strong material rather than generating from scratch:
- `ARCHITECTURE.md` → adopt as-is **except** correct §6.1 (web push v1). **Payment: FE DOES build the payment page (method selection) then hands off to SNAP — follow the prototype (D10).**
- `FE-Flow-Diagrams.md` → adopt; keep the payment sequence as the FE-page → `createAttempt` → SNAP-redirect → verify-with-BE model, **page-token WebView-reuse retained as FE scope** (D10.3), and reflect web push.
- `PIPELINE.md` → adopt as the CI-CD doc.
- OpenAPI contracts → adopt as API-CONTRACT; attach the O1/O2/O4 gap list.
- Still to GENERATE (thin or missing): DESIGN-SYSTEM, EDGE-CASES, SECURITY (from D7), OBSERVABILITY (FE-side), TESTING-STRATEGY (from ARCHITECTURE §9 + D6).
