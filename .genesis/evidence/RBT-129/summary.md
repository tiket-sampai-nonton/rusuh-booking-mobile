# RBT-129 validation evidence

Date: 2026-11-11
Branch: `fix/rbt-129`
API configuration: development BE (`https://dev.rusuhbooking.my.id/api/v1`), mocks disabled
Task: [RBT-129 issue #173](https://github.com/tiket-sampai-nonton/rusuh-booking-mobile/issues/173)

## Edge cases added to the task

The issue body now contains the failure possibility inventory for release identity and signing, OTA/runtime compatibility, direct routes and deep links, queue retry/cancel/reselect, checkout/payment/session integrity, profile and consent, PII persistence, image errors/cache pressure, sharing fallbacks, price boundaries, and Home/Browse performance and lifecycle behavior.

## Findings and fixes

- Repeated Home/Browse navigation previously recreated the browse view tree. Public Home and Browse now use persistent tabs and freeze the blurred route. On Android, view count plateaued at 831 after Browse loaded instead of growing on subsequent visits.
- Native Home hero titles previously ran a scramble animation that updated large text about 33 times per second for roughly two seconds on each six-second slide. The effect remains on web; native displays the stable event title. This also keeps screen-reader headings readable during slide changes.
- The Android five-cycle performance sample improved from 24.01% janky frames before the native title fix to 8.04% after it. The runs were directional rather than perfectly controlled: simulator state and image-cache warmth differed. Both final five-cycle recordings are from the fixed build.
- The specified stale admission-token flow was reproduced and fixed in the iOS live BE flow earlier in this branch. The final native title change does not touch queue logic; queue join, restore, poll, admission-claim, and stale-token regression tests passed in the final suite.
- The live Malam Akustik Rintik detail API returned `event.minPriceMinor: 0` while its paid categories were Rp 1.850 and Rp 3.500. The detail CTA therefore showed Rp 0 before the fix. The API mapper now derives the minimum from valid category prices and preserves a genuine free category at zero. Rebuilt and installed the Android release app against the dev API; the event detail now shows Rp 1.850 in both the category row and purchase CTA. See [Android detail price verification](android-detail-price-fixed.png).
- Verified Android App Links and iOS Universal Links remain dependent on deployment values. `ANDROID_CERT_SHA256_FINGERPRINT` and `APPLE_TEAM_ID` are currently missing, so operating systems fall back to the browser.

## Automated checks

- Jest: **189 suites, 1,142 tests passed**.
- TypeScript: `npm run typecheck` passed.
- Prettier: `npm run format:check` passed.
- ESLint: passed with 31 warnings and 0 errors. The warnings are the existing `require()` style warnings plus one unused test import.
- `npm audit --omit=dev`: 20 low/moderate advisories (1 low, 19 moderate; 0 high/critical). npm's suggested fix is an Expo 58 major upgrade. The Expo maintainers state that the glob/minimatch findings in their build-time toolchain do not ship in the production app; a forced transitive override was not applied to the locked SDK 53 app. See [Expo SDK dependency assessment](https://github.com/expo/expo/issues/52735), [glob advisory](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4), and [minimatch advisory](https://github.com/advisories/GHSA-g3hv-75wg-m249).
- Web static export: completed with 48 routes.
- Web artifact verification: passed for 9 public routes, 16 transactional routes, metadata/robots/sitemap, Event JSON-LD, and gzip budgets.
- Android/iOS Release simulator builds with the FastImage native module: succeeded. The final Android Release APK was rebuilt and installed against the development API after the price fix; the live event detail showed matching Rp 1.850 category and CTA prices. Android reported generated React Native SVG `$` identifier compiler warnings; iOS reported the SDWebImage deployment-target mismatch and duplicate `-lc++` linker warning on the earlier full compile.
- QA Android `assembleDebug` also succeeded with `RBT_BUNDLE_DEBUG=true`; the APK contained `com.github.chuckerteam.chucker:library:4.1.0`. Installed the debug APK on the Android emulator, granted notification permission, opened the live event detail, and confirmed Chucker recorded the 200 GET event request. Sensitive auth, profile, booking, payment, and queue endpoints remain excluded by the inspector configuration. See [Chucker notification evidence](android-chucker-notification.png).
- After the final DTO price validation change, web static export again completed with 48 routes and artifact verification passed for 9 public routes, 16 transactional routes, SEO files, Event JSON-LD, and gzip budgets.

## Native navigation run

Recorded Android and iOS flows each repeated **Home → Browse → scroll to the bottom → Home** five times. Maestro assertions for the tab and Home hero passed on both devices. The recordings were reviewed via contact sheets before being added here.

| Platform | Device | Capture duration | Result |
|---|---|---:|---|
| Android | Pixel 7 Pro edited emulator, Android 16 | 52.5 s | 5 cycles passed |
| iOS | iPhone 17 Pro simulator, iOS 26.5 | 57.7 s | 5 cycles passed |

## Android performance sample

Measured without screen recording, on the Android Release build. `dumpsys meminfo` and `dumpsys gfxinfo` were sampled at warm Home and after five navigation/scroll cycles.

| Measurement | Warm Home | After five cycles |
|---|---:|---:|
| Total PSS | 225,746 KB | 306,028 KB |
| Total RSS | 339,552 KB | 424,308 KB |
| Attached views | 400 | 831 |
| Bitmap malloc | 99,905 KB | 103,665 KB |

Post-run frame sample: 1,157 frames; 93 janky (**8.04%**); p50 17 ms; p90 23 ms; p95 30 ms; p99 46 ms; 4 missed vsyncs; 24 slow UI-thread frames; 2 slow bitmap uploads. Views plateau at the retained-tab/list size rather than accumulating with each visit. The images cached and Browse route account for part of the PSS increase.

## iOS memory sample

After the final five-cycle run, `vmmap -summary` reported a **314.8 MB physical footprint**, **322.0 MB peak**; process RSS was **301,360 KB**. No crash report was produced. The simulator returned to SpringBoard after Maestro completed; the app process remained alive and reopened successfully.

## Artifacts

- [Android five-cycle recording](android-five-home-browse-cycles.mp4)
- [iOS five-cycle recording](ios-five-home-browse-cycles.mp4)
- [Android contact sheet](android-five-cycle-contact-sheet.png)
- [iOS contact sheet](ios-five-cycle-contact-sheet.png)
- [iOS final Home screen](ios-home-final.png)
- [Android event detail price verification](android-detail-price-fixed.png)
- [Android Chucker notification](android-chucker-notification.png)

## Limits

The matrix is exhaustive for the accepted RBT-129 paths and their identified cross-platform regressions, not a formal exhaustive audit of unrelated application modules. Verified OS links need production/development signing fingerprints and Apple Team ID configured in the deployment environment. The live stale-token repro was completed earlier on iOS; this final native rerun focused on Home/Browse navigation and performance on both platforms.
