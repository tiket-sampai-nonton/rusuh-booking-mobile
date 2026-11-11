# RBT-132 verification evidence

Date: 2026-11-11
Branch: `fix/RBT-132-session-auth-ux`
Web verification used port `8081`.

## Native smoke checks

- Android debug app built and installed with `npx expo run:android --device 2311DRK48G`, then force-stopped and relaunched on the connected Poco Redmi (model `2311DRK48G`). Home rendered after restart: [android-launch-final.png](./android-launch-final.png).
- iOS debug app built and installed with `npx expo run:ios --device E80F96A4-1DF0-42CC-85EC-DE5B27B0333E --no-bundler`; Home rendered after restart in the iPhone 17 Pro simulator: [ios-launch-final.png](./ios-launch-final.png).
- The iOS build succeeded. Xcode reported one existing SDWebImage deployment-version warning; no build errors occurred.

## Web flow checks

- Opened the Home history preview card. It navigated to `/events/{eventId}?source=history`; the event detail rendered without the `join-cta` element: [web-history-detail.png](./web-history-detail.png).
- Opened the login modal. The email field rendered and the demo OTP hint was absent. Focused input keeps its left border: [web-login-modal.png](./web-login-modal.png).
- Dev API requests observed on port 8081: event list and event detail both returned HTTP 200.
- Browser run had zero console errors (two existing warnings).
- Recording: [web-history-detail.webm](./web-history-detail.webm).

## Automated checks

- `npm run typecheck` — passed.
- Full Jest suite — **192 suites, 1,169 tests passed**. This includes app/providers, localStorage adapter and account restoration, queue membership recovery, login modal, waiting room, checkout, history, event detail, profile/logout, and Home history routing.
- `npm run lint` — passed with zero errors; 31 existing warnings remain.
- `npm run format:check` — passed.
- `EXPO_PUBLIC_SITE_URL=https://rusuh-booking.pages.dev npx expo export --platform web` — passed.
- `EXPO_PUBLIC_SITE_URL=https://rusuh-booking.pages.dev node scripts/generate-web-metadata.cjs` — passed.
- `EXPO_PUBLIC_SITE_URL=https://rusuh-booking.pages.dev npm run web:verify` — passed: 9 public routes, 16 transactional routes, SEO metadata, and gzip budgets.

## Covered behaviors

Queue claim recovery routes a persisted claimed membership to its active checkout session and shows a recovery state while restoring, preventing the native flicker. User-requested auth success/failure toasts, OTP paste support, five-second success dismissal, localStorage web persistence, history navigation/CTA hiding, canonical URL-only sharing, and native safe-area CTA spacing are covered by the targeted component and adapter tests above.
