# RBT-110 — Cross-platform UX fixes

Branch: `feature/RBT-110-cross-platform-ux-fixes`
Evidence captured: 2026-11-04
Platforms: Web (Chrome/Playwright), Android emulator, iPhone 16 Pro simulator.

## Screen evidence

| Screen | Web | Android | iOS |
|---|---|---|---|
| Home | [capture](after/web/home.png) | [capture](after/android/home.png) | [capture](after/ios/home.png) |
| Browse | [capture](after/web/browse.png) | [capture](after/android/browse.png) | [capture](after/ios/browse.png) |
| Event detail | [capture](after/web/event-detail.png) | [capture](after/android/event-detail.png) | [capture](after/ios/event-detail.png) |
| Account, guest state | — | [capture](after/android/profile-guest.png) | [capture](after/ios/profile-guest.png) |
| My Tickets, guest state | [capture](after/web/my-tickets-guest.png) | [capture](after/android/my-tickets-guest.png) | [capture](after/ios/my-tickets-guest.png) |
| My Tickets, signed-in | [capture](after/web/my-tickets-authenticated.png) | — | — |
| Profile, signed-in | [capture](after/web/profile-authenticated.png) | — | — |
| Checkout | — | [capture](after/android/checkout.png) | [capture](after/ios/checkout.png) |
| Waiting route recovery → checkout | — | [capture](after/android/queue-redirect-checkout.png) | [capture](after/ios/queue-redirect-checkout.png) |
| Browse compact list | [capture](after/web/browse-list.png) | — | — |

Before captures are under [before](before/). The final native event-detail capture uses `evt-1` so its categories and purchase action are present; `evt-3` was initially captured with a soon-to-open event and is retained only as a data-state comparison.

## RBT-110 checklist

1. **Wishlist removed:** removed favorite controls and callbacks from shared event cards and detail UI on web/native.
2. **Search removed:** removed search UI/state/actions from Home, Browse, My Tickets, and header; Browse category/time filters remain.
3. **Web browse rows:** list mode now uses a compact horizontal event row.
4. **Native ticket tab:** bottom navigation only renders Tiket for an authenticated account.
5. **Native Akun:** profile route no longer shows a My Tickets section; tickets remain a separate authenticated route.
6. **Native signed-in header:** login action is guest-only.
7. **Event detail controls:** back/share targets have larger native hit areas and SVG icons.
8. **Icons:** replaced displayed emoji/text-glyph icons in the changed flows with SVG icons.
9. **Home event imagery:** native cards start grayscale and reveal color as their list item becomes visible.
10. **Native Home:** removed the sales/city stats strip and added prior-event history when history data exists.
11. **Browse spacing:** increased bottom content padding for the native safe area/navigation.
12. **Native detail sections:** gallery, terms, and venue/location render on native as on web.
13. **Queue admission:** removed the five-second countdown; successful claim navigates directly to checkout.
14. **Web detail steps:** centered the five-step flow in its container.
15. **Queue animation:** waiting ring progress animates between server position updates and respects reduced-motion settings; status pulse remains.
16. **Checkout stability:** exercised repeated deep links and waited on both native simulators; form and sticky payment bar remained rendered. The reported intermittent flicker did not reproduce, so no speculative rendering workaround was added.
17. **SNAP spacing:** added horizontal/top/bottom safe-area padding on native and web.
18. **Ticket download:** web triggers a direct HTML ticket download with embedded QR images. Android saves the HTML ticket through the system folder picker; iOS uses the share sheet.
19. **Web navigation:** guests see Beranda and Browse; signed-in users also see My Ticket and Profile, and the sign-in CTA is hidden.
20. **My Tickets:** signed-in users load paginated `GET /api/v1/me/bookings`; paid bookings load server `qrPayload` values from `GET /api/v1/bookings/{id}/tickets`. QR viewing and ticket download are available per booking.
21. **Akun navigation:** guests see sign-in; signed-in users land on editable profile and can sign out (per clarified preference).
22. **Profile:** profile edit and sign-out controls are available on web and native.
23. **Android QR:** QR modal is a bottom sheet with a close action and QR content.
24. **Browse filters:** Browse and Home use the same filter modal and filter dimensions.
25. **Native dialogs:** changed modal flows use bottom-sheet alignment on native, including filter, login, QR, checkout leave, and waiting leave.
26. **Ended queue:** recovery state includes a button back to Home.

## Verification

- `npm run typecheck` — passed.
- `npm run lint` — passed with no lint warnings.
- Targeted checkout, waiting, event-detail, repository, and container tests — 9 suites passed, 102 tests passed.
- Web Home, Browse, and Event Detail captured after reload; Playwright reported 0 errors. Remaining browser warnings are React Native Web `shadow*` style deprecations.
- Browser OTP registration, signed-in navigation, Profile route, and sign-out were exercised with the mock OTP; the menu changed to My Ticket/Profile after sign-in and returned to guest links after sign-out, with 0 console errors.
- Android logcat scan after navigation found no React Native JS errors or fatal exceptions.
- `git diff --check` — passed.

## Limits

- The account-history contract omits venue and event start time. Past/Upcoming tabs use event dates when a matching event is in the catalog and fall back to order status otherwise.
- Native queue captures show checkout after a waiting-route recovery; the automated waiting-room test separately verifies immediate navigation after an admitted claim.
- Android uses the OS folder picker because scoped storage requires a user-selected destination. Web is a direct download.
- The checkout flicker report was not reproducible during repeated native route checks; captures document the stable state tested.

G1/G2/G3 were skipped per the user's explicit authorization. This change is left on the feature branch for review; no release step was performed.
