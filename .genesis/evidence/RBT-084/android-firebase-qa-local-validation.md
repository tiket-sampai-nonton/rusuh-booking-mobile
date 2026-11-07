# RBT-084 — Android Firebase QA workflow local validation

Date: 2026-11-07

Implementation commit: `a256521` (`codex/rbt-084-android-firebase-distribution`)

## Scope

The new manual workflow requires the `develop` ref, runs quality gates, builds a signed Android release APK with development mocks enabled, distributes the APK to the configured Firebase App Distribution group, and reports the result to Telegram.

## Live local checks

| Check | Result |
|---|---|
| `npm run typecheck` | Passed |
| `npm run lint` | Passed with 31 existing `no-require-imports` warnings and 0 errors |
| `npm run format:check` | Passed, including the Android signing config plugin and workflow YAML |
| `npm run test:coverage -- --runInBand --ci` | Passed: 186 suites, 1,103 tests |
| `npm audit --omit=dev --audit-level=high --json` | Exit 0: 0 high, 0 critical, 17 moderate, 1 low |
| Expo public config with `ANDROID_VERSION_CODE=42`, `EXPO_PUBLIC_USE_MOCKS=true`, and development environment values | Passed; Android package is `com.tiketsampainonton.rusuhbooking`, version code is `42` |
| Isolated `npx expo prebuild --platform android --clean --no-install` | Passed; generated Gradle file uses the QA release signing config and reads `ANDROID_KEYSTORE_PATH`. Expo printed non-blocking `EDGE_TO_EDGE_PLUGIN` and `expo-system-ui` configuration warnings. |
| `git diff --check` | Passed |

The Android prebuild was generated in a temporary copy of the client project, so the local ignored `android/` directory was not cleaned or replaced.

## Not yet verified

- `./gradlew assembleRelease` on GitHub's Ubuntu runner.
- Firebase App Distribution upload and Telegram notification from the workflow.

GitHub only exposes `workflow_dispatch` for a workflow file present on the repository's default branch (`main`). This workflow is currently on the feature branch, so the real runner and Firebase delivery cannot be exercised until the change reaches `main`. No APK was uploaded and no QA testers were notified by these local checks.
