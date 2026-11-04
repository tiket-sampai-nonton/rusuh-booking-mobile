# RBT-112 — Android modal/QR and cross-platform UI fixes

## Evidence

| Area | Before | After | Verification |
|---|---|---|---|
| Android Account sign-in | `before/android-login-broken.png` | `after/android-login-sheet-final.png`, `after/android-login-close-final.png`, `after/android-login-live-pixel7pro.png`, `after/android-login-back-dismiss-pixel7pro.png` | Reopened Expo Go on the Pixel 7 Pro emulator; opened the sign-in sheet, confirmed the scrim, form, cancel/send controls, and dismissed it with both the close control and Android Back. The sheet stays bounded and scrollable. |
| Android Home cards | `before/android-home.png` | `after/android-home-carousel-final.png` | First visible card is in color and the partially visible next card remains grayscale; “Daftar Event” is shown. |
| Android Browse filter | — | `after/android-filter-sheet-final.png` | Filter opens as a bottom sheet with category/time/sort controls and visible actions. |
| Web Event Detail steps | — | `after/web-event-detail-steps.png` | Captured at 1440×1100; all five steps are evenly distributed and centered across the content width. |
| Web mobile Home | — | `after/web-home-mobile.png` | Captured at 393×852 to review the heading, icon-only Home filter, and responsive content. |

## Changes

- Replaced the native sign-in modal window with a screen-level Android sheet, split the backdrop from the sheet, bounded the sheet height, and made the content scrollable. Android no longer autofocuses the email/OTP/name fields when the sheet transitions. Hardware Back dismisses the sheet.
- Changed successful registration CTA copy to “Cari Tiket”.
- Removed the generic native header login icon.
- Renamed the Home event heading to “Daftar Event”; Home’s filter control is icon-only and retains an accessible label.
- Increased Home card image viewability threshold so a partly visible card remains grayscale; the active visible card transitions to color.
- Removed the visible “Gulir” hero hint.
- Reduced Browse header spacing.
- Kept Event Detail back/share controls legible with white fills, borders, and hard shadows. Reviewed the web five-step progress capture; it is already centered, so no stepper layout change was needed.
- Added Android Checkout hardware Back handling to show the existing leave confirmation.
- Ensured the checkout action remains disabled and non-interactive when checkout is not ready.
- Added safe-area padding to Success and additional padding to SNAP.
- Changed web account ticket cards to a responsive multi-column grid.
- Reworked Filter and QR sheets to use screen-level native bottom sheets with safe-area padding and Android Back handling. QR query retries are capped at one.

## Verification

- `npm run typecheck` — passed.
- `npm run lint` — passed.
- Targeted Jest — 4 suites passed, 39 tests passed. Jest emitted existing React `act(...)` warnings from animated components and required `--forceExit` due open animation/timer handles.
- Android visual check — sign-in sheet opens and closes; filter sheet opens. No email/OTP submission or real account data was used.

## Remaining evidence limitation

The mock ticket-history adapter returns an empty booking list and rejects saved-ticket lookup. I could not reach an actual paid ticket to open the QR sheet on Android without first creating a booking; therefore the Android QR display/close flow is source-reviewed and has safe-area/back handling, but is not visually verified with a real or seeded ticket in this evidence set. The Android Studio Device Manager did not expose the already-running emulator as a Computer Use surface. The Pixel 7 Pro AVD was accessible through ADB (`emulator-5554`), which was used for native interaction and live evidence capture.
