# Android offline checkout — 2026-11-13

## Environment

- Pixel 7 Pro Android emulator (API 36), current branch, local Expo development server on port 8081, development backend.
- Guest flow. No buyer or attendee data was entered; no booking/payment was submitted.
- This is an emulator run, not a physical Android device.

## Observed

- Event detail → queue → Checkout completed using live development event data. Chucker showed event/queue activity; sensitive booking/payment traffic was not copied or exposed.
- In Android Quick Settings, both Wi-Fi and mobile data were switched off. Checkout remained visible and displayed the connection-lost message explaining that the form remains available while the app stays open and NIK must be re-entered after an app restart.
- No checkout form data had been entered, so no guest input was at risk in this run. The checkout countdown continued while offline; this observation does not establish server expiry or cancellation.
- Wi-Fi was switched back on while mobile data remained off. After confirming exit from Checkout, the app returned to Home and loaded the development event list, confirming network access had recovered.
- The temporary checkout was exited. No payment was attempted.

## Not verified

- Force-closing/reopening while still offline, offline journey restoration, reaching the deadline offline, and automatic status reconciliation after reconnect were not completed in this pass.
- The exact cancellation HTTP request and response were not captured. Chucker was used only to confirm safe event/queue activity; sensitive endpoints are excluded.
- No screenshot or recording was saved, to avoid retaining backend identifiers from the live event list.
