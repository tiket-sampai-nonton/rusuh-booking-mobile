# RBT-119 Final Refactor and Verification Report

- **Branch:** `chore/RBT-119`
- **Date:** 2026-11-06
- **Scope:** `apps/client` — Expo, React Native, and React Native Web

## Work completed

- Split screen-local UI into individually named fragment components; kept screens responsible for composing state, data, and actions.
- Moved reusable UI to shared component folders, shared UI helpers to presentation utilities, and component styles into `style.ts` files.
- Removed V2-prefixed component files/folders and updated imports. Moved tests into `src/__tests__/`.
- Kept platform-specific rendering in the existing architecture and retained API-driven values, guest access, server-authoritative timers, and the SNAP/payment boundary.
- Added recoverable queue connection-timeout handling. A timed-out poll keeps the current queue membership and position; polling resumes against that same queue after connectivity returns.
- Fixed the Web export warning from the query-string compatibility shim by resolving the installed implementation without using its unexported package subpath.

## Verification

| Check | Result |
|---|---|
| Jest coverage | **185 suites passed; 1,096 tests passed** |
| Per-file coverage | **418 files measured**; every file is at least 90% for statements, lines, functions, and branches. Minimums: statements 94.44%, lines 94.44%, functions 90%, branches 90%. Aggregate: statements 99.52%, lines 99.78%, functions 99.78%, branches 97.38%. See [per-file coverage summary](coverage-summary.md) and [CSV](coverage-per-file.csv). |
| TypeScript | `npm run typecheck` passed |
| ESLint | `npm run lint` passed |
| Web export | `npx expo export --platform web` passed; 29 static routes generated |
| Export logs | The query-string warning was removed. The final export completed without Metro or color-environment warnings. |
| Android log review | No app `ReactNativeJS` exception or fatal crash was present in the inspected log window. Remaining `android.xr` and IPC messages were emulator/system messages. |

## Device and flow evidence

The `android/`, `ios/`, and `web/` folders contain the final captures and download artifacts. Test-only OTP screenshots were excluded from the evidence commit.

### Android emulator

- Profile authentication and signed-out state: [authenticated profile](android/profile-authenticated-registration.png), [signed-out profile](android/profile-signed-out.png).
- Browse, event detail, queue admission, and Checkout: [fresh Browse replay](android/browse-replay-current.png), [event detail](android/event-detail-checkout-flow.png), [queue admission](android/post-queue-admission.png), [checked consent](android/checkout-consent-checked.png).
- A fresh replay confirmed Event Detail → queue admission → Checkout: [Event Detail live audit](android/event-detail-live-audit.png), [Checkout with empty form](android/checkout-after-admission-live-replay.png).
- Checkout expiry and recovery: [expired Checkout](android/checkout-expired-after-submit-flow.png), [requeue destination](android/expired-requeue-destination.png), [Browse after recovery](android/expired-requeue-browse-destination.png).
- The fresh Checkout hold expired before buyer/attendee entry could be completed and the flow submitted to Payment/SNAP. No screenshot containing entered identity data was retained. Automated flow tests and Web captures cover the later states; a complete fresh Android purchase run remains unverified in this session.

### iOS simulator

- Existing captures cover Home, Browse, Event Detail, Checkout, Payment/SNAP, Success, QR, share, and queue admission; for example [Checkout to SNAP](ios/native-checkout-snap-flow.png), [Success QR](ios/success-qr.png), and [admitted Checkout](ios/waiting-admitted-checkout-flow.png).
- The simulator was on a stale “Menyiapkan tiket…” loader. Restarting Expo Go and opening the local development URL restored the app Home: [Expo Go restart](ios/relaunch-check.png), [app Home after reopen](ios/reopened-app-home-check.png).
- A fresh interactive iOS replay could not be completed because Computer Use returned `noWindowsAvailable` on simulator clicks. The restart and rendered Home state were verified by simulator capture.

### Web

- Evidence includes Browse/filter, Event Detail/gallery, queue, Checkout, payment, SNAP, Success/QR, profile, and download flows. Representative captures: [Checkout](web/checkout-final-replay.png), [payment](web/checkout-created-payment-final.png), [SNAP](web/checkout-created-snap-final.png), [Success with QR](web/checkout-created-success-qr-final.png), and [ticket download](web/eticket-download-final-replay.html).

## Remaining verification limits

The code and automated suite are green. The evidence limits are the fresh Android Checkout-to-payment replay ending at the hold-expiry screen and the unavailable interactive iOS controls during the final replay. The prior iOS flow captures and Web end-to-end captures remain available above; no claim is made that the two unavailable fresh device replays were completed.
