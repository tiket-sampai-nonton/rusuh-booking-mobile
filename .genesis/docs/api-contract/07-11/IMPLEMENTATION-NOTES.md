# Contract integration notes — 07-11

The seven adjacent Markdown files are unchanged copies of the supplied service exports. This branch implements the public frontend paths against those exports; internal admin and service-to-service routes are not client APIs. Automated tests use mocks or contract-shaped responses. Live verification is partial and is listed below; these notes do not claim a completed native payment transaction.

## Implemented

- Catalog list, detail, images, category availability, filters, and facets.
- Anonymous queue join, visitor-token storage, status, server-paced heartbeat, claim, and leave.
- Session creation using the admission token, session restoration and cancellation, attendee checks, and atomic booking with buyer, email confirmation, consent, and attendees. The adapter also exposes booking read, item replacement, and booking cancellation.
- Payment page, attempt creation, booking-based status verification, native page-token exchange in the WebView, and backend-issued ticket QR payloads.
- OTP access and refresh token handling, refresh-on-401, profile update, logout, and native event push subscription. Idempotency keys persist across reloads in real mode.
- On web, an availability SSE event invalidates the corresponding session query; the FE reads the latest session rather than guessing the event payload. An unavailable session provides retry and browse actions.

## Remaining integration decisions and limitations

1. **Native live availability and SSE fallback:** the supplied SSE section identifies `availability` and `timer` events but does not specify their payloads or the fallback polling interval. The web listener refetches on an availability event. Native does not yet have a streaming transport or continuous polling fallback; a device-compatible transport and a server-provided cadence need to be agreed before implementing them without inventing a polling interval. Stream disconnection/503 recovery also needs an agreed cadence.
2. **Order editing:** the HTTP adapter supports `PUT /bookings/{bookingId}/items` and cancellation, but an edit/cancel flow is not connected to the screens. The UI redirects a restored held booking to payment to avoid creating a duplicate booking. Product needs to confirm the editing interaction and recoverable states before this is usable.
3. **Queue claim recovery:** the admission token is one-use and its response is required to create a session. The supplied export does not define how to recover a claim response lost in transit. Confirm replay/recovery semantics with the backend before automatically re-claiming.
4. **Queue scale and rank:** the current waiting room reads `queue-entries/me` while waiting. The contract labels this exact-position endpoint as intended near the turn; the exports do not specify the complete far-zone calculation and transition algorithm. Confirm the CDN status-document algorithm and rate limits before production-scale use.
5. **Guest ticket history / event metadata:** the authenticated history response lacks stable event ID/date, while guest history has no list endpoint in these exports. My Tickets can fetch issued tickets for a known booking but cannot reliably reconstruct a guest's booking list after local session loss or reliably classify every account booking by date. The live event-detail response includes rich description, lineup, location, gallery, and terms; those fields are missing from the 07-11 published schema snapshot.
6. **Web push:** the schema lists `WEB` but does not define whether `pushToken` contains a browser endpoint or a complete subscription with encryption keys. Native registration is wired; browser subscription delivery needs that contract clarified.
7. **Native WebView:** the BE returns `/pay/{bookingId}` as a relative URL. The 12-Nov browser check found the currently deployed Pages bundle rendered "Unmatched Route" for that path. This branch adds `/pay/[bookingId]`, resolves the BE URL against `EXPO_PUBLIC_SITE_URL`, and exchanges the token through `PaymentRepository` in that same-origin page context; the web bundle must be deployed before a native app can use the route. CORS preflight for the configured Pages origin returned 204 with credential/origin headers. Actual one-time cookie persistence, SNAP redirect, and return routing still require physical-device testing.
8. **Machine-readable schemas:** the existing OpenAPI JSON and generated types were not replaced by these Markdown exports. Obtain matching OpenAPI files from the backend before regenerating types and performing automated contract tests.

## Live smoke verification — 2026-11-12

- `GET https://rusuh-booking.pages.dev/pay/rbt-payment-smoke?ppt=invalid&embedded=1` returned HTTP 200 HTML, but Playwright rendered Expo's "Unmatched Route" page. `GET` of the same `/pay/...` path on `https://dev.rusuhbooking.my.id` returned 404; native must use the frontend site origin and deploy the newly added route.
- `OPTIONS https://dev.rusuhbooking.my.id/api/v1/payment-page-sessions` with `Origin: https://rusuh-booking.pages.dev` and a credentialed JSON POST preflight returned 204 and echoed that origin with `Access-Control-Allow-Credentials: true`.
- `GET /api/v1/events/ec2f4c95-6247-4ee7-9524-2e5530edbfe4` returned 200. Its detail payload contains `description` keys `longDesc`, `lineup`, `location`, `gallery`, and `terms`, plus event media fields. The client parser supports those fields.
- No valid page token was minted and no payment or cookie session was created in this smoke check. No physical Android/iOS payment flow was run.
- Local Playwright at `http://localhost:8081/pay/bk-1?ppt=invalid&embedded=1` rendered the bootstrap loading state, posted to `/api/v1/payment-page-sessions`, received the expected 403 for the invalid token, and showed the recoverable error UI. This confirms local route registration and the API error path; it is not a successful token or payment test. A screenshot is recorded at `../../evidence/payment-webview-bootstrap-invalid-token-2026-11-12.png`.
