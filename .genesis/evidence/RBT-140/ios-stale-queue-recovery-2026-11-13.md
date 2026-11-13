# iOS stale queue recovery — 2026-11-13

## Environment

- iOS Simulator running the current branch through the local Expo development server on port 8081.
- Guest session against the development environment. No buyer details were entered and no booking/payment was submitted in this pass.
- Sensitive identifiers and request bodies are omitted. No screenshot was retained because the live event listing contains backend identifiers.

## Result

- The simulator was on a stale Waiting route showing an access/session error. After the recovery change hot-reloaded, it returned to Home rather than continuing to poll the unusable saved queue reference.
- Selecting the same event and entering the queue again reached a fresh Checkout with a new server countdown. This confirms the stale local membership no longer blocks a new attempt.
- Leaving the fresh Checkout and confirming the exit returned to Home.
- Force-closing and reopening the app after that cancellation restored Home, not the old Waiting route.

## Evidence limits

- The simulator UI outcome was observed, but the CUA surface did not expose a sanitized HTTP trace. The exact live response code for the stale visitor token was not captured.
- The root cause is established from the BE handler/contract: `/queue-entries/me` returns `401 VISITOR_TOKEN_INVALID` for an invalid, expired, rotated, or device-mismatched visitor token. The FE previously left the persisted pointer in place and presented the unusable Waiting state again.
- Automated regression coverage verifies that 401 clears stale membership at startup and when the Waiting screen itself receives the invalid-token response.
