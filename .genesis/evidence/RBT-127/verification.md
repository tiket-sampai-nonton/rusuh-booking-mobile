# RBT-127 verification evidence

Captured on 2026-11-08 from branch `feat/RBT-127-ota-startup-mobile-performance`.

## Live web evidence

- [Home, black-and-pink palette](./web-home-pink-theme.png)
- [Browse, black-and-pink palette](./web-browse-pink-theme.png)
- Both pages were opened from the local Expo web app with mock data. Browser console: zero errors and one existing React Native Web `shadow*` deprecation warning.

## Local gates

| Gate | Result |
|---|---|
| `npm run typecheck` | Pass |
| `npm run format:check` and Prettier check for `tailwind.config.js` | Pass |
| `npm run lint` | Exit 0, no errors; 33 warnings |
| Focused Jest/RNTL | 14 suites, 132 tests passed |
| `EXPO_PUBLIC_SITE_URL=https://rusuh-booking.pages.dev npx expo export --platform web` | Pass |
| `EXPO_PUBLIC_SITE_URL=https://rusuh-booking.pages.dev npm run web:metadata` | Pass; sitemap generated for 9 public routes |
| `EXPO_PUBLIC_SITE_URL=https://rusuh-booking.pages.dev npm run web:verify` | Pass; 9 public routes, 16 transactional routes, SEO files, and gzip budgets |

## Native verification still needed

- No Android device was connected (`adb devices -l` was empty), and no iOS simulator was booted. Native startup OTA download/reload and the reported long-session slowdown were not measured on a device.
- The slowdown fix is based on code inspection: primary navigation previously used repeated stack pushes, while retained screens could continue carousel/CTA animations or queue polling. Primary navigation now uses `navigate`, browse query changes use `replace`, and those background activities pause while their screen is unfocused. This is a likely cause and mitigation, not a profiler-confirmed diagnosis.
- `app.config.js` now sets `updates.checkAutomatically` to `ON_ERROR_RECOVERY`, because the app performs a bounded manual startup check. A newly built native QA APK is required to include that native configuration. Validate the OTA reload on that build before treating the native acceptance criteria as verified.

## Review references

- Expo Updates manual check/download/reload: https://docs.expo.dev/versions/v53.0.0/sdk/updates/
- Expo Router navigation (`navigate` vs `push`): https://docs.expo.dev/router/basics/navigation/
- React Native performance profiling guidance: https://reactnative.dev/docs/performance/

The local `react-native-best-practices` skill listed in the project map was not installed in this environment; the review used the official documentation linked above.
