# Attendee Check Repeats an Earlier NIK: Repro Analysis

**Date:** 2026-11-13
**Scope:** Read-only FE and local BE source analysis.
**Privacy:** Raw NIK values from the repro are intentionally omitted from this report. The screenshot shows `NIK_INVALID`; it does not show a sanitized request ID, request body, or session ID.

## Repro as Reported

1. Open an event and reach Checkout. The first attendee check sends value **NIK A**.
2. Cancel Checkout, re-enter the same event, and enter a different value **NIK B**.
3. An attendee-check request is observed again with the earlier **NIK A** (or a malformed variant), and the UI displays an uncaught `NIK_INVALID` error.

## What the Screenshot Confirms

The error stack points to the `attendee-checks` HTTP repository call through `useAttendeeCheck`. The BE returned `NIK_INVALID`; this is a request-validation response, not a BE-generated or substituted NIK. The screenshot does not include the request payload or session ID, so it cannot by itself prove whether the request was initiated in the old checkout or was sent from stale form state in the new checkout.

## FE Request Path

Checkout keeps ticket rows in component state. `CheckoutScreen` initializes `rows` once with an empty row. There is no reset of attendee rows when its `sessionId` prop changes. The attendee-check effect iterates over the current rows and calls the request function for every valid 16-digit entry.

`useAttendeeCheck` captures the `sessionId` used for a request. Its `request` callback changes when that session ID changes. Because the Checkout effect depends on `request`, a reused Checkout screen with a new session ID runs the effect again against its current rows. If those rows still contain the earlier attendee value, the FE can send **NIK A** under the new session ID even after the user entered **NIK B** elsewhere or expected a clean form.

There is also a pending-request case. The hook’s cleanup clears only its debounce timer; once the timer fired and the HTTP request started, it does not abort that request on Checkout exit or session change. A request launched in the first checkout can therefore complete after the user has cancelled and re-entered. In that case it should carry the first session ID, even if its response appears later in the device log.

The attendee-check hook has one debounce timer shared across all rows. When the effect loops over multiple rows, each call resets that timer, so only the last valid row in that effect pass is guaranteed to be scheduled. This can make the request selection surprising when several tickets are filled and can select a retained old row if it is last.

## Most Likely Cause and How to Distinguish It

The strongest code-level cause is **stale Checkout row state being reused across booking-session IDs**. A second plausible cause is a request already in flight from the cancelled Checkout. Both originate on the FE; the repository sends the `nik` argument it receives directly in `{ nik }` and does not recover an older value from the BE.

To identify which occurred in this exact repro, correlate a sanitized Chucker entry with:

- **Request session ID and start time:** the old session ID and a start time before cancellation indicate an outstanding request from Checkout 1.
- **Request session ID:** the new session ID paired with the earlier value indicates the new Checkout reused or retained old form state and submitted it again.
- **Request body:** compare only a redacted label/fingerprint such as `NIK A` or `NIK B`; do not copy raw NIK into a ticket, report, log, or screenshot.

The screenshot alone does not expose this correlation, so the exact originating request remains unproven. The state-reuse and in-flight-request paths are both present in the source and should be addressed.

## Separate Validation and Error-Handling Defects

The FE attendee-check gate uses a shape check: exactly 16 digits. The BE applies additional structural validation before it looks up the admission session, including valid province and birth-day encoding. Therefore a 16-digit string can pass the FE gate, be sent, and still correctly receive `NIK_INVALID` from BE.

The hook awaits the request in a `try/finally` but does not catch an API rejection. The caller invokes it with `void run(nik)`, so a BE validation response becomes an unhandled rejected promise. That matches the screenshot’s red “Uncaught Error” overlay. The API error should be mapped to field-level feedback and must not crash the screen.

## Recommended FE Corrections (Analysis Only)

1. Make checkout form and attendee-check state belong to a single `sessionId`. Reset rows, attendee-check results, pending state, and buyer-input-derived checks when the session changes; alternatively ensure a new session renders a fresh Checkout component.
2. Cancel the debounce timer on session change and cancel or generation-guard in-flight checks. Ignore responses from an older session so they cannot update the current form.
3. Scope debounce work by attendee row/input rather than one timer shared by the entire ticket list. Send checks only for the current effective value of the row that changed.
4. Catch attendee-check failures. Convert `NIK_INVALID` into a visible field-level validation message and show recoverable handling for network/server errors.
5. Align FE structural validation with the BE contract where appropriate; BE remains authoritative. Do not log or persist raw NIK.

## BE Assessment

No BE change is indicated by this evidence. The BE attendee-check use case validates the submitted value and returns `NIK_INVALID` before quota consumption when it fails structural validation. It then checks session ownership and session activity. The BE cannot explain why the FE submitted the earlier value; the FE request/state path supplies that value.

## Source References

### FE

- [Checkout screen state and attendee-check effect](../../../apps/client/src/presentation/screens/Checkout/index.tsx)
- [useAttendeeCheck hook](../../../apps/client/src/presentation/hooks/useAttendeeCheck.ts)
- [HTTP booking repository](../../../apps/client/src/infrastructure/api/http-booking.repository.ts)
- [FE NIK shape check](../../../apps/client/src/domain/rules/checkout.ts)
- [Checkout route](../../../apps/client/src/app/%28booking%29/checkout/%5BsessionId%5D.tsx)

### BE

- [CheckAttendee use case](../../../../rusuh-booking-be/services/booking/internal/booking/application/usecase/check_attendee.go)
- [BE NIK structure validator](../../../../rusuh-booking-be/services/booking/internal/booking/domain/valueobject/nik.go)
- [Attendee-check HTTP handler](../../../../rusuh-booking-be/services/booking/internal/booking/infrastructure/http/session_handler.go)

## Limits

This is a source-level analysis, not a live request replay. No raw NIK values were copied into this file. No application code was changed.
