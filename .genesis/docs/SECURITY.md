# SECURITY.md — Rusuh Booking Tiket (FE)

> GENESIS Phase 2 output. FE-side security & privacy. Derived from `GROOMING-DECISIONS.md §D7`,
> `ARCHITECTURE.md §8`, requirement NFR-07. BE owns server-side auth, token issuance/validation,
> inventory integrity, and PCI processing; this doc covers what the **client** must do.

## 1. Threat posture

- **All client state is tamperable.** Never trust client-calculated price, stock, queue position, or expiry — BE is authoritative (D2.4). Client validation is UX only and is always re-enforced server-side.
- The FE amplifies nothing under load and leaks no sensitive data into logs, storage, URLs, or QR.

## 2. Authentication & tokens

| Concern | FE rule |
|---|---|
| Session/account token (logged-in) | Native: `expo-secure-store`. Web: `localStorage` for access + refresh tokens per the approved RBT-132 product decision; tokens are JS-readable and exposed to successful XSS. Prefer migrating to an HttpOnly cookie when the BE contract supports it. |
| Visitor token (guest) | `rb_visitor` cookie (web) / `X-Visitor-Token` (mobile), injected by the API client. |
| Admission token | Short-lived (TTL ~60s), used once to create a booking session; never persisted long-term. |
| Detail/Payment access | Token-protected server-side (NFR-07). FE cannot reach these without admission; a bypass attempt gets 401/403 → route to re-queue. |
| Token in URLs | Never put access/admission tokens in shareable URLs or logs. |

## 3. PII — NIK & email (D7.1, UU PDP)

- **Consent gate:** FE renders required consent before collecting NIK/email (D7.1).
- **NIK = sensitive PII (16-digit national ID).** Rules:
  - Never log full NIK (redact in correlation logs).
  - Never store raw NIK in AsyncStorage / localStorage / any non-authoritative client store.
  - Display **masked** NIK only (e.g. `3171********1234`); BE returns `nikMasked`.
  - Never embed raw NIK in the QR payload (QR comes from BE; FE renders as-is but must not add NIK).
- Email used for e-ticket delivery; treat as PII, mask in display where shown (`emailMasked`).
- Clear checkout/session/NIK state on success, expiry, logout, or explicit cancellation (D7.4).

## 4. Payment / PCI (D7.3, D10)

- **Card/instrument data never touches the FE.** The FE builds the payment page (order summary + **method-bucket selection** + timer) and hands off to the **Midtrans SNAP hosted page**, where the actual card number / VA auth / e-wallet PIN is entered. FE triggers create-attempt, opens the SNAP link, and verifies status with BE — it never collects or stores a payment instrument (PCI stays out of scope).
- This keeps the FE **out of PCI-DSS scope** — do not add any card-input UI.
- Verify payment outcome with BE (`GET /payments/{id}/status`) before rendering success; never trust the SNAP callback alone.

## 5. Transport & data handling

| Rule | Detail |
|---|---|
| HTTPS only | All API + SNAP traffic over TLS. |
| Redacted logging | Correlation IDs yes; full NIK / payment / tokens / QR payload never (ARCHITECTURE §5.1). |
| Deep-link validation | Validate `sessionId`/`bookingId`/`orderId`/`reason` params before rendering sensitive order data. |
| Idempotency | Keys generated client-side, reused per action (D3.3) — prevents duplicate mutating effects from retries/double-taps. |
| No secrets in client | Never store API secrets/signing keys/service-account JSON in repo or in `EXPO_PUBLIC_*` (those are client-exposed). Only non-secret config (e.g. `EXPO_PUBLIC_API_URL`) there. |

## 6. Secrets management (CI, from PIPELINE.md)

- `SONAR_*`, `EXPO_TOKEN`, `EXPO_PROJECT_ID`, signing creds, web-host creds live in GitHub Actions secrets / Expo credential store — never in the repo.
- `vulnerability_scan` gate: `npm audit --omit=dev --audit-level=high` + secret scanning block merge on high/critical (D6.1).

## 7. Web-specific

- Web push (D8.2): service worker scope limited; request Notification permission with clear intent; no sensitive data in push payloads.
- `noindex` all transactional/personal pages (waiting, checkout, payment, success, expired); never let a crawler see queue position, NIK, payment state, or ticket details (ARCHITECTURE §6.5).
- Standard web hardening: CSP, secure cookies, no mixed content, SRI for third-party scripts where applicable.

## 8. FE security acceptance checks

1. Full NIK never appears in logs, storage, URL, or QR (grep + runtime check).
2. Tampered deep-link params do not render another user's order.
3. Direct navigation to `/checkout`/`/payment` without admission is rejected and routed to re-queue.
4. Double-submit uses one idempotency key (no duplicate booking/attempt).
5. Session/NIK state cleared after terminal states and logout.
6. No card-input UI exists anywhere in the FE (PCI scope stays out).
7. `EXPO_PUBLIC_*` contains no secret.
