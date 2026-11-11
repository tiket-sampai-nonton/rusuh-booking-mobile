# RBT-131 — API failure handling evidence

Date: 2026-11-11
Branch: `fix/RBT-131`

## Coverage

The FE presents user-safe, recoverable states for connection/fetch/CORS-style transport failures and HTTP API errors, including 400, 401, 403, 404, 408, 409, 422, 429, and 5xx responses. Event detail queue joining, Home, Browse, History, Waiting, Checkout, Payment, payment verification, and ticket/QR loading use contextual retry or navigation actions. Raw server messages and network details are not shown to users. Missing ticket data does not produce a fabricated QR code.

## Automated checks

- `npm run typecheck` — passed.
- Targeted Jest run — 10 suites, 77 tests passed.
- Targeted ESLint — 0 errors; 2 existing `require()` warnings in `MyTickets.test.tsx`.
- `npx expo export --platform web` — passed; 48 static routes exported.
- `git diff --check` — passed.

## Live/manual verification

### Web

Opened the event detail for `ec2f4c95-6247-4ee7-9524-2e5530edbfe4` on the local Expo web app. The live event GET returned 200. Queue POSTs were intercepted in the browser during failure scenarios so no queue entry/booking side effect was created.

- Forced network failure: UI showed safe connection guidance and a retry action.
- Simulated HTTP 400 (`VALIDATION_ERROR`): UI showed validation guidance and retry.
- Simulated HTTP 500 (`DEPENDENCY_UNAVAILABLE`): UI showed service-unavailable guidance and retry.
- Browser request log is in `web-requests.txt`; recordings and screenshots are listed below.

The API's GET and POST CORS preflights from `http://localhost:8081` both returned 204 with the matching `Access-Control-Allow-Origin`. Captured headers: `cors-preflight-get.txt`, `cors-preflight-post.txt`. This establishes that the tested origin currently passes preflight; the FE still handles CORS/network failures if a different origin or later server configuration blocks a request.

### Android native

On the connected Android QA device, the event detail loaded, then network connectivity was disabled to force queue join/retry transport errors and restored after capture. The screen showed safe failure guidance and the `COBA LAGI` action. No successful queue join was performed during the offline recording.

### iOS native

The shared React Native presentation components and error formatter are covered by the passing Jest tests. The iOS simulator was opened on the same event detail, but a separate forced HTTP/CORS failure was not injected on iOS in this run.

## Evidence files

- `web-event-detail-api-retry.webm` — web transport failure and retry interaction.
- `web-http-400-500-retry.webm` — web HTTP 400/500 error interaction.
- `web-queue-failure.png`, `web-queue-retry-failure.png` — web transport failure states.
- `web-queue-http-400.png`, `web-queue-http-500.png` — HTTP error states.
- `web-requests.txt` — browser request results (live GET 200, forced transport failures, simulated POST 400 and 500).
- `android-native-api-error-retry.mp4` — Android native offline failure and retry recording.
- `android-native-api-error.png`, `android-native-api-retry.png` — Android failure/retry states.

## Limitation

The FE can give a useful message and retry for CORS failures, but it cannot override browser CORS enforcement. If preflight fails for the deployed origin, the BE must allow that origin and required headers/methods. HTTP errors with readable responses are mapped to appropriate safe messages by the FE.
