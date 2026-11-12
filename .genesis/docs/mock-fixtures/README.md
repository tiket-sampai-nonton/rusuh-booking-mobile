# Mock Fixtures — contract-faithful API responses

> GENESIS-produced mock data for the FE mock adapters (RBT-014 generic, RBT-065 payment).
> **Grounded 1:1 on** `.genesis/docs/api-contract/*.openapi.json` and
> `.genesis/docs/FE-BE-align-contract.md` — NOT the looser prototype `api.js`.
> When the real BE arrives, these are replaced by live responses; the `PaymentRepository` /
> other ports stay identical (D10.5). These fixtures are the *data*, not the adapter.

## Files

| File | Covers |
|------|--------|
| `user-queue.fixtures.json` | User Service (OTP, profile) + Queue Service (join, status, claim) |
| `booking-payment.fixtures.json` | Booking Service (catalog, session, hold, tickets) + Payment Service (page, attempt, status, page-token) |

Each key is `"<METHOD> <path> -> <httpStatus> (<note>)"` and its value is the exact response body.

## Conventions (read before using)

- **Envelope:** success = `{ "meta": {code,message}, "data": {...} }`. Error = `{ "meta": {code,message,"x-errorCode":"..."}, "data": null }` (matches `ErrorEnvelope`). `x-errorCode` is a fixture hint — the real contract conveys the code in `meta.message` / status; the FE error taxonomy (RBT-013) maps it to a Bahasa message.
- **Timestamps are placeholders** written as `<<now>>`, `<<now+10m>>`, `<<now+60s>>`, `<<past>>`. The mock adapter **must substitute real values at response time**: `serverTime = now`, and every `*ExpiresAt = now + TTL`. This is what makes `ServerClock` (RBT-011) math exercise correctly. On a *restore* call (`current`, payment `page` with pending attempt) **do NOT reset** `expiresAt`/`paymentExpiresAt` — reuse the originally-issued deadline (that's the whole point of server-authoritative timers).
- **Money:** every `*Minor` is integer IDR minor units (`35000000` = Rp 350.000). Render with the FE `minorToIDR` helper; never divide in the adapter.
- **NIK is always masked** in every response (`3174********0001`). No fixture ever contains a raw 16-digit NIK (D7.1).
- **UUIDs** are stable placeholders so cross-references line up (event ↔ session ↔ booking ↔ payment).

## Enums (from the contracts — keep in sync)

- Event status: `NOT_STARTED | AVAILABLE | SOLD_OUT | CLOSED`
- Queue entry status: `WAITING | ADMITTED | CLAIMED | MISSED | LEFT | SOLD_OUT | CLOSED | COMPLETED | ENDED`
- Queue zone: `GUARANTEED | POSSIBLE | NOT_ENOUGH`
- Booking status: `PENDING_PAYMENT | VERIFYING | PAID | EXPIRED | CANCELLED | REVIEW`
- Payment methods: `VA_BCA | VA_BNI | VA_BRI | VA_PERMATA | QRIS | GOPAY`
- Attempt status: `CREATED | PENDING | UNKNOWN | SUCCEEDED | FAILED | CANCELLED | EXPIRED | REFUND_REQUIRED | REFUNDED`
- Attendee check: `AVAILABLE | ALREADY_REGISTERED | CHECK_LIMIT_REACHED`
- Session phase: `SELECTING | EDITABLE | LOCKED | ENDED`

## Error-code catalog represented (for RBT-013 mapping)

`VALIDATION_ERROR, OTP_RESEND_TOO_SOON, OTP_INVALID, OTP_EXPIRED, OTP_LOCKED, RATE_LIMITED,
NIK_ALREADY_LINKED, NIK_INVALID, EMAIL_MISMATCH, NIK_ALREADY_IN_QUEUE, VISITOR_ALREADY_IN_QUEUE,
EMAIL_ALREADY_IN_QUEUE, BUYER_QUOTA_EXHAUSTED, EVENT_NOT_ON_SALE, EVENT_SOLD_OUT, TURN_MISSED,
ADMISSION_TOKEN_INVALID, SESSION_EXPIRED, NOT_FOUND, ATTENDEE_NIK_ALREADY_REGISTERED,
ATTENDEE_NIK_DUPLICATE_IN_ORDER, CATEGORY_UNAVAILABLE, IDEMPOTENCY_KEY_REUSED,
QUANTITY_EXCEEDS_LIMIT, MIXED_CATEGORIES_NOT_ALLOWED, BOOKING_LOCKED, BOOKING_VERSION_CONFLICT,
EDIT_LIMIT_REACHED, BOOKING_NOT_PAYABLE, PAYMENT_METHOD_UNAVAILABLE, PAYMENT_PROVIDER_UNAVAILABLE,
PAYMENT_PAGE_TOKEN_INVALID, DEPENDENCY_UNAVAILABLE, UNAUTHORIZED`

## Remaining FE-NEED (O1) gaps — mocked here

The supplied 07-11 machine-readable contract snapshot does **not** expose all of these; the fixtures model the expected shapes for deterministic offline use. Live runtime status is in `../AS-BUILT-ALIGNMENT-2026-11-12.md`:
- **Anonymous `JoinRequest`** — the contract's `JoinRequest` requires `buyerNik`+`email`+`emailConfirmation`+`consentNik`. The "fully anonymous, no-NIK join" FE-NEED is represented by the WAITING fixture; confirm final body with BE.
- **Set-buyer endpoint** (`POST /booking-sessions/{id}/buyer`) — not in the contract; buyer NIK currently rides on queue join. Mock treats buyer as already set on the session.
- **`remainingTickets`** on event detail — present on `StatusDocument` (queue) but not `EventDetail`; mock uses category `available`.
- **`EventDetail.description` JSON** — present in the live event-detail response and consumed by FE, but not modeled in the 07-11 OpenAPI snapshot; request an updated schema from BE.
- **profile-complete indicator on verify** — modeled via `account.hasNik` in the verify fixture.

## How the adapters consume this (RBT-014 / RBT-065)

1. Mock adapter implements the real port (`QueueRepository`, `BookingRepository`, `PaymentRepository`, …).
2. On each call it selects the matching fixture, substitutes `<<now…>>` placeholders, and returns it through the same `{meta,data}` unwrap the real transport uses.
3. The **SNAP simulator** (prototype `snap.html` equivalent) drives payment status transitions via the `local-simulator` scenarios (`SETTLE/SETTLE_LATE/EXPIRE/DENY/TIMEOUT/…`).
4. Toggle real↔mock at the composition root (`EXPO_PUBLIC_USE_MOCKS`). Integrating BE later changes only the binding — no UI/domain change.
