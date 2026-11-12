# RBT-084 — EAS OTA setup evidence

Captured: 2026-11-07
Branch: `codex/rbt-084-eas-ota`
Commit: `b7999b0`

## Expo project and app configuration

The Expo project `@chelseacry/rusuh-booking` is linked by project ID. The app keeps the slug
`rusuh-booking-mobile`; the Expo owner is `chelseacry`.

Resolved configuration with `EXPO_PROJECT_ID` and `EAS_CHANNEL=development`:

```json
{
  "owner": "chelseacry",
  "slug": "rusuh-booking-mobile",
  "projectId": "a3d40c88-781e-4b6a-89a9-efd4608cd14f",
  "updatesUrl": "https://u.expo.dev/a3d40c88-781e-4b6a-89a9-efd4608cd14f",
  "channel": "development",
  "runtimeVersion": "0.1.0",
  "updatesPlugin": true
}
```

Expo dashboard verification:

- Project environment `development` has `EXPO_PUBLIC_API_BASE_URL=https://example.invalid/api`,
  `EXPO_PUBLIC_ENV=development`, `EXPO_PUBLIC_USE_MOCKS=true`, and
  `EXPO_PUBLIC_SITE_URL=https://rusuh-booking.pages.dev`, all as plain text.
- The `development` update channel is active and linked to the `development` branch.
- GitHub's `development` environment contains variable `EXPO_PROJECT_ID` and secret `EXPO_TOKEN`.
  The token value was not read.

Dashboard references: [Expo environment variables](https://expo.dev/accounts/chelseacry/projects/rusuh-booking/environment-variables)
and [Expo channels](https://expo.dev/accounts/chelseacry/projects/rusuh-booking/channels).

## Local quality and web gates

| Gate | Result |
|---|---|
| `npm run typecheck` | Pass |
| `npm run lint` | Pass; 31 existing `require()` warnings, 0 errors |
| `npm run format:check` | Pass |
| `npm run test:coverage -- --runInBand --ci` | Pass; 186 suites and 1,103 tests |
| `npm audit --omit=dev --audit-level=high` | Pass; no high or critical findings |
| `npx expo export --platform web` | Pass; 41 static routes exported |
| `npm run web:metadata` | Pass; sitemap generated for 9 public routes |
| `EXPO_PUBLIC_SITE_URL=https://rusuh-booking.pages.dev npm run web:verify` | Pass; SEO and gzip budgets |

`git diff --check` also passed.

## Still required before automatic OTA

- Merge the native `expo-updates` configuration to `develop` and build a fresh
  `rusuh-booking.preprod.apk` through Firebase Distribution.
- Install that APK on a QA device and verify a JavaScript-only OTA update applies.
- Rehearse rollback on the QA channel and capture the resulting device evidence.
- Only after those checks, set repository Actions variable
  `EAS_OTA_DEVELOPMENT_ENABLED=true`. Production OTA remains unconfigured.

No OTA update has been published, and no rollback has been tested in this evidence capture.
