# RBT-109 E2E Flow and Edge Case Evidence

Date: 2026-11-04
Branch: `feature/RBT-109-native-visual-parity`
App: Expo universal app (Expo Go on native; web served from Metro on port 8081)

## Result

The exercised journeys worked on the available platforms, and the defects found in Browse filtering, payment amount recovery, SNAP wallet selection, and Home navigation were fixed. No uncaught Android JS exception or fatal Android process error was present in the captured log window (`android/runtime-errors.txt` has zero matching lines); the web browser console error capture is in `web/console-after-shared-button-fix.txt`.

This is a documented coverage pass, not proof that every possible action and backend-dependent edge case has been exercised. The mock app cannot validate real queue/payment authority, OTP delivery, or backend failure behavior. Platform coverage and unverified cases are listed below.

## Devices and evidence

- iOS: iPhone 16 Pro Simulator, iOS 18.6. Tab captures: `ios/native-tabs-2/screenshots/`; payment/SNAP outcomes: `ios/payment-flow/screenshots/` and `ios/snap-outcome/screenshots/`.
- Android: `emulator-5554` (`sdk_gphone64_arm64`, Expo Go). Captures: `android/`.
- Web: Chromium through Playwright CLI. Captures: `web/`.
- Maestro flows used for native captures are in `flows/`.
- Every capture is a state/action checkpoint where the automation produced a usable screen. Some numbered Android captures are setup/debug screens or stale pre-fix evidence; use the named final captures referenced below when evaluating a fix.

## Flow coverage

| Area / actions | Web | iOS | Android |
|---|---|---|---|
| App entry and bottom navigation | Home, Browse, Tickets, Profile | Home, Browse, Tickets, Profile | Home, Browse, Profile; Tickets tap was not reliably captured |
| Home and event discovery | Hero detail CTA, Browse navigation, search, matching/no-result search, category filters, sort, grid/list, load more | Home and Browse screen/filter via tab flow | Home and Browse; festival filter shows the matching event |
| Event detail | Detail navigation, wishlist, gallery open/next/close, queue CTA | Not fully exercised | Detail view and queue CTA |
| Waiting room | Queue entry, leave confirmation, stay action, auto-advance | Not exercised | Queue entry, queue state, auto-advance to checkout |
| Checkout | Initial state, add/remove, max ticket cap, leave confirmation | Not exercised | Category selection, buyer-NIK toggle, add ticket, automatic redirect |
| Payment/SNAP | Direct payment route, method select, handoff, unknown status, failure/expiry, success, wallet selection | Payment route, QRIS selection, SNAP, GoPay selection, success | Payment route, SNAP amount after refresh, successful payment; timeout/expired screen |
| My Tickets | Upcoming/past tabs, QR open/close, share action | Tab navigation captured; QR/action details not verified | Not fully verified |
| Profile/auth | Guest view, modal open/cancel, invalid email validation | Profile view via tab flow | Profile view |
| Runtime/recovery | Missing-attempt and unknown payment result routes return a visible recovery state | Success handoff verified | No fatal/uncaught JS log matches in captured log window |

## Defects fixed during this pass

1. Home hero “Lihat Detail” now opens the featured event detail.
2. Browse category matching recognizes `fest` fixtures under the Festivals category; the prior literal substring match incorrectly returned zero results for `Rusuh Fest 2026`.
3. Web wishlist control no longer renders as a nested button inside the event-card button.
4. Payment page refresh/cold entry restores the booking amount into session state so SNAP displays the correct amount instead of Rp 0.
5. SNAP GoPay and QRIS wallet options now update and expose selected state when tapped.
6. Event-card animated stacking no longer reads a Reanimated shared value during React render; hover stacking uses React state.

## Remaining findings and limits

- **Native wishlist placement:** toggling works, but the Android capture `android/46-wishlist-overlay-check.png` still shows the heart at the top-left of the image rather than top-right. This is a visible layout defect left unresolved in this pass.
- **Test harness open handle:** all 51 targeted tests pass. Repeated React `act(...)` warnings from draining countdown timers were removed by clearing timers in test teardown. Jest still reports an open handle after the full targeted run; the payment-only diagnostic run also passes 10 tests but does not identify a handle before forced exit. See `targeted-tests.log` and `payment-test-diagnostics.log`.
- **Expo Go:** Android log contains the expected Expo Go remote-notification support warning; remote push delivery needs a development build and was not validated here.
- **Auth:** invalid email and cancel were exercised. A valid OTP request was not sent because it would contact an external recipient; OTP delivery/verification is not verified.
- **My Tickets data:** the mock My Tickets fixture is independent from the just-completed purchase and can show a different event. Ticket tab/modal controls were checked on web, but cross-platform purchase-to-ticket data consistency is not established by this mock pass.
- Real backend queue capacity, payment callbacks, network/offline transitions, and authoritative timeout behavior remain outside this mock-only run.

## Verification

- `npm run typecheck` — passed.
- `npm run lint` — passed.
- Targeted Jest: Browse filter, PaymentScreen, SnapSimulatorScreen — **3 suites / 51 tests passed**. The open-handle and countdown `act(...)` warnings above remain.
- Android log scan for `FATAL EXCEPTION`, `Unhandled JS`, and `Invariant Violation` — zero matches.
- Web console error capture — zero browser errors after the nested-button fix.
- `git diff --check` — passed.

## Key captures

- Web end-to-end checkpoints: `web/01-home-initial.png` through `web/61-browse-wishlist-selected.png`.
- Android filter fix: `android/11-festival-after-fix.png`.
- Android event → queue → checkout: `android/19-event-detail.png` through `android/26-add-ticket.png`.
- Android corrected SNAP amount: `android/31-snap-amount-after-fix.png`.
- Android successful payment: `android/36-success-result.png`.
- Android timeout/expiry handling: `android/39-payment-failure-recovery.png`.
- iOS success journey: `ios/payment-flow/screenshots/` and `ios/snap-outcome/screenshots/`.
