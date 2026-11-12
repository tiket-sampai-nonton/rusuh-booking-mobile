# Screen → API → response coverage

Reviewed 7 November 2026 against the supplied contract snapshot in [`api-contract/07-11/`](api-contract/07-11/) and the current client implementation on `codex/new-api-contract-07-11`. This is a source-level review. It does not prove that an endpoint is deployed, that credentials/CORS are configured, or that a native payment WebView works against the live service. Contract copies are unchanged from the supplied exports; the existing generated OpenAPI artifacts were not regenerated because the exports are Markdown, not machine-readable schemas.

> **Historical baseline:** this report remains the 7 November source-level snapshot. Live development-host checks and code changes recorded on 12 November supersede its statements about the Pages CORS allowlist and rich event description. See [`AS-BUILT-ALIGNMENT-2026-11-12.md`](AS-BUILT-ALIGNMENT-2026-11-12.md) and [`api-contract/07-11/IMPLEMENTATION-NOTES.md`](api-contract/07-11/IMPLEMENTATION-NOTES.md) for current findings. Native cookie persistence and SNAP routing are still not device-verified.

## Status key

- **Contract: ✓** endpoint and response needed for this action are specified; **partial** some required screen data/behavior is absent; **missing** no applicable public endpoint was found.
- **FE: ✓** adapter and screen path are wired to the documented route and response; **partial** some behavior or data remains unresolved; **✗** the action is not wired or still mismatches the contract.
- A contract status indicates documentation only. All routes below are relative to the configured API base URL (normally `/api/v1`). Mocks remain enabled unless `EXPO_PUBLIC_USE_MOCKS=false` or `0`.

## Screen summary

| Screen / action | Contract | FE | Assessment |
|---|---|---|---|
| Home and event archive | Partial | Partial | Catalog mapping and filters are wired. Optional list fields and the lack of a dedicated event-history route limit the archive. |
| Browse and filter sheet | ✓ | ✓ | Server filter/sort and facets are sent through the event repository; actual service behavior still needs live verification. |
| Event detail and queue join | Partial | Partial | Nested event/category mapping and queue creation are wired. Rich description, lineup, gallery and terms are absent from the exported detail schema. |
| Waiting room, heartbeat, claim and leave | ✓ | Partial | Queue routes, native visitor token, adaptive server cadence and claim handoff are wired. One-time claim recovery and far-queue/rate behavior need backend confirmation. |
| Checkout / hold / expiry | ✓ | Partial | Admission-token session creation, restore, attendee check, atomic booking and session cancellation are wired. Native availability stream/fallback and booking edit/cancel UI remain open. |
| Payment and result | ✓ | Partial | Page, attempt, status verification, token exchange and issued tickets are wired. Live payment-provider/WebView behavior is unverified. |
| My Tickets | Partial | Partial | Authenticated history and issued-ticket QR are wired; guest history and reliable upcoming/past classification are not supported by these exports. |
| OTP and profile | ✓ | Partial | OTP, profile, refresh and logout align to the routes. UI's “new account” state is inferred from `hasNik`, and web tokens are memory-only. |
| Push notifications | Partial | Partial | Native event subscription calls are wired. Web subscription payload is not defined by the contract. |
| Internal booking/payment and webhook routes | N/A | N/A | Service-to-service endpoints are intentionally not called by the client. |

## Detailed screen → API → response → satisfaction

### Home `/`, Browse `/browse`, and archive `/history`

| Action | API → response | Status | Implementation and remaining gap |
|---|---|---|---|
| Load event cards and hero | `GET /events` → `events[]`, `serverTime`; each event includes IDs, name, sales dates, status, with venue/date/pricing/image/genres optional. | Contract partial · FE partial | `HttpEventRepository.listEvents` unwraps the list, syncs `serverTime`, and maps event image URLs, genres and `CANCELLED`. Browse supplies server filters/sort. A missing optional image/price/date remains unavailable data, not a sold-out/zero value. |
| Filter choices | `GET /events/facets` with active filters → `cities[]`, `genres[]`. | ✓ · ✓ | Filter modal and Browse use server facets. Validate empty facets and filter combinations with the deployed API. |
| Event archive | `GET /events` with timeframe/status/sort → summaries. | Contract partial · FE partial | The exports have no separate history endpoint. `HistoryScreen` splits the events returned by the catalog; backend completeness for older events is unknown. |

### Event detail `/events/[eventId]`

| Action | API → response | Status | Implementation and remaining gap |
|---|---|---|---|
| Detail and ticket categories | `GET /events/{eventId}` → `event` plus `categories[]` (`categoryId`, `code`, `name`, `priceMinor`, `available`) and optional ticket limits. | Contract partial · FE partial | Mapper unwraps the nested event and translates categories/limits to the existing UI model. Export lacks long description, lineup, gallery and terms content; those sections cannot be filled from this contract alone. |
| Join queue | `POST /events/{eventId}/queue-entries` → entry ID/status/sequence/time; may include a mobile `visitorToken` and immediate admission state. | ✓ · ✓ | `HttpQueueRepository.join` uses the route; native token is stored in SecureStore and then sent as `X-Visitor-Token`; web sends same-origin credentials for the server-managed visitor cookie. Live cookie/CORS behavior remains unverified. |

### Waiting room `/waiting/[eventId]`

| Action | API → response | Status | Implementation and remaining gap |
|---|---|---|---|
| Read own queue entry | `GET /queue-entries/me?eventId=` → `entryId`, `state`, `rank`, optional exact position/zone/heartbeat timing/deadline/reason. | ✓ · ✓ | Adapter maps contract states and displays unknown exact position as unavailable. Status is read by the existing single TanStack poller. |
| Event queue estimate / cadence | `GET /queue-status/{eventId}` → bare status document with admission rate and `nextPollAfterMs`. | ✓ · Partial | Adapter reads estimate/cadence. The full “far zone” projection/transition behavior and rate limits are not specified sufficiently for the UI to derive a better exact rank. |
| Heartbeat | `POST /queue-entries/me/heartbeat?eventId=` → state and `nextHeartbeatMs`. | ✓ · ✓ | Polling hook sends heartbeat according to the previous server hint and keeps one poller per entry. Validate timing and retry behavior against the real service. |
| Claim turn | `POST /queue-entries/{entryId}/claim?eventId=` → one-use `admissionToken`, booking URL. Then `POST /booking-sessions` with the token → session. | ✓ · Partial | Auto-claim passes the token into session creation. If the claim succeeds at the server but its response is lost, exports do not explain how the client recovers the one-time token; do not blindly repeat the claim. |
| Leave | `DELETE /queue-entries/{entryId}?eventId=` → `204`. | ✓ · ✓ | Leave waits for API success before clearing the local membership and removes the event push subscription best-effort. Verify authorization and retry semantics live. |

### Checkout `/checkout/[sessionId]`

| Action | API → response | Status | Implementation and remaining gap |
|---|---|---|---|
| Create / restore session | `POST /booking-sessions` `{admissionToken}`; `GET /booking-sessions/current`; `GET /booking-sessions/{sessionId}` → session/event IDs, phase, deadline, server time, categories, limits and optional booking. | ✓ · ✓ | Adapter maps create/current/specific-session responses, including nested booking state. Restored held bookings go to payment/result routes instead of creating a duplicate booking. |
| Availability updates | `GET /booking-sessions/{sessionId}/stream` (SSE), `availability`/`timer` events, and session read for authoritative state. | Contract partial · FE partial | Web subscribes to `availability` and invalidates the session query, then reads the server response without interpreting an undocumented event payload. Native stream and disconnect/503 fallback are not implemented: no transport/fallback cadence is defined in the supplied exports. |
| Check attendee | `POST /booking-sessions/{sessionId}/attendee-checks` `{nik}` → result and remaining checks. | ✓ · Partial | Request route/body and decision states are wired. The response's optional masked-NIK behavior and backend limits need live validation. Raw NIK remains transient and is not persisted/logged by the client. |
| Create booking/hold | `POST /bookings`, `Idempotency-Key`, `{sessionId,buyer,items}` → booking reference/status/amount/deadline/version/items. | ✓ · ✓ | Checkout submits buyer NIK/email/email confirmation/consent and attendees atomically. Durable keys are used in real mode; only backend-authoritative booking/ticket state is shown after the request. Validate conflict, quota and idempotency error variants against live envelopes. |
| Cancel selecting session | `POST /booking-sessions/{sessionId}/cancel`. | ✓ · Partial | Adapter method is present, but cancellation/rejoin interaction is not connected to the checkout leave UI. |
| Cancel or edit an existing booking | `POST /bookings/{bookingId}/cancel`; `PUT /bookings/{bookingId}/items` with version and items. | ✓ · Partial | Read/cancel/replace adapter methods exist; no user-facing edit/cancel flow is wired. Product needs to define how edit states are entered and recovered. |
| Expired/unavailable recovery | Retry `GET /booking-sessions/{sessionId}` or browse. | Contract partial · FE partial | Missing session, network failure and server-expired states have responsive recovery actions; session expiry still routes to the existing expired screen. Screenshot issue of the unstyled empty error state is corrected. |

### Payment `/payment/[bookingId]`, WebView, and success

| Action | API → response | Status | Implementation and remaining gap |
|---|---|---|---|
| Load payment view | `GET /payments/{bookingId}/page` → methods, amount, deadline, server time, optional current attempt. | ✓ · ✓ | Mapper consumes `attemptNo`, `expiresAt`, status, redirect and return URL fields. |
| Start or reconcile payment | `POST /payments/{bookingId}/attempts` with method and `Idempotency-Key` → attempt number/status/expiry/URLs. | ✓ · ✓ | Adapter uses the documented route, body and durable action key. Payment UI never submits payment instrument details. |
| Verify result | `GET /payments/{bookingId}/status` → authoritative booking status, optional attempt, deadline and server time. | ✓ · ✓ | Result and deep-link restore verify by booking ID; gateway return/callback does not itself mark payment paid. |
| Native WebView handoff | `POST /payments/{bookingId}/page-tokens` → one-use page token/URL/expiry; `POST /payment-page-sessions` `{pageToken}` → cookie session. | ✓ · Partial | Token exchange runs in WebView cookie context. iOS/Android cookie policy, origin/CORS and payment-provider redirects still need device testing against a deployed API. |
| Show/download e-ticket | `GET /bookings/{bookingId}/tickets` → ticket code, masked attendee details and backend `qrPayload`. | ✓ · Partial | Success and account ticket detail use issued QR payloads. Guest history after local state loss is unsupported because there is no guest booking-list route in the supplied exports. |

### My Tickets `/my-tickets`, auth modal, profile

| Action | API → response | Status | Implementation and remaining gap |
|---|---|---|---|
| Account booking list | `GET /me/bookings?cursor=&limit=` → booking summaries and cursor. | Contract partial · FE partial | Repository paginates authenticated history. Response lacks event ID/date needed for reliable upcoming/past grouping; matching event names against catalog remains a fallback with ambiguity. |
| OTP login | `POST /auth/otp/request`; `POST /auth/otp/verify` → access/refresh tokens and account. | ✓ · Partial | Routes and access/refresh token mapping are wired, with concurrent refresh coalescing and one retry after 401. UI uses `hasNik` to infer registration completion because response has no explicit `isNew`; confirm that product interpretation with BE. |
| Read/update profile | `GET /me`; `PATCH /me` → masked profile and `hasNik`. | ✓ · ✓ | Adapter sends bearer auth and maps contract fields. Raw NIK is sent only as a transient PATCH body. |
| Refresh/logout | `POST /auth/refresh` and `/auth/logout` with refresh token. | ✓ · Partial | Native access/refresh tokens use SecureStore. Browser token storage is in-memory, so reload signs the user out; confirm expected browser persistence policy. Logout revokes server-side before clearing local tokens. |

### Notifications and internal APIs

- **Native event push:** `POST /push-subscriptions` and `DELETE /push-subscriptions/{eventId}` are wired using the Expo token. Contract does not identify provider/token conversion requirements; confirm server accepts the Expo token and allowed platform values.
- **Web push:** notification export lists `WEB` but does not specify browser endpoint plus encryption keys/subscription serialization. Browser subscription is not wired to the API.
- **Internal booking/payment routes and the Midtrans webhook:** service-to-service only. The app does not call these routes. Local simulator/webhook behavior is not treated as a public payment API.

## Cross-cutting gaps before production acceptance

1. Obtain current machine-readable OpenAPI schemas from BE; current generated TypeScript artifacts are older than the 07-11 Markdown exports.
2. Agree on native SSE/fallback transport and server-provided retry cadence; do not invent a fixed interval.
3. Confirm recovery/idempotency semantics for a lost one-use queue claim response.
4. Define product UI for booking edit/cancel and the event detail fields omitted from the contract.
5. Define guest booking/ticket history and stable event IDs/dates in account history.
6. Confirm browser push payload, native Expo token acceptance, payment cookie/CORS configuration, visitor-token rotation and live error envelope behavior with BE.
7. Run web and iOS/Android integration checks against a deployed service; current tests exercise contract-shaped adapter responses and mocks, not the BE deployment.

## Source locations

- Adapters: `apps/client/src/infrastructure/api/http-{event,queue,booking,payment,user,ticket-history}.repository.ts`, `dto-mappers.ts`.
- Wiring: `apps/client/src/providers/container.ts` and `apps/client/src/infrastructure/http/`.
- Screen hooks: `apps/client/src/presentation/hooks/` and `apps/client/src/presentation/screens/`.
- Implementation caveats: [`api-contract/07-11/IMPLEMENTATION-NOTES.md`](api-contract/07-11/IMPLEMENTATION-NOTES.md).
