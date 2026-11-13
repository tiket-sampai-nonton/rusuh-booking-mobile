# Web guest journey recovery — 2026-11-13

## Environment

- Branch: `fix/RBT-140-cross-platform-readiness`.
- Expo dev server: `http://localhost:8081`, process command `expo start --port 8081`.
- Public runtime configuration inspected on the running process: `EXPO_PUBLIC_ENV=development`, `EXPO_PUBLIC_API_BASE_URL=https://dev.rusuhbooking.my.id/api/v1`, `EXPO_PUBLIC_USE_MOCKS=false`.
- Browser: isolated, unauthenticated in-app browser context at a mobile viewport. Event: Malam Akustik Rintik.
- The test created and cancelled development queue/booking resources. No payment method was selected and no payment was submitted. Raw NIK, email, bearer tokens, booking/session IDs, and request bodies are omitted.

## Observed results

| Scenario                                 | Result                                                                                                            | Evidence                                                                                        |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Guest enters event queue                 | Passed. Event detail → Masuk Antrean → Checkout completed automatically.                                          | Checkout showed the guest form and server countdown.                                            |
| Checkout page refresh                    | Passed. Refresh restored the same Checkout journey, with the server countdown reduced by elapsed time.            | Route remained on Checkout; remaining time moved from about 4:57 to 3:29.                       |
| Guest form privacy after refresh         | Passed. After entering test buyer details without submitting, refresh cleared buyer and attendee fields.          | A value-only check returned `true` for all six inputs being blank; no values were recorded.     |
| Guest checkout submission                | Passed. The authorized test booking advanced to Payment.                                                          | Payment screen showed the event, selected category, and amount; no payment method was selected. |
| Internal Back from Payment               | Passed. Confirming “Ya, keluar” returned Home.                                                                    | Home was visible after cancellation reconciliation.                                             |
| Cancel, then re-enter same event         | Passed. The same event returned to a fresh Checkout with blank buyer/attendee fields.                             | A new queue/checkout was created; cancelling the fresh checkout returned Home.                  |
| Browser tab close/reopen during Checkout | Passed. A new tab restored the active Checkout route and remaining server countdown; guest fields remained blank. | Remaining time was about 4:34 after reopening; confirming cancellation returned Home.           |

## Network and console evidence

- The process serving port 8081 was verified to use the dev API and `EXPO_PUBLIC_USE_MOCKS=false`.
- The browser rendered the live development event data and progressed through queue, checkout, booking, and payment UI. The browser automation surface did not expose a request trace, so individual HTTP methods, response codes, idempotency keys, and the exact cancellation endpoint were not captured live. The endpoint behavior is covered by repository code review and automated tests, not represented here as a captured network trace.
- Browser console contained two existing development warnings about deprecated `shadow*` and `pointerEvents` styles, and no observed console errors in the guest flow.
- The signed-in Chrome session was kept separate; its account values were not used in this guest test or saved as evidence.

## Not verified in this browser pass

SNAP handoff/close, payment expiration, stale payment notifications, payment/cancellation race, offline/reconnect, expiry while offline, force-close during booking submission, five repeated restarts, and a signed-in journey remain unverified here. No financial payment was attempted.
