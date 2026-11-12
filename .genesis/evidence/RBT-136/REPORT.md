# RBT-136 OTA diagnosis and fix

Date: 2026-11-12
Branch: `fix/RBT-136-ota-enabled-guard`

## Diagnosis

The failing gate was in `ExpoAppUpdateAdapter.isEnabled`. Commit `de1e4ad` added
`Constants.expoVersion !== null` as an Expo Go check. In the installed SDK 53
bare Android implementation, the native constants map omits `expoVersion`; the
JavaScript wrapper spreads that map without assigning a default. The value is
therefore `undefined`, and `undefined !== null` evaluates to `true`. The
adapter returned `false` before calling any Expo Updates API.

`StartupUpdateBridge` checks `isEnabled` before `checkForUpdateAsync`. The app
config uses `checkAutomatically: "ON_ERROR_RECOVERY"`, so there was no normal
automatic launch check to compensate for the adapter returning false. The
original test fixture always supplied `expoVersion: null`, which masked the
bare Android behavior.

The evidence rules out the suspected fingerprint/channel mismatch for the
investigated release: Firebase run `43174293110` produced APK versionCode 99
with runtime fingerprint `635ad7f64b0ebc031b43174f368fc23cc69b1620`. OTA run
`43180445502` published update `01a1ced2-87f9-73ea-aa40-0491b09da800` for the
same runtime on the development channel. The APK manifest had the expected EAS
project URL and channel. The update endpoint returned HTTP 200 from the laptop.
After a cold start, the device still showed the embedded Home heading and its
Expo Updates database had no row for the OTA update. This is consistent with
the app not starting a check; it does not indicate a fingerprint mismatch.

## Changes made locally

- Removed the `expoVersion` runtime check. Expo Go remains excluded through
  `appOwnership` and `executionEnvironment`, while `expo-updates.isEnabled`
  remains authoritative for native availability.
- Updated the regression test to model `executionEnvironment: "bare"` with no
  `expoVersion`, and assert that `checkForUpdateAsync` is called.
- Made Firebase builds fail early if `EXPO_PROJECT_ID` is missing or the
  embedded update channel does not match the selected build environment.
- Corrected the OTA environment setup documentation to match the workflow's
  current GitHub Environment injection.

## Verification

- Full Jest suite after the regression cases were added: **194 suites, 1,193 tests passed**.
- OTA adapter test: **9 tests passed**; changed adapter coverage is **96.87% statements, 95.65% branches, 100% functions, and 96.42% lines**.
- TypeScript typecheck: passed.
- Targeted ESLint: passed.
- Prettier check: passed.
- Android/iOS fingerprint stability check: passed; release counters do not
  change the fingerprint, and a native app-link change does.
- Resolved Expo config check: fingerprint runtime policy, project ID, update
  URL, and `development` channel matched the expected values.
- Both GitHub workflow YAML files parsed successfully; `git diff --check`
  passed.

## Device proof still required

No commit, push, Firebase build, or OTA publication was made after this fix.
The installed APK contains the old adapter and cannot self-update through the
failing gate. One new signed Firebase APK containing this fix is required.
After installing it, publish a harmless JavaScript-only change and verify on
the device that it requests, downloads, and launches the new update ID without
changing the APK versionCode. Until that device run is complete, the code-level
root cause is confirmed but the repaired delivery path is not yet device-proven.
