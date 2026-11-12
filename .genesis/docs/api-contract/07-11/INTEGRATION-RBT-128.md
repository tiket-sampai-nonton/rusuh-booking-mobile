# FE–BE API Integration — RBT-128

## Configuration

The FE API client expects the versioned API root, not only the host:

```dotenv
EXPO_PUBLIC_API_BASE_URL=https://dev.rusuhbooking.my.id/api/v1
EXPO_PUBLIC_USE_MOCKS=false
EXPO_PUBLIC_ENV=development
```

The ignored `apps/client/.env` in the integration worktree uses these values. The tracked `apps/client/.env.example` documents the same dev API root.

## Source refs

- FE integration branch: `codex/RBT-128-fe-be-api-integration`, based on the latest fetched FE `origin/develop`.
- BE repository: `/Users/rizkyrachmawan/MyProject/telkomsel/assessment/rusuh-booking-be`.
- The BE clone has no `develop` branch; the available implementation used for comparison is `main`.
- BE OpenAPI 3.1 service contracts are under `docs/contracts/openapi/` in the BE repository. Public routes use the `{meta,data}` envelope, including `GET /api/v1/queue-status/{eventId}` in the current handler implementation.

## Adapter changes

- Native requests send `X-Client-Type: mobile`; the stored `X-Visitor-Token` continues to be attached on native requests. Web does not expose a visitor token to JavaScript and relies on the HttpOnly cookie.
- Queue status now unwraps the BE envelope before mapping `admissionRatePerMin` and `nextPollAfterMs`.
- Current booking-session lookup accepts `eventId` and sends it as a query parameter. Without event context, the FE avoids making a request that the BE would reject with validation error.
- Attendee-check mapping reflects the BE response, which returns the result and remaining-check count without a masked NIK.

## Live dev API and browser checks

On 2026-11-09 (Asia/Jakarta), read-only calls returned HTTP 200 with `{meta,data}` envelopes for:

- `GET https://dev.rusuhbooking.my.id/api/v1/events`
- `GET /api/v1/events/{eventId}`
- `GET /api/v1/queue-status/{eventId}`

The browser was run in real API mode (`EXPO_PUBLIC_USE_MOCKS=false`). At `http://localhost:8088`, Chromium blocked the live API request (`net::ERR_FAILED`). At `http://localhost:8081`, the allowlisted origin, event list, event detail, and credentialed queue-status requests succeeded. The credentialed GET response echoed `Access-Control-Allow-Origin: http://localhost:8081` and returned `Access-Control-Allow-Credentials: true`; the browser console had no errors. Direct GETs without credentials and OPTIONS preflight returned `Access-Control-Allow-Origin: *`; preflight is sent without credentials. See the retest record in `web-e2e.txt`.

The list contained three seeded events and all three returned `status=CLOSED`. One event's queue status returned `saleState=OPEN` despite its catalog status being closed. Its UI detail therefore showed sales closed, so a full queue-to-booking-to-payment browser flow could not be completed safely. To check queue cookie handling, one anonymous queue entry was created through the live API; `GET /queue-entries/me` found it and `DELETE /queue-entries/{entryId}` returned 204. The entry was removed. No booking or payment was created.

During the browser run, the FE initially hit `Illegal invocation` because `fetch` was passed unbound. The adapter now binds `globalThis.fetch`, and a regression test covers this browser behavior.

Command and check summaries are saved under `.genesis/evidence/RBT-128/` (`targeted-tests.txt`, `typecheck.txt`, `lint.txt`, `live-api-smoke.txt`, and `web-e2e.txt`).

## Remaining integration blockers

1. **Payment settlement:** the latest live run completed Home → event detail → queue → checkout → payment page with one available event. No payment attempt was submitted, so the SNAP redirect, webhook settlement, and FE return route still need sandbox verification. The earlier closed-event observations above describe the initial catalog snapshot and were superseded by the later event-data refresh.
2. **Rich event description:** BE event `description` is an opaque Slate JSON document, while the FE rich-description parser expects an object with UI fields such as `longDesc`, `lineup`, and `terms`. The FE adapter does not invent a translation; those sections remain unavailable with real BE data until the shape is agreed.

## Latest integration updates — 2026-11-09

- The GitHub `development` environment now uses the real dev BE API root with `EXPO_PUBLIC_USE_MOCKS=false`. The release workflow validates this for `develop` and passes the same public variables to both the Cloudflare web build and the EAS OTA bundle.
- The BE booking-session availability stream emits an `availability` frame every three seconds. The FE previously invalidated the complete booking-session query for every frame, causing repeated `GET /booking-sessions/{sessionId}` calls. The FE now maps the frame into the cached category availability, without refetching the session. A targeted regression test asserts one session GET while a stream update refreshes the cached availability.
- A live retest of the supplied session ID returned HTTP 410 because its hold had expired. TanStack Query's global retry setting then repeated that terminal request twice. Booking-session restore now disables automatic retries (the checkout offers a manual retry), and the retest from `http://localhost:8081` recorded exactly one `GET /api/v1/booking-sessions/{sessionId}` before routing to the failed-hold page.
- The later live E2E used `Senja di Kota Tua Fest`, reached the payment page, and stopped before payment. See the final section in `.genesis/evidence/RBT-128/web-e2e.txt`.

## Follow-up discovery — hosted web release

- The GitHub `develop` workflow deploys with `wrangler pages deploy --branch develop`, which creates a Cloudflare preview deployment (`https://68700489.rusuh-booking.pages.dev` for the 2026-11-09 merge). The root `https://rusuh-booking.pages.dev` remains the production branch and does not move when `develop` is deployed.
- The preview had mock event data and no API requests even though CI supplied `EXPO_PUBLIC_USE_MOCKS=false`. `readUseMocksFlag()` read the flag indirectly through a `process.env` object; Expo only inlines statically referenced `process.env.EXPO_PUBLIC_*` properties. A follow-up change now reads `process.env.EXPO_PUBLIC_USE_MOCKS` directly.
- The BE CORS allowlist currently permits the local web origin `http://localhost:8081`. The Pages preview/root origins must also be allowed by the BE for browser JavaScript to read live API responses after the FE sends requests.

## Follow-up verification — 2026-11-12

The prior CORS note reflects the 2026-11-09 check. A new preflight to `POST /api/v1/payment-page-sessions` from `https://rusuh-booking.pages.dev` returned 204 with `Access-Control-Allow-Origin: https://rusuh-booking.pages.dev` and `Access-Control-Allow-Credentials: true`. Browser inspection found the deployed Pages bundle returned its Expo "Unmatched Route" screen at `/pay/{bookingId}`, while the API host returned 404 for that path. This branch adds `/pay/[bookingId]`; the site-relative URL is constrained to the configured HTTPS origin and matching booking, and the bootstrap exchanges the token through `PaymentRepository`. The updated web bundle must be deployed before the route is available to native QA. Local Playwright confirms the route and invalid-token error state; cookie persistence and SNAP navigation remain unverified on a physical iOS/Android device.
