# Payment Timeout, Resume, and Cancellation Repro Analysis

**Date:** 2026-11-13
**Scope:** Read-only analysis of the current FE working tree and local BE `main` checkout.
**Repro cases:** Payment Back/resume, payment timeout/requeue, app restart after timeout, missing `/cancel` in Chucker, and inconsistent checkout/waiting recovery.

## Summary

The reported behavior is explainable from the current implementation. Payment recovery and queue recovery each have their own startup router, while the BE expires bookings and updates queue state asynchronously. Those paths can race and send the user to Payment, Checkout, Waiting, or Home depending on which status reads finish first.

Resuming an active payment without a notification is supported in principle: the FE stores the booking ID and has a Home recovery bridge that routes to `/payment/{bookingId}`. Push notification is an additional entry point, not a requirement. The current implementation is not deterministic because the queue bridge can also restore the same claimed journey and redirect to Checkout or Waiting.

The BE supports rejoining after the old queue entry has ended. The FE should reconcile the booking first, clear stale payment/queue recovery state after a terminal result, and offer the user a fresh queue entry. The BE timeout worker does not necessarily mark a booking expired at the exact displayed countdown time.

## Findings by Repro

### 1. Back from Payment, then reopen the same event

`PaymentJourneyRecoveryBridge` reads the persisted booking ID on Home and routes to Payment. Separately, `QueueMembershipBridge` restores a persisted claimed queue membership. If the claimed booking session can be restored, it routes to Checkout; if not, it routes back to Waiting, where the claimed-session recovery state can show “Sesi checkout tidak tersedia.” Both bridges can run from Home, so the last asynchronous redirect can override the other.

The payment screen also has a “Keluar, lanjutkan nanti” path for a booking that cannot be cancelled because an attempt has locked it. That path returns Home while keeping the booking reference. This makes Home recovery possible without a notification, but the stale claimed queue membership creates a competing redirect.

**Conclusion:** Non-notification resume is possible. Recovery should choose one authoritative destination: if the BE reports an active/verifying booking, route to Payment; do not restore the old claimed queue session as a competing Checkout route.

### 2. Payment timeout, then revisit the same event

The BE expiry worker first transitions an overdue `PENDING_PAYMENT` booking to `VERIFYING`, resolves the payment with Midtrans, and waits through its configured grace window. An unknown provider result keeps the booking and inventory held for another retry. Only a confirmed unpaid/no-attempt result after the grace period expires the booking.

After expiry, Booking writes a `booking.journey.ended` outbox event. The Queue service consumes that event asynchronously and marks the old claimed entry `ENDED`, releasing its active membership. The queue join script allows a new entry after the old entry is ended; a new join does not reuse the expired checkout session or admission.

Before that asynchronous queue update arrives, the old queue entry can still appear `CLAIMED`. The FE then tries to restore Checkout against a session that may already be expired or converted. The Waiting screen explicitly renders “Sesi checkout tidak tersedia” when the claim exists but no active session is returned.

**Conclusion:** Requeueing is supported by the BE once the old entry is ended. The FE should reconcile the booking, clear the stale queue pointer, and return the user to Home/event detail with an explicit “Masuk antrean lagi” action. If the queue projection is still catching up, the FE should show a recoverable status instead of routing into an unavailable Checkout.

### 3. Resume from notification, timeout, close, and reopen

The FE clears its persisted payment reference when it observes a terminal payment result. However, the payment-page endpoint rejects a booking that is no longer payable. If that request returns an error, the payment-page hook still has the booking ID saved, and the current mount path does not automatically reconcile status just because loading the page failed.

The BE payment-status endpoint is read-only and returns the booking/attempt state. It is the appropriate recovery read after a payment-page error. If the BE still reports `PENDING_PAYMENT`/`VERIFYING` past the client countdown, the FE should show that the server is checking the outcome and retry reconciliation. If the BE reports terminal state, the FE should clear payment, checkout, and queue references and route Home. The current terminal payment paths generally route to `/failed`; that differs from the requested Home outcome.

**Conclusion:** This is FE-fixable. A cold start or notification tap must not send the user back to an expired Checkout. On a non-payable page response, reconcile status, clear stale journey state when terminal, and route according to the product decision (the requested behavior is Home).

### 4. Where `/cancel` should appear in Chucker

There are two different FE cancellation requests:

| User action | Request | Expected behavior |
|---|---|---|
| Confirm leaving Checkout before payment | `POST /api/v1/booking-sessions/{sessionId}/cancel` | Releases the selection/admission session. FE sends it after the user confirms leaving Checkout. |
| Confirm leaving Payment or closing SNAP | `POST /api/v1/bookings/{bookingId}/cancel` | Cancels only when BE can establish that payment has not succeeded and the booking is not locked. A payment attempt may produce `BOOKING_LOCKED`; FE must reconcile rather than report cancellation success. |

When a payment attempt has already locked the booking, BE intentionally refuses this cancellation request. The FE checks payment status and preserves the booking if it is still active. The timeout worker performs payment resolution internally; timeout is not expected to create an FE `/cancel` request.

No cancellation request is guaranteed when the app is force-closed, the device is offline, or the user only opens the Back confirmation and chooses to stay. If the user confirms an online exit and Chucker still shows no matching request, inspect the exact interaction and native network instrumentation. A normal timeout or force-close alone is not evidence that the endpoint should have been called.

### 5. Why timeout sometimes leads to Checkout unavailable and sometimes Waiting

The result depends on timing and on which recovery path wins:

1. The FE countdown can reach zero before the BE expiry worker finishes payment verification and its grace period.
2. Booking expiry and Queue cleanup are separate steps. Queue may still report `CLAIMED` after Booking has ended the session.
3. On startup, the payment bridge can route to Payment while the queue bridge restores the old claimed entry and routes to Checkout or Waiting.
4. After the queue consumer processes `booking.journey.ended`, the queue entry is terminal and startup restoration clears the stale membership instead.

This accounts for the differing screens. It is not an intended BE rule that an expired checkout should remain usable; it is a recovery race combined with asynchronous projection updates.

## Expected `/cancel` Timing

- **Checkout exit before booking hold:** call booking-session cancellation after explicit confirmation.
- **Payment exit before a payment attempt is locked:** call booking cancellation after explicit confirmation.
- **SNAP close after an attempt starts:** FE may request booking cancellation, but BE can return `BOOKING_LOCKED`; then read payment status and preserve/resume the booking if still payable.
- **Payment timeout:** BE expiry worker resolves the payment and eventually ends the journey; no FE `/cancel` request is required.
- **Force-close/offline:** the app cannot guarantee a cancellation call; reconcile with BE on the next launch.

## Recommended Fix Direction (Analysis Only)

1. Make payment recovery and queue recovery mutually exclusive at startup. A saved active booking should take precedence over a claimed queue pointer.
2. On payment-page `NOT_PAYABLE`/terminal errors, read payment status. Do not leave a stale booking ID that reopens the same invalid route.
3. After a terminal booking result, clear the payment reference, checkout session, and queue membership before routing Home or offering a new queue join.
4. Treat `PENDING_PAYMENT`/`VERIFYING` after the displayed deadline as “checking with the server,” not as an expired session. Retry status with the same booking reference; do not create a second booking or replay an admission token.
5. When the queue still reports `CLAIMED` but the booking is terminal, wait/reconcile the queue projection or return to Home with a retryable rejoin action. Never present the stale claimed entry as an active Checkout.
6. Preserve BE authority: a cancellation is successful only when the cancellation response confirms a terminal cancelled/expired state. `BOOKING_LOCKED`, offline, and uncertain provider outcomes are not successful cancellation.

## Code References

### FE

- [PaymentJourneyRecoveryBridge.tsx](../../../apps/client/src/presentation/bridges/PaymentJourneyRecoveryBridge.tsx)
- [QueueMembershipBridge](../../../apps/client/src/presentation/bridges/QueueMembershipBridge/index.tsx)
- [usePaymentPage.ts](../../../apps/client/src/presentation/hooks/usePaymentPage.ts)
- [Payment screen](../../../apps/client/src/presentation/screens/Payment/index.tsx)
- [Payment WebView screen](../../../apps/client/src/presentation/screens/PaymentWebView/index.tsx)
- [Checkout screen](../../../apps/client/src/presentation/screens/Checkout/index.tsx)
- [Waiting screen](../../../apps/client/src/presentation/screens/Waiting/index.tsx)
- [useJoinQueue.ts](../../../apps/client/src/presentation/hooks/useJoinQueue.ts)
- [HTTP booking repository](../../../apps/client/src/infrastructure/api/http-booking.repository.ts)

### BE

- [expire.go](../../../../rusuh-booking-be/services/booking/internal/booking/application/usecase/expire.go)
- [booking unit of work](../../../../rusuh-booking-be/services/booking/internal/booking/infrastructure/postgres/unit_of_work.go)
- [cancel_booking.go](../../../../rusuh-booking-be/services/booking/internal/booking/application/usecase/cancel_booking.go)
- [cancel_session.go](../../../../rusuh-booking-be/services/booking/internal/booking/application/usecase/cancel_session.go)
- [get_payment_page.go](../../../../rusuh-booking-be/services/payment/internal/payment/application/usecase/get_payment_page.go)
- [get_payment_status.go](../../../../rusuh-booking-be/services/payment/internal/payment/application/usecase/get_payment_status.go)
- [queue end_entry.lua](../../../../rusuh-booking-be/services/queue/assets/lua/end_entry.lua)
- [queue join.lua](../../../../rusuh-booking-be/services/queue/assets/lua/join.lua)

## Limits

This report is based on source inspection, not a live device/API replay. It does not establish which exact redirect won in a particular run or whether the production/dev BE queue consumer was delayed. No code was changed for this analysis. Existing RBT-140 working-tree changes were left untouched.
