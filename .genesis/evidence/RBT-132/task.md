## Goal
Harden session recovery and authentication/event-detail UX across web, Android, and iOS.

## Acceptance criteria
1. Normal waiting-room exit calls `/cancel`. If the app/window closes unexpectedly, resuming the waiting route reconciles queue status with the BE; a `CLAIMED` response restores the current booking session and navigates to `/checkout/{sessionId}`.
2. Login and logout success/failure show clear transient feedback.
3. Focused email input border is fully visible.
4. Remove demo OTP text; OTP accepts paste.
5. On successful OTP/registration, remove the redundant “Keluar” action, allow manual close, and auto-close after 5 seconds.
6. Event sharing sends the canonical URL only, without a title.
7. Auth session remains persistent after web refresh using the user-approved `localStorage` adapter, and after native app restart using SecureStore.
8. Past/history event cards on Home and the History screen open event detail; hide the queue CTA on those history-origin routes.
9. Reduce excess bottom space around the native queue CTA using device safe-area insets.
10. Prevent the native waiting screen from flashing “Sesi antrean sudah digunakan” while an admitted session transitions to checkout.

## Verification
- Focused Jest/RNTL tests, typecheck, lint, formatting, and web static export verification.
- Browser checks at `http://localhost:8081` for Home history navigation and CTA hiding, login modal text/input, and API-backed page loading.
- Native builds and launch smoke checks on the connected Poco Redmi and iPhone 17 Pro simulator.
- Evidence files are stored beside this task.

## Constraints
- Preserve current BE contracts and Clean Architecture boundaries.
- No new runtime dependency without approval.
- Backend remains authoritative for queue/session state.
