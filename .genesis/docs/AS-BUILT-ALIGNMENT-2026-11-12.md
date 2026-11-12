# As-built alignment and task evidence — 2026-11-12

This addendum records the current FE working-tree implementation against the API behavior and GENESIS docs. It supplements historical grooming and security snapshots without rewriting their original decisions. The code changes are on `feat/history-view-toggle`; they are not committed or merged.

## Task outcome

| Request | Current outcome | Verification boundary |
|---|---|---|
| Identify each e-ticket's category and attendee on Success | Each issued ticket displays its category code, attendee name, masked attendee NIK, and ticket code. | Component and screen tests pass. The detail is sourced from each issued `BookingTicket`, not copied from the order-level buyer. |
| Identify category and attendee in My Tickets QR sheet | Each QR item shows its ticket code, category, attendee name, and masked NIK. Paid booking cards in both Upcoming and Sebelumnya are tappable across the full card and show a clear **Lihat Detail Tiket** action; tapping a past booking opens its ticket detail sheet. My Tickets summary groups ticket counts by category. | Component and screen tests pass, including tapping a paid past event and checking its category/attendee data. |
| Fix native checkout → Bayar “gagal membuka halaman pembayaran” | The BE issues a site-relative `/pay/{bookingId}` URL, but that route did not exist in the deployed Expo app; Pages returned its HTML shell while Expo Router showed “Unmatched Route.” Added `/pay/[bookingId]`, strict URL validation on native, and a same-origin bootstrap that exchanges the one-use token through `PaymentRepository` before opening the existing payment route. | Local browser verified route resolution and the invalid-token error UI. The Pages web bundle must be deployed before native clients can use the route. No physical-device token/cookie/SNAP transaction was completed. |
| Review Clean Architecture / SOLID | Moved Success/My Tickets TanStack query orchestration into `presentation/hooks` and added ESLint protection against direct query imports everywhere in `presentation/` except that hooks folder. | `typecheck`, lint, focused tests, and formatting checks passed. This is a scoped architecture review, not a complete line-by-line formal audit. |
| Align `.genesis/docs` with current code | Updated current task/status, API alignment, payment/security flow, and hosting documentation; marked original phase/gate documents as historical where appropriate; retained upstream contract exports. This report inventories every pre-existing document/evidence item. | Runtime gaps and device/deployment limits are stated below. |

## Root cause and implementation detail

The payment repository returns a relative page URL under `/pay/{bookingId}`. Before this change, the FE had no Expo Router `/pay` route. The deployed Cloudflare Pages host returned the single-page app shell (HTTP 200), which obscured the missing client route; Playwright showed Expo's “Unmatched Route” screen. The API host itself returns 404 for `/pay/...`, so the route must live on the configured FE site origin.

The native screen now resolves the BE URL against `EXPO_PUBLIC_SITE_URL` and rejects non-HTTPS, another origin, a different route/booking, or a mismatched page token. The new `/pay/[bookingId]` page reads the booking ID and one-use token, exchanges it via the existing `PaymentRepository` use-case path, and replaces the bootstrap URL with `/payment/{bookingId}`. The token exchange is protected against React Strict Mode effect replay; errors are surfaced and retryable. Native callback routing now parses exact same-origin result paths and checks the booking ID before leaving the WebView. The token-bearing route is `noindex`, disallowed in `robots.txt`, and included in transactional route artifact checks.

The success and QR views now consume ticket-level category and attendee details. No raw NIK is introduced; only the BE-provided masked NIK is rendered.

## Checks and evidence

- Focused Jest run: **9 suites / 56 tests passed**. Covered Success, My Tickets, e-ticket card, QR sheet, payment URL/bootstrap, error/retry UI, and the `PaymentRepository` hook.
- `npm run typecheck`: passed.
- `npm run lint`: passed with **0 errors and 31 warnings**. Warnings are unused test imports and `require()` style warnings; no architecture rule errors.
- `npm run format:check`: passed.
- `npx expo export --platform web` with development API/site/mocks environment: passed and included `/pay/[bookingId]` as a static route.
- `EXPO_PUBLIC_SITE_URL=https://rusuh-booking.pages.dev npm run web:metadata`: generated a sitemap for 10 public routes.
- `EXPO_PUBLIC_SITE_URL=https://rusuh-booking.pages.dev npm run web:verify`: passed for 9 public routes, 17 transactional routes, SEO files, and gzip budgets.
- Local Playwright opened `http://localhost:8081/pay/bk-1?ppt=invalid&embedded=1`, observed the POST to `/api/v1/payment-page-sessions`, and rendered a recoverable 403 error for the deliberately invalid token. Screenshot: [`evidence/payment-webview-bootstrap-invalid-token-2026-11-12.png`](evidence/payment-webview-bootstrap-invalid-token-2026-11-12.png).
- Live checks found the public API's CORS preflight for `https://rusuh-booking.pages.dev` → `POST /api/v1/payment-page-sessions` returned 204 with the site origin and credentials allowed. Live event detail returned the rich description fields described below.

These checks do **not** prove a valid payment, payment-page cookie persistence, SNAP launch/return, or native-device behavior. The deployed Pages build still needs the `/pay` route, and a physical iOS and Android test must verify the full transaction handoff afterward. The error-path screenshot is not a successful-payment screenshot.

## Remaining contract and release gaps

1. Live `GET /events/{id}` includes `description.longDesc`, `lineup`, `location`, `gallery`, and `terms`; the FE parser and detail screen support them. The 07-11 published contract snapshot does not fully describe the rich `description` JSON, so BE should publish that schema before FE regenerates API types.
2. Event-list `remainingTickets` is not a contract field; event-detail category `available` is available for per-category stock. Do not infer aggregate list stock from it.
3. Deploy the updated FE web artifact to the configured site origin. A 200 fallback response alone is insufficient; verify that `/pay/<bookingId>?ppt=invalid&embedded=1` renders the app's bootstrap/error UI.
4. Run a valid page-token/cookie exchange on physical iOS and Android, then exercise SNAP success, failure, and cancellation return routes. This requires a valid dev booking and backend/payment test availability.
5. The review remains scoped: other items in `SRC-ALIGNMENT-PENTEST-REPORT.md` (HTTP timeouts/error parsing, auth/token storage decisions, deep-link validation, CSP, telemetry, logout cleanup, coverage gates, redirects, and other hardening) remain separate findings unless explicitly marked otherwise there.

## Documentation inventory and disposition

There were **54 existing files** under `.genesis/docs` immediately before this report was added; the `.DS_Store` metadata file is excluded. This report is the 55th file. Every prior file is listed below. “Updated” means the working copy was revised for this task or its immediately preceding integration findings. “Retained” means it was checked and remains an authoritative rule, historical snapshot, upstream contract export, or evidence artifact; it was not rewritten to make a past state look current.

### Core planning, architecture, design, and audit docs (26)

**Updated/reconciled (14):**

- `03-GROOMING-DECISIONS.md` — preserves original O1/O2 snapshot and adds current runtime status.
- `04-PHASE-2-INDEX.md` — retains gate history and points readers to current alignment evidence.
- `05-TASK-LIST.md` — adds current ticket/payment work and known risks.
- `06-TASK-ORDER.md` — reflects active QA and the payment route/device dependency.
- `09-IMPLEMENTATION-READINESS.md` — historical gate result is labeled as such.
- `10-PROJECT-SETUP.md` — setup snapshot is labeled historical.
- `EDGE-CASES.md` — includes current payment bootstrap and recovery cases.
- `FE-BE-align-contract.md` — distinguishes live event content from stale schema, records route/CORS facts, and keeps unresolved list-stock gaps.
- `FE-Flow-Diagrams.md` — updates runtime description and payment handoff notes.
- `PIPELINE.md` — release workflow and OTA status updates already present on this branch are retained.
- `README.md` — links the current audit and labels original open dependencies historical.
- `SCREEN-API-CONTRACT-COVERAGE-2026-11-07.md` — labels its dated coverage as a historical baseline.
- `SECURITY.md` — records the short-lived page-token exception and same-origin bootstrap/callback constraints.
- `WEB-HOSTING-GUIDE.md` — corrects development environment values and adds a deployed `/pay` verification step.

**Reviewed and retained (11):** `01-PHASE-1-REQUIREMENT-ANALYSIS.md`, `02-PHASE-1-GROOMING-AGENDA.md`, `07-SKILLS-MAP.md`, `08-RULES.md`, `ARCHITECTURE.md`, `DESIGN-SYSTEM.md`, `EXPO-53-UPGRADE-NOTES.md`, `OBSERVABILITY.md`, `RBT-119-REFACTOR-ANALYSIS.md`, `TESTING-STRATEGY.md`, and `analyze native diff.md`. These describe source requirements, locked architecture/rules, design/observability/testing policy, or dated analysis; no change to their underlying authority was needed.

**Audit record (1):** `SRC-ALIGNMENT-PENTEST-REPORT.md` retains the original baseline findings and now appends the status of SEC-01, SEC-02, and ARCH-01. Other findings remain open as listed in the report.

### API-contract docs and exports (17)

- **Updated/reconciled (2):** `api-contract/07-11/IMPLEMENTATION-NOTES.md` and `api-contract/07-11/INTEGRATION-RBT-128.md` — dated live checks and current route/device boundaries are appended; old observations remain historical.
- **Reviewed and retained as supplied service snapshots (8):** `api-contract/07-11/booking-internal.md`, `booking.md`, `integrate-status.md`, `notification.md`, `payment-internal.md`, `payment.md`, `queue.md`, and `user.md`. The Markdown exports are not edited to pretend to be a new BE release.
- **Reviewed and retained as upstream machine-readable snapshots (7):** `api-contract/1. User Service API.openapi.json`, `2. Queue Service API.openapi.json`, `3. Booking Service API.openapi.json`, `4. Payment Service API.openapi.json`, `5. Notification Service API.openapi.json`, `Booking Internal API.openapi.json`, and `Payment Internal API.openapi (1).json`. Runtime-rich `description` remains a BE schema documentation gap.

### Evidence and mock fixtures (11)

- **Prior native-device evidence:** RBT-132 device screenshots and recordings remain in the local workspace and are excluded from this PR because they are unrelated to the payment-route work and may show personal account details.
- **New local payment-route error evidence (1):** `evidence/payment-webview-bootstrap-invalid-token-2026-11-12.png`; it demonstrates the expected invalid-token recovery state only.
- **Updated/reconciled (1):** `mock-fixtures/README.md` — labels remaining runtime-contract gaps and the difference between current BE data and fixtures.
- **Reviewed and retained (2):** `mock-fixtures/booking-payment.fixtures.json` and `mock-fixtures/user-queue.fixtures.json`; they remain fixtures, not a source of live BE truth.

## Source and modified files

The main implementation files are `apps/client/.eslintrc.js`, `apps/client/public/robots.txt`, `apps/client/scripts/verify-web.cjs`, `apps/client/src/app/pay/[bookingId].tsx`, `apps/client/src/presentation/screens/PaymentPageBootstrap/index.tsx`, `apps/client/src/presentation/screens/PaymentWebView/index.tsx`, `apps/client/src/presentation/hooks/usePaymentWebView.ts`, `apps/client/src/presentation/hooks/useSuccessTickets.ts`, `apps/client/src/presentation/hooks/useMyTicketsData.ts`, `apps/client/src/presentation/components/ETicketCard/index.tsx`, `apps/client/src/presentation/screens/Success/index.tsx`, and `apps/client/src/presentation/screens/MyTickets/`.

This PR bundles the completed payment-ticket, event-list presentation, notification, documentation, and release-pipeline changes present in the working tree. It does not deploy the web artifact or publish OTA; those are handled by the post-merge workflow.
