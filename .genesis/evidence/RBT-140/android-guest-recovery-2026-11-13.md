# Android guest journey recovery — 2026-11-13

Environment: Pixel 7 Pro Android emulator, local debug app and Metro on port 8081, development backend, guest user. No payment was submitted. This is an observation record; request bodies, identifiers and personal information are intentionally omitted.

## Observed

- A claimed, active checkout restored after force-stop, with its original countdown continuing. The restored checkout was completed through to the payment page.
- Before the fix, force-stop on that active payment and reopening returned to the older checkout instead of payment.
- After the queue/payment recovery priority fix, reopening the same active booking returned to payment with its countdown continuing. Confirming leave returned to Home.
- A separate fresh checkout was force-stopped and reopened after the fix; it restored with its countdown continuing. Confirming leave returned to Home.
- A checkout with its server deadline already elapsed showed the old expiry screen before the fix. After changing confirmed expiry handling, the app returned Home and stayed on Home after force-stop/reopen.
- Older payment/cancellation notification links are now checked against locally persisted active payment and queue references; automated tests cover avoiding interruption of a newer active journey.
- The cancellation UI results were observed; this is not a captured network trace. Chucker excludes sensitive booking and payment endpoints in this build.

## Automated coverage

Targeted Jest checks cover recovery priority, absent and expired checkout, expired payment status, failed status verification, stale notification links during a newer payment or queue, and payment cancellation notification copy. See test output from the local run.

## Not yet verified end to end

Payment expiration after app closure, actual notification taps, payment continuation through SNAP, reconnect behavior, and repeated restarts remain to be tested against the live backend. No screenshot or recording was saved for these observations. The locally installed development build needs Metro to restart; it is not the CI bundled APK.
