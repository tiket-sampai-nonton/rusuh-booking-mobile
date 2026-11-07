# Expo SDK 53 upgrade — native and dependency validation evidence

- Device: Pixel_7_Pro_Edited emulator (Android 16 / API 36)
- Build: `./gradlew assembleDebug --no-daemon`, after `npx expo prebuild --clean --platform android`
- Engine: `hermesEnabled=true`; APK contains `libhermes.so` for arm64-v8a, armeabi-v7a, x86, and x86_64.
- Runtime: app installed and launched to the home screen; Android logcat reported `Running "main"` and no app runtime exception on the successful launch.
- Screenshot: `android-hermes-home.png`
- Scope: launch smoke check only; booking-flow QA is not covered here.
- Additional navigation smoke: Home → Browse → event detail completed on the same emulator without a React Native JS exception. Screenshots are `android-browse.png` and `android-event-detail.png`.
- iOS smoke: Hermes app rendered the home screen on an iPhone 16 Pro simulator with iOS 18.6; screenshot is `ios-hermes-home.png`.
- Patched Metro bundle smoke: `EXPO_PUBLIC_SITE_URL=https://rusuh-booking.pages.dev npx expo export --platform android --max-workers 2` passed; Metro bundled 2,090 modules and emitted a 5.47 MB Hermes bundle.
- Automated gates: clean `npm ci` and `npx expo install --check` pass; `npm run typecheck` passes; `npm test -- --runInBand` passes (185 suites / 1,094 tests); `npm run lint` exits 0 with 29 existing `require()` warnings; `npm audit --omit=dev --audit-level=high` exits 0 with 0 high/critical, 1 low and 17 moderate production findings; static web export passes.
- iOS native compile: unsigned arm64 simulator build on Xcode 26.6 succeeded. The local fmt config plugin disables `FMT_USE_CONSTEVAL` for this build; see `.genesis/docs/EXPO-53-UPGRADE-NOTES.md` for the tradeoff and scope.
- G3 evidence approval: received before PR creation.
- These are local smoke and build checks. They do not cover a full native booking/payment flow, physical-device QA, release signing, or GitHub Actions CI.
