# Guest Checkout: Back and Rejoin Evidence

**Date:** 2026-11-13 (Asia/Jakarta)
**Environment:** Current RBT-140 working tree, Expo web on `http://localhost:8081`, real development API, isolated Chrome session, signed out.
**Event:** Senja di Kota Tua Fest (development test event).
**Privacy:** NIK, tokens, and request bodies are omitted. Test bookings and the final checkout session were cancelled. No payment attempt was submitted.

## Reproduced Defects

1. The Payment page's Back button displayed the leave confirmation, but browser Back navigated directly to Event Detail. The booking was still active and no booking-cancel request was sent. The web navigation action was `RESET`; the existing guard only handled `GO_BACK`, `POP`, and `POP_TO_TOP`.
2. After reopening the active booking and confirming cancellation, the BE returned HTTP 200 with booking status `CANCELLED`, but the app restored the old claimed queue membership and displayed “Sesi checkout tidak tersedia” instead of remaining on Home.

## Changes

- Prevent a web history `RESET` while Payment is active, restore the Payment URL, and display the leave confirmation. Browser Back can be repeated after choosing “Tetap di sini.”
- After the BE confirms cancellation or expiry from the leave action, cancel any pending queue-restore query and clear the cached/persisted queue reference and payment reference before routing.
- Browser history access is behind a platform adapter and domain port. TanStack Query access stays in a presentation hook.

## API Sequence Observed

The following statuses were observed in the guest flow against the development BE. IDs are intentionally omitted.

| Step | API | Result |
|---|---|---|
| Load Home | `GET /events` | 200 |
| Open Event Detail | `GET /events/{eventId}` | 200 |
| Join queue | `POST /events/{eventId}/queue-entries` | 201 |
| Read queue entry | `GET /queue-entries/me?eventId={eventId}` | 200 |
| Read queue status | `GET /queue-status/{eventId}` | 200 |
| Claim turn | `POST /queue-entries/{queueId}/claim?eventId={eventId}` | 200 |
| Create checkout session | `POST /booking-sessions` | 201 |
| Load checkout session | `GET /booking-sessions/{sessionId}` | 200 |
| Open availability stream | `GET /booking-sessions/{sessionId}/stream` | 200, with the separate disconnect noted below |
| Validate attendee | `POST /booking-sessions/{sessionId}/attendee-checks` | 200, `AVAILABLE` |
| Continue to Payment | `POST /bookings` | 201 |
| Load Payment | `GET /payments/{bookingId}/page` | 200 |
| Confirm “Ya, keluar” | `POST /bookings/{bookingId}/cancel` | 200, `CANCELLED` |
| Return Home | `GET /events` | 200 |
| Join the same event again | `POST /events/{eventId}/queue-entries` | 201; a new checkout session was reached |
| Release the final test checkout | `POST /booking-sessions/{sessionId}/cancel` | 204; returned Home |

After the fix, browser Back showed the confirmation while the address remained on Payment. Choosing “Tetap di sini” kept Payment available; a second browser Back displayed the confirmation again. Confirming “Ya, keluar” returned Home with both the queue membership and payment reference absent from browser storage. The same event was joined again and reached a new Checkout. The in-app Payment Back button was also retested and returned Home after a confirmed cancellation.

The cropped, sanitized confirmation screenshot is [guest-payment-browser-back-dialog.png](guest-payment-browser-back-dialog.png).

## Separate Availability-Stream Finding

During a 38-second checkout observation, the availability stream returned HTTP 200, failed with `net::ERR_HTTP2_PROTOCOL_ERROR` approximately 30 seconds after its response began, and reconnected successfully about 3.3 seconds later. The checkout remained usable and its session cancellation returned 204. Earlier runs also showed `ERR_QUIC_PROTOCOL_ERROR` for this stream.

The local BE source's shared HTTP server uses a 30-second `WriteTimeout`, and the Booking service uses that server for its long-lived SSE handler. This timing is a strong lead, but the exact deployed server/proxy configuration was not verified. The BE team should inspect the stream's write deadline and the proxy path; this report does not assume which component terminated the live connection. The FE continues to reconnect through `EventSource`. [BE server timeout](../../../../rusuh-booking-be/pkg/httpx/server.go), [Booking server setup](../../../../rusuh-booking-be/services/booking/internal/delivery/server.go), [SSE handler](../../../../rusuh-booking-be/services/booking/internal/booking/infrastructure/http/sse_handler.go).

## Checks

- Targeted Jest: 3 suites, 48 tests passed, including the web `RESET` guard and cancellation of an in-flight queue restore.
- TypeScript typecheck passed.
- ESLint passed for the changed source and test files; `git diff --check` passed.
- Browser reproduction used real development API responses. Native devices and the full RBT-140 matrix were not retested in this pass.
