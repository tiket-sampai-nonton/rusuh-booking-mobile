# RULES.md (Project) — Rusuh Booking Tiket (FE)

> GENESIS Phase 4 output. **Project-specific** rules that EXTEND the generic
> `.genesis/workflow/RULES.md`. Derived from `GROOMING-DECISIONS.md` (authoritative).
> Where a generic rule and a project rule disagree, the project rule wins for THIS project.

---

## Architecture & layering

- **MUST** keep domain/application layers free of React, React Native, Expo, browser globals, and native modules (dependency rule points inward). (D2.1)
- **MUST** put all routing-only code in `src/app`; features call use cases, never `fetch`/storage/native APIs directly. (D2.2)
- **MUST** implement each backend capability behind a focused port (`QueueRepository`, `PaymentRepository`, `ClockPort`, `NotificationPort`, `FileSharePort`, `HttpClient`); wire concretes at the composition root `src/providers/container.ts` (manual DI, no library). (SOLID-I, D2.2a)
- **MUST** enforce layer boundaries with ESLint in the pre-commit guard: ban React/RN/Expo/browser globals inside `src/domain/**` and `src/application/**`; any boundary `eslint-disable` needs a justification comment. (D2.2 / ARCHITECTURE §11.6)
- **MUST** keep TanStack Query only in `src/presentation/hooks` (the swap seam); use cases and repositories stay framework-free; the HTTP client (axios/fetch) is swapped at the composition root. (D2.2b / ARCHITECTURE §11.8)
- **MUST** style with NativeWind; the single token source of truth is `apps/client/tailwind.config.js` (from prototype V5), with `src/presentation/theme` only re-exporting values for non-className use. (D2.2c / ARCHITECTURE §11.9)
- **NEVER** split business logic across `.web.tsx`/`.native.tsx` — platform files are presentation/adapter escape hatches only. (D2.3)
- **MUST** extract a shared primitive when platform duplication exceeds ~25%.

## Server authority (the core guarantee)

- **MUST** treat the backend as authoritative for stock, queue order, ticket limits, holds, payment state, and expiry. Client checks improve UX only. (D2.4)
- **MUST** compute every countdown as `remaining = max(0, expiresAt − serverNow())` with `ServerClock` offset — **NEVER** count down from the device clock, and never hard-code a TTL. (D3.2, D9.2)
- **MUST** honor server `nextPollAfterMs` for waiting-room polling; one poller per session. (NFR-05)
- **NEVER** hard-code a poll interval or run more than one poller per session (flash-crowd protection). (RBT-042)
- **MUST** render a terminal/success state ONLY after BE confirmation (e.g. payment PAID via `GET /payments/{id}/status`) — **NEVER** trust a gateway callback alone. (D10.2/D10.4)

## Session continuity ("jangan PHP")

- **MUST** persist queue entry / booking session / payment state in durable storage and re-hydrate from the server on resume (refresh, background, kill, device switch). (NFR-01/02)
- **NEVER** drop the user to a dead-end error while the server-side hold is still alive — show a recoverable state and reconcile with BE.
- **MUST** generate an Idempotency-Key once per action, persist it, reuse across refresh/retry, clear only on terminal/abandon. (D3.3)

## NIK / booking rules

- **MUST** require a valid 16-digit NIK (mandatory, no NIK-less path); each ticket carries an attendee NIK; the buyer NIK is usable on exactly one ticket (single-use). (D9.1)
- **MUST** enforce max 3 tickets per buyer-NIK per event on the FE as UX guard, knowing BE is the atomic backstop. (D9.1)
- **MUST** restore the existing queue entry on re-join (no duplicate/no error); key slot on session token (logged-in) or visitor token (guest). (D9.3)

## Login / access

- **NEVER** force a login — browse, queue, checkout, payment, and e-ticket MUST all work for a guest. Login is optional convenience only. (D8.5)
- **MUST** collect NIK + consent inline at checkout for guests (same gate registered users pass at sign-up). (D7.1, D8.5)

## Payment (mock-first behind the real port)

- **MUST** build the payment page (summary, method selection VA/QRIS/GoPay, server timer) as **production code against `PaymentRepository`**; follow the prototype `payment.html`/`snap.html`. (D10.1, D10.5)
- **MUST** ship the mock `PaymentRepository` adapter behind the SAME port the BE adapter will implement (Liskov-substitutable); swap at the composition root via one DI binding / `EXPO_PUBLIC_*` toggle. (D10.5)
- **NEVER** collect a payment instrument (card no./CVV/VA auth/e-wallet PIN) on the FE — that happens on the Midtrans SNAP page (PCI out of scope). (D7.3, D10.4)

## Security & privacy

- **NEVER** log a full NIK, token, QR payload, or payment detail; mask NIK in display; no raw NIK in local storage or QR. (D7.1)
- **NEVER** store secrets/signing keys in the repo or in client-exposed `EXPO_PUBLIC_*`. (D7.5)
- **MUST** store native tokens in `expo-secure-store` and web tokens in a secure cookie/session; clear on success/expiry/logout/cancel. (D7.2/D7.4)
- **MUST** validate deep-link params before rendering sensitive order data. (D7.4)

## CI / delivery / quality

- **MUST** keep merge-blocking gates green: TS strict, ESLint+Prettier, Jest+RNTL, `npm audit` (high), SonarCloud. (D6.1)
- **MUST** keep ≥90% coverage on shared domain/application (SonarCloud new-code). (D6.3)
- **MUST** meet web budgets: bundle public ≤300KB / transactional ≤500KB gzip; LCP ≤2.5s, INP ≤200ms, CLS ≤0.1; WCAG 2.1 AA. (D6.2/D6.6)
- **NEVER** put Playwright/Maestro e2e or contract validation in the cloud CI merge/OTA gate — local/manual only. (D6.4/D6.5)
- **MUST** route native-affecting changes to a native build, JS/asset-only to EAS OTA; RN Web always ships via web deploy, never OTA. (D5.3)
- **NEVER** ship a public route rendered as `single` — public catalog MUST be static/server-rendered and indexable; transactional pages `noindex`. (D6.2)

## Cross-team dependencies

- **MUST** build FE-NEED gaps (O1) and the payment contract (O2) behind mock adapters against the agreed contract; **ASK**/flag BE, never invent an unsupported endpoint or header. (O1/O2, D3.3)
- **MUST** treat `GROOMING-DECISIONS.md` → OpenAPI contracts → FE-BE-align → FE-Flow-Diagrams → prototype as the source-of-truth order; escalate contradictions, don't silently diverge.

## ASK (stop for human)

- **ASK** before adding any new runtime dependency. (SKILLS-PROTOCOL)
- **ASK** before a pattern that significantly deviates from the locked stack (D4) or Clean-Arch structure (D2).
- **ASK** before relaxing a privacy/security rule (NIK handling, token storage, PCI boundary).
- **ASK** before changing a BE-consumed contract assumption rather than mocking against the current one.
