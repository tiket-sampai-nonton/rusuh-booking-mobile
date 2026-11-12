# EDGE-CASES.md — Rusuh Booking Tiket (FE)

> GENESIS Phase 2 output. FE-side edge cases + required UX reaction. BE is authoritative; the FE
> **observes and reacts**, never reconciles inventory locally. Error codes map to Bahasa messages (D3.5).
> Conforms to `GROOMING-DECISIONS.md`, `ARCHITECTURE.md`, `FE-Flow-Diagrams.md`.

> **Implementation status addendum (2026-11-12):** the live detail API now supplies rich event `description`; catalog-level `remainingTickets` remains optional/unavailable. Current payment WebView URL and retry handling are documented in the payment cases below.

## 1. Session / continuity ("jangan PHP") — D0, NFR-02

| Case | FE reaction |
|---|---|
| Refresh / app backgrounded during waiting | Re-hydrate `entryId`+`queueToken` from persistent storage, revalidate with BE; position restored, **not reset** |
| Refresh during checkout | `GET /booking-sessions/current`; `expiresAt` NOT reset — countdown continues from server deadline |
| Device switch mid-flow (logged-in) | Session keyed on account token; restore on the new device |
| Device switch mid-flow (guest) | Visitor-token-scoped; guest cannot restore across devices — honest limit, NIK quota at booking is backstop (D9.3) |
| Transient network error | Retry with backoff (honor `Retry-After`); show recoverable state, never a dead-end while hold is alive server-side |
| Clock skew / device clock changed | `ServerClock` offset recomputed; timer cannot be cheated or drift (D3.2) |

## 2. Queue — FR-04..10, NFR-05

| Case | FE reaction |
|---|---|
| `ADMITTED` immediately (no queue, FR-05) | Skip waiting room, auto-claim → checkout |
| `WAITING` | Waiting room, adaptive polling (`nextPollAfterMs`), zone coloring |
| Position reaches front | Auto-claim (no button); only `ADMITTED` authorizes, position 0 alone does not |
| `TURN_MISSED` (admission token TTL 60s lapsed) | Error state → re-queue or pick another event |
| `EVENT_SOLD_OUT` while waiting | Error state → pick another event |
| `CLOSED` / `ENDED` | Sale-closed state |
| Re-join same event (2nd tab/device) | Restore existing entry; no duplicate, no error (D9.3) |
| User leaves queue (DELETE) | Confirm, then return home; slot released |
| `soldOut` flag mid-poll | Stop polling, show error state |

## 3. Checkout / NIK / hold — FR-11..19, BR-01/02, D9

| Case | FE reaction |
|---|---|
| No NIK provided | Cannot proceed (NIK mandatory, D9.1); block "Lanjut Bayar" |
| NIK wrong format (≠16 digit) | Inline validation error; block |
| Attendee NIK `ALREADY_REGISTERED` | Block that row |
| Attendee NIK `CHECK_LIMIT_REACHED` | Do NOT block (server validates final); show `checksRemaining` |
| Buyer NIK on >1 attendee row | Prevented: "Gunakan NIK pembeli" is single-use → disables on other rows (avoids `ATTENDEE_NIK_DUPLICATE_IN_ORDER`) |
| Quantity > stock / > 3 / accumulation > 3 | Disable/reject selection (FR-14) |
| `CATEGORY_UNAVAILABLE` on hold | Toast; refresh availability |
| `BUYER_QUOTA_EXHAUSTED` | Toast; explain 3-ticket cap reached |
| `QUANTITY_EXCEEDS_LIMIT` / `MIXED_CATEGORIES_NOT_ALLOWED` | Toast; correct selection |
| `SESSION_EXPIRED` (booking TTL) | Redirect `expired.html?reason=booking`; hold released, re-queue |
| Back button during checkout | Confirm-leave dialog ("you'll re-queue") before exit |
| Idle past booking TTL | Session cancelled server-side; FE shows expiry + exit (FR-18) |

## 4. Payment (Midtrans SNAP) — FR-20..25, D10

| Case | FE reaction |
|---|---|
| Pay → create-attempt → SNAP link | FE payment page (summary + method selection + timer) → `createAttempt` → open SNAP `redirectUrl` (web: redirect; mobile: WebView via page-token). Instrument/card entry on SNAP only |
| Success callback | Return → `GET /payments/{id}/status`; render success only if `PAID` (never trust callback alone) |
| Failed callback, booking still payable | `expired.html?reason=payment-failed` → retry (new attempt) |
| Payment deadline (10 min) passed | `expired.html?reason=payment`; stock released, expired email (BE) |
| `VERIFYING` / `REVIEW` / `UNKNOWN` | "Diproses" state; poll status with backoff; no FE fraud logic (D10.3) |
| Double "Bayar" tap | One `Idempotency-Key` reused → no duplicate attempt (D3.3) |
| Callback arrives but status still PENDING | Keep polling with backoff until terminal; show processing |
| User closes WebView without finishing | On return, re-check status; if still payable, allow retry |
| BE returns relative page URL (`/pay/{bookingId}`) | Resolve against `EXPO_PUBLIC_SITE_URL`; require HTTPS and same configured origin before mounting WebView |
| WebView cannot load payment page or token exchange fails | Show a retry action; native mints a fresh one-time token. The `/pay` bootstrap exchanges through `PaymentRepository` once and routes to payment only after success |
| WebView navigates to a non-site payment/callback URL | Keep the one-use token confined to the configured HTTPS `/pay/{bookingId}` URL; only route callbacks from the configured site origin and matching booking ID |

## 5. Success / tickets — FR-22

| Case | FE reaction |
|---|---|
| Status not yet `PAID` on success page | `BOOKING_NOT_PAYABLE` → back to payment |
| `qrPayload` missing | Error state; do not fabricate a QR |
| Mixed categories / attendees in one booking | Render each issued ticket with its own `categoryCode`, `attendeeName`, and masked attendee NIK; never infer a generic category |
| Download/print | Native: file-system + share; Web: Blob/print |
| Email not received (user concern) | Email is BE async (retry/DLQ, NFR-10); FE states e-ticket is also on-screen/QR |

## 6. Data / empty / degraded

| Case | FE reaction |
|---|---|
| Empty event list | EmptyState, no throw (defensive null-checks everywhere) |
| Broken image/asset | Fallback placeholder; (verify served content-type, not just 200) |
| BE maintenance / config empty | Maintenance state ("Kami segera kembali", D8.1) |
| Optional field absent (e.g. catalog `remainingTickets` or a rich-description subfield) | Degrade gracefully; rich event description parsing tolerates absent/malformed fields. The live detail response currently includes rich description; catalog remaining-stock availability remains a separate contract gap |
| Partial degraded service (one call 5xx) | Isolate; don't fail the whole page; retry that call |

## 7. Notifications — D8.2 (native + web push, v1)

| Case | FE reaction |
|---|---|
| Push permission denied | Degrade silently; in-app states still work; offer re-enable later |
| Web push unsupported browser | Feature-detect; fall back to in-app, no error |
| Notification tap | Deep-link to the relevant route; validate params before rendering sensitive data |

## 8. Security-adjacent (see SECURITY.md)

| Case | FE reaction |
|---|---|
| Tampered deep-link params | Validate before rendering order/NIK data |
| Direct access to Detail/Payment without admission | BE 401/403 (token-protected, NFR-07); FE routes to re-queue |
| NIK in logs/QR | Never — redact; mask in UI (D7.1) |
