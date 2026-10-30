# PHASE 1 — Grooming Agenda (for Gate H1)

> Prepared questions + **Critical Advisor** challenges, organized by the 10 GENESIS grooming sections.
> At H1 I will NOT just collect answers — I'll challenge weak choices, flag the contradictions below,
> and propose alternatives with tradeoffs. Decisions get captured into a grooming-decisions doc that
> becomes the source of truth for Phase 2 generation.
>
> **Priority flags:** 🔴 = blocking (must resolve to proceed) · 🟡 = important · ⚪ = clarifying
> Codes U1–U18 reference unknowns in `PHASE-1-REQUIREMENT-ANALYSIS.md §8`.
>
> **⭐ GOVERNING ARCHITECTURE (user, 2026-10-29):** `/Users/rizkyrachmawan/MyProject/telkomsel/assessment/ticketing/.genesis/docs/ARCHITECTURE.md` — a *locked* FE architecture ("Grand Architecture — Expo Universal", dated 2026-10-28). It is **authoritative for stack + architecture** and resolves almost every Section 2/3/4/5/7/8/9/10 grooming item below. In Phase 2 this is adopted largely **as** the `ARCHITECTURE.md` deliverable (verify + fill any gaps, don't re-invent). Source-of-truth order it declares: PDF → OpenAPI contracts → FE-BE-align → FE-Flow-Diagrams → prototype V5.

---

## Resolved decisions (user, 2026-10-29) — carry into grooming

- ✅ **C1 — NIK mandatory. RESOLVED.** NIK always required (no NIK-less path). One buyer NIK reserves up to 3 tickets/event; **each of the 3 tickets carries an attendee NIK**; the buyer's NIK may be the attendee on **exactly one** ticket. Quota of 3 enforced per buyer-NIK per event, atomic, across sessions/devices.
- ✅ **C2 — Timers BE-configurable. RESOLVED.** Booking TTL (~5 min) and payment TTL (10 min) are backend config values, not hard-coded. FE renders server `expiresAt`/`serverTime` (server-authoritative). PDF's 5/10 min are defaults.
- ✅ **Q1.1 / U17 — DELIVERABLE = RUNNING PRODUCTION SYSTEM (option B). RESOLVED.** Not a docs-only package. The prototype V5 is reference-for-UX, not the deliverable; a real FE must be built.
- ✅ **SCOPE BOUNDARY — FRONT-END ONLY. RESOLVED (2026-10-29).** This team delivers the **FE production app**. The **Backend is delivered by another team.** Consequences:
  - BE OpenAPI contracts (`.genesis/docs/api-contract/`) + `.genesis/docs/FE-BE-align-contract.md` are the **integration contract we consume**, not something we implement. We own FE conformance to them.
  - **FE stack is LOCKED & CONFIRMED (user, 2026-10-29)**: **Expo + React Native** (Android/iOS) + **React Native Web** (web), **Clean Architecture**, shared **TypeScript** domain/use-cases, **Zustand**, platform adapters. One codebase, three targets. (`.genesis/docs/FE-Flow-Diagrams.md` is authoritative on this.)
  - BE-owned concerns move **out of our build scope** → they become **dependencies/assumptions we rely on**, not blockers we resolve: BE language/data-store/cache/queue, the stock-atomicity mechanism (NFR-04), BE auto-scaling (NFR-03), server-side token issuance/validation internals, email provider.
  - The **FE-NEED gaps** are **already formally requested to the BE team (user, 2026-10-29)**: `POST /booking-sessions/{id}/buyer`, anonymous `JoinRequest`, `remainingTickets`, `EventDetail.description` JSON, profile-complete indicator on `verify`. Track them as **external dependencies with a status** (requested → committed → delivered), not FE build items. Until delivered, FE uses the prototype mocks behind an adapter.
  - NFRs we **own** (FE-side): NFR-01/02 UX + "jangan PHP" continuity, NFR-05 fair display of position, NFR-06 p95<1s *perceived* (adaptive polling, render perf), NFR-07 token handling on the client, NFR-08 platform-agnostic consumption. NFRs we **depend on BE for**: NFR-03/04/09/10.
- ✅ **CI/CD = GitHub Actions. RESOLVED & LOCKED (user, 2026-10-29).** Reference pipeline: `/Users/rizkyrachmawan/MyProject/telkomsel/assessment/ticketing/.genesis/docs/PIPELINE.md` (copied into this workspace 2026-10-29; the sibling `assessment/tickets/` tree is stale and not used). Key facts to carry into Phase 2 (CI-CD doc) and Phase 4 (RULES/AGENTS):
  - CI: **GitHub Actions**; static quality: **SonarCloud** (new-code gate, **≥90% shared domain/application coverage**); package manager **npm** with committed `package-lock.json`.
  - Two environments: **`develop`** (EAS `development` channel + dev web host) and **`main`** (EAS `production` channel + prod web host/CDN). Feature branches → PR to `develop`; `develop` → PR to `main` (approval required).
  - **OTA vs native-build routing**: JS/asset-only changes ship via **EAS Update OTA**; native-affecting changes (native dep, Expo config/plugin, permissions, icons/splash, SDK/RN bump, WebView/payment/camera/biometric config) force a **native build**, never OTA.
  - Gates blocking merge: typecheck (TS strict), ESLint+Prettier, Jest+RNTL, `npm audit` (high/critical prod), SonarCloud. Web release adds SEO-output + bundle-budget checks (**public ≤300KB gzip, transactional ≤500KB gzip**).
  - **Contract validation is intentionally OUT of CI merge/OTA gates** (run locally/separate integration process).
  - Secrets: `SONAR_*`, `EXPO_TOKEN`, `EXPO_PROJECT_ID`, `EXPO_PUBLIC_API_URL`, signing creds, web-host creds. **Never** put NIK/payment/secrets/signing keys in the repo or in client-exposed `EXPO_PUBLIC_*`.
- ✅ **STACK + ARCHITECTURE = per Grand Architecture doc. RESOLVED & LOCKED (user, 2026-10-29).** The following grooming items are now **answered by `ARCHITECTURE.md`** (no longer open):
  - **Framework/UI/web/nav/lang/state/data/forms/anim** (Q4.1-4.2): Expo + React Native + React Native Web + Expo Router + TypeScript + **Zustand** (client/session/UI) + **TanStack Query** (server data) + **React Hook Form + Zod** + **Reanimated**.
  - **Architecture pattern** (Q2.1): **Clean Architecture + SOLID**, one shared TS core (domain → application → contracts/ports) + platform adapters; dependency rule points inward; `.web.tsx`/`.native.tsx` are escape hatches, logic never splits. **Single Expo app** `apps/client` with Clean-Architecture layers as folders `src/{app,domain,application,infrastructure,presentation,providers,shared}` (v2 — supersedes the 8-package monorepo); boundaries ESLint-enforced.
  - **Repo strategy** (Q2.4): **single repo, single Expo app**, Clean-Architecture layers as folders (structure defined).
  - **API conventions / idempotency / error / server-clock** (Q3.1/3.3/3.4/3.5): `{meta,data}` + `ErrorEnvelope`, OpenAPI-generated types, `Idempotency-Key` per-action reuse, `Retry-After`, `ServerClock` offset (code given). Confirmed server-authoritative.
  - **Security/PII** (Q7.1/7.2/7.4): never log full NIK/tokens/QR; native tokens in `expo-secure-store`, web secure cookie; treat client state as tamperable; mask NIK; clear checkout state on terminal; keep card entry on the provider page (stays out of PCI scope). *(Note: an explicit UU PDP retention/encryption-at-rest policy is still mostly a BE concern; FE side is covered.)*
  - **Testing/quality** (Q9.1/9.2/9.3): Jest+RNTL (cloud CI, ≥90% shared domain/app coverage via SonarCloud), MSW/fixtures for adapters, **Playwright (web) + Maestro (native) local/manual only — NOT in cloud CI**. WCAG 2.1 AA for web. 8 minimum acceptance scenarios defined.
  - **Scale numbers** (Q1.2): **FE load-test baseline = 50,000 concurrent public browsers / 10,000 waiting-room / 1,000 checkout**; web perf budgets p75 LCP ≤2.5s, INP ≤200ms, CLS ≤0.1; bundle ≤300KB/≤500KB gzip. (BE confirms final launch capacity/SLOs.)
  - **SEO** (new): public catalog/event pages **static or server-rendered** (`web.output: "static"` locked, `single` rejected); transactional screens client-rendered + `noindex`.
  - **Notifications scope**: native local/remote in scope (`expo-notifications`); **web push deferred from v1**.
  - **Delivery roadmap**: P0-P7 defined — useful seed for Phase 3 task decomposition.
- ⚠️ **Still to confirm at/after H1 (small):**
  - **AsyncStorage for non-authoritative drafts; SQLite out of scope for v1** — confirm acceptable.
  - **EAS vs "equivalent internal CI pipeline"** for native builds — the doc allows either; which one is the real target?
  - **UU PDP (Indonesian data-protection) explicit obligations** — any FE-facing retention/consent requirement beyond masking? (mostly BE, but confirm.)
  - **Payment method set** (Q9 in-flow): VA BCA/BNI/BRI/PERMATA + QRIS + GoPay, no credit card — still the agreed enum? (from prototype/contracts, not re-stated in ARCHITECTURE.md)

---

## ✅ H1 FINAL ANSWERS (user, 2026-10-29) — grooming converged

1. **Local persistence — CONFIRMED.** AsyncStorage for non-authoritative drafts/restore metadata; **SQLite out of scope for v1.**
2. **Native build service — EAS.** Not an internal pipeline. EAS Build/Submit/Update is the target.
3. **Payment = Midtrans SNAP (3rd-party hosted page). RESOLVED — scope-reducing.** FE does **not** build a payment page. Flow: FE calls create-attempt → **BE returns a Midtrans SNAP link** → FE opens it (web: redirect; mobile: WebView/in-app browser) → SNAP handles the entire payment UI → **two callbacks: success and failed** → FE **verifies status with BE** before rendering a result (never trusts the callback alone). **Consequences:**
   - The page-token / `rb_pay` / `POST /payment-page-sessions` WebView-reuse mechanism from the prototype/flow-diagrams is **NOT ours to build** — Midtrans SNAP *is* the reusable, consistent payment surface across web + mobile.
   - **FR-24 is satisfied by Midtrans**, not by a self-built reusable page. Still true that web & mobile share one payment experience without native UI rebuild.
   - PCI stays out of scope (card entry lives on Midtrans). Payment-method selection (VA/QRIS/GoPay) happens **inside SNAP**, so our earlier "method enum on our payment page" is moot — the FE just triggers the attempt; SNAP presents methods.
   - ⚠️ **SUPERSEDED 2026-10-29 (user: "follow the prototype"):** the two bullets above are no longer the decision. The FE **does** build the payment page with **method-bucket selection** (per prototype `payment.html`), then hands off to SNAP for instrument entry; **page-token WebView-reuse is back in FE scope**. See `GROOMING-DECISIONS.md` D10 (authoritative).
   - Open to confirm with BE: exact create-attempt request/response (does FE pass a method hint or none?), and the success/failed return URL shapes for web vs the mobile WebView.
4. **UU PDP / NIK privacy — CONFIRMED in scope.** FE renders the required consent before collecting NIK/email and masks NIK in display; treat NIK as sensitive PII (no raw NIK in logs/local storage/QR). (Detailed legal retention is BE/legal; FE obligations = consent + masking + no-leak.)
5. **Queue WAITING-vs-ADMITTED UX — per prototype V5.** Prototype is shared and agreed by both teams; FE routes on BE status exactly as V5 does (anonymous join → `WAITING` shows waiting room, `ADMITTED` auto-claims → checkout). No new UX to invent.
6. **"One active slot per customer" keying (BR-07) — RESOLVED (agreed recommendation).** Logged-in → key on **account/session token** (stable across devices); guest → key on **browser/visitor token** (`rb_visitor`/`X-Visitor-Token`). FE on re-join of the same event **restores the existing entry** (no duplicate, no error). Honest limit: a *guest* on two devices can't be matched until NIK at checkout; the atomic **NIK quota at booking (BR-02, BE-enforced)** is the final backstop. Enforcement is BE; FE routes to the live entry.
7. **Payment VERIFYING/REVIEW/UNKNOWN — handled by the 3rd party (Midtrans).** Verification happens on Midtrans' side; FE shows a "processing" state and polls `GET /payments/{id}/status` with backoff until BE returns a terminal `bookingStatus`, then renders success/expired. FE does not implement its own fraud/review logic.
8. **MVP scope — ALL IN for v1.** FR-09 ETA display: **in.** **Web push notifications: MANDATORY in v1 (user, 2026-10-29) — OVERRIDES the ARCHITECTURE.md deferral.** FE must build the web push path (service-worker + browser Notification permission + a web notification adapter) alongside native `expo-notifications`, behind the same shared domain notification flow. `ARCHITECTURE.md §6.1`'s "web notifications deferred from v1" is now superseded and must be corrected in Phase 2. `/browse` genre/province/time/sort filter: **in** (client-side until BE adds server filter params — tracked as FE-NEED dependency).
9. **Maintenance/degraded-state UX + SLA copy — CONFIRMED in scope.** FE designs maintenance/error/degraded states (e.g. prototype's "Kami segera kembali"). No specific SLA number mandated for display.

### Residual flags to raise at H2 (not blocking H1)
- **#8 web push — RESOLVED.** Web push is **mandatory v1**; ARCHITECTURE.md §6.1 deferral is superseded and will be corrected in Phase 2. Native + web push both in v1.
- **#3 Midtrans contract detail — TRACKED (discuss with BE later, user, 2026-10-29).** create-attempt request/response + web-vs-mobile return-URL shapes to be confirmed against the Payment Service contract in a later BE discussion. Carried into Phase 2 as an open **external dependency**, not a blocker. FE builds against the current contract + prototype mock behind an adapter until pinned.

**GATE H1 STATUS: ✅ PASSED (user, 2026-10-29).** All blocking + important items answered; the two residual flags are resolved (#8) or tracked as a BE dependency (#3). Proceed to Phase 2 (Documentation Generation), which largely *verifies + adopts* the existing ARCHITECTURE / FE-Flow-Diagrams / PIPELINE / contracts rather than generating from scratch. Phase 2 must also: (a) correct ARCHITECTURE §6.1 to make web push v1, and (b) track the Midtrans contract item as an open dependency.

## Contradictions to resolve FIRST (blocking)

- ✅ **C1 — RESOLVED** (see above). NIK mandatory; 3 tickets each with an attendee NIK; buyer NIK usable on one.
- ✅ **C2 — RESOLVED** (see above). TTLs are BE-configurable; FE is server-authoritative on `expiresAt`.

---

## Section 1 — BUSINESS

- ✅ Q1.1 (U17): **RESOLVED — deliverable is a running production system (B).** See resolved-decisions block above. This promotes Sections 2, 4, 5, 7, 9 to blocking.
- 🔴 Q1.2: Expected concurrent users at a flash-crowd peak, and typical ticket inventory per event? NFR-03/06 depend on a concrete number. **(now blocking under B — load tests need real targets)**
- ⚪ Q1.3: Who are the end users beyond "Customer"? Any ops/support console needed (out of scope says no admin back-office)?
- 🟡 Q1.4: MVP boundary — is FR-09 (ETA, COULD) in or out of MVP? Anything else deferrable to Phase 2?
- 🟡 Q1.5 **(challenge)**: Compliance. Payment data touches PCI-DSS (NFR-07) and NIK is PII (Indonesian national ID). **Challenge:** NIK at scale is sensitive personal data — is there a UU PDP (Indonesian data-protection) obligation for storing/transmitting NIK, retention limits, or encryption-at-rest requirement? This must be known before the data model is designed.

## Section 2 — ARCHITECTURE

- 🟡 Q2.1 **(challenge, U12)**: The contracts are split into Queue/Booking/Payment/Notification/User services. **Challenge:** microservices for a 5-person team (2 BE) is real operational overhead — distributed transactions for the hold→pay→release saga, cross-service consistency for the NIK quota, more infra. A **modular monolith with clear internal boundaries** (same service names as modules) often ships the "jangan PHP" guarantee more reliably at this team size, and can split later. Is the service split a hard requirement or a logical decomposition? What's driving it?
- 🔴 Q2.2 (U13): Stock atomicity (NFR-04, no oversell). Options: (a) RDBMS with `SELECT ... FOR UPDATE` / conditional `UPDATE ... WHERE stock>0`; (b) Redis atomic counter / Lua; (c) distributed lock. Each has a failure mode under flash crowd. **What's the company tech-radar-sanctioned choice?**
- 🟡 Q2.3 (U13): Queue backing store — Redis sorted set? Kafka/stream? DB table? FCFS fairness + refresh-safe position + p95<1s drive this.
- ⚪ Q2.4: Repo strategy (mono-repo vs multi-repo) given web + mobile + 2 BE.

## Section 3 — DESIGN PATTERNS

- ⚪ Q3.1: API style — REST/JSON is mandated for payment (NFR-08). Same for all services? Envelope shape (the prototype uses `{meta, data}`) — adopt as the standard?
- 🟡 Q3.2 (U1/U2): Auth/session model. Prototype uses passwordless email OTP + an `rb_visitor` cookie / `X-Visitor-Token` for mobile. Is that the agreed auth, and how does the anonymous queue token relate to the authenticated identity and the NIK quota key (U8)?
- 🟡 Q3.3: Idempotency strategy (FR-25). Prototype uses an `Idempotency-Key` header on booking + payment-attempt. Confirm as the standard + the key-retention/dedup policy.
- ⚪ Q3.4: Error-contract pattern — per-endpoint `errorCode` + localized (Bahasa) message, as the prototype does?
- ⚪ Q3.5: Server-authoritative time (FR-19) — the prototype syncs a `serverTime` and computes `remainingMs` client-side. Confirm this is the approach for both countdowns.

## Section 4 — TECH STACK

- 🔴 Q4.1 (R3): What's on the **company tech radar**? Allowed/adopted languages, frameworks (BE + web + mobile), DB, cache, queue. Everything downstream is gated on this.
- 🟡 Q4.2: Web framework + mobile framework (native per-platform vs cross-platform). Note FR-24's WebView-reusable payment page affects the mobile choice.
- ⚪ Q4.3: Testing frameworks + the company's required coverage bar (R2 standards).
- ⚪ Q4.4: Build/package tooling.

## Section 5 — INFRASTRUCTURE

- 🟡 Q5.1 (U14, NFR-03): Cloud provider + compute model. Auto-scaling is required on the stateless layer — ECS/Fargate? K8s? Serverless? **Challenge:** match the orchestration weight to a 5-person team; don't adopt K8s+mesh unless the radar/ops capacity already supports it.
- ⚪ Q5.2: CDN/DNS for the web app and static assets.
- ⚪ Q5.3: Where do Redis/DB/queue run (managed services vs self-hosted)?

## Section 6 — CI/CD & DELIVERY

- 🟡 Q6.1 (R2): Company-standard CI/CD platform (GitLab CI? GitHub Actions? Jenkins?) — the prototype memory references `cicd-gitlab-ee.telkomsel.co.id`.
- ⚪ Q6.2: Environments (dev/staging/preprod/prod) and promotion/rollback policy.
- ⚪ Q6.3: Branch/PR conventions (will be captured in `TRACKING.md`).

## Section 7 — SECURITY

- 🔴 Q7.1 (NFR-07): Token protection for Detail/Payment pages — token type (opaque? JWT?), issuance (only after queue admission), TTL, and anti-replay. How is "cannot bypass the queue" enforced server-side?
- 🟡 Q7.2 (Q1.5 cont.): NIK handling — stored? hashed? encrypted? masked in responses (prototype masks it on success)? Retention? This is the biggest security/privacy decision.
- ⚪ Q7.3: Secrets management (payment keys, OTP provider, email provider).
- ⚪ Q7.4: PCI-DSS scope — confirm card data never touches our backend (gateway-hosted SNAP page keeps us out of scope); validate the WebView handoff doesn't drag us into PCI scope.

## Section 8 — OBSERVABILITY

- 🟡 Q8.1 (NFR-09): Required real-time metrics — queue depth/rate, admission rate, conversion rate, expired rate, oversell=0 invariant. What's the metrics/dashboard/alerting stack (radar)?
- ⚪ Q8.2: Logging + tracing standard (correlation across the queue→booking→payment→notification hop).
- ⚪ Q8.3: Alert thresholds + who's on call (ops).

## Section 9 — QUALITY

- 🟡 Q9.1 (R2): Coverage bar + static-analysis gate (SonarQube is referenced in project memory). Confirm the thresholds and whether it blocks the pipeline.
- 🟡 Q9.2: E2E / load-test expectations — flash-crowd is the core risk, so is a load test (k6/Gatling/JMeter) a required deliverable to prove NFR-03/04/06?
- ⚪ Q9.3: Performance acceptance — how is p95<1s (NFR-06) measured and signed off?

## Section 10 — OPERATIONS

- ⚪ Q10.1: SLA / uptime target (NFR-01 implies high availability but names no number).
- ⚪ Q10.2 (NFR-10): DLQ + retry policy for email; replay/reconciliation runbook for stuck holds and payment-callback mismatches.
- ⚪ Q10.3: DR / backup expectations for booking + payment state.
- ⚪ Q10.4: Incident response for the "stuck slot / oversell / double-charge" classes.

---

## Missing-NFR sweep (per GROOMING-PROTOCOL)

The requirement is unusually complete on NFRs (it already lists 10). The gaps I still need before designing: concrete **scale numbers** (Q1.2), **compliance obligations** for NIK/PII (Q1.5/Q7.2), and the **SLA/uptime number** (Q10.1). These are flagged as potential blockers.

---

## How H1 will run

For each section I'll ask the questions, and for every answer I'll: evaluate soundness → acknowledge if sound / challenge with 2–3 alternatives if risky / flag + quote both if it contradicts an earlier answer → not proceed on an unresolved 🔴. The captured answers + rationale become `GROOMING-DECISIONS.md`, which gates Phase 2.

**STOP — awaiting human to begin the grooming session.**
