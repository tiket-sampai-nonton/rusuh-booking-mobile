# RBT-168 — Cross-platform edge-case and performance audit

**Task:** [RBT-168 — cross-platform E2E, edge cases, and performance](https://github.com/tiket-sampai-nonton/rusuh-booking-mobile/issues/168)  
**Branch:** `codex/RBT-168-cross-platform-perf`  
**Date:** 2026-11-10  
**Test target:** Real dev BE (`https://dev.rusuhbooking.my.id/api/v1`), Android/iOS Expo Go simulators, and Android/iOS Release builds. Browser calls to the real BE used frontend port **8081**, the only allowed CORS origin.

## Summary

The audit found and fixed several issues:

1. Home mounted every event card even though it only needs a preview. It now renders at most 8 upcoming and 4 history cards.
2. Browse and History rendered the complete collection in regular scroll views. Both now use virtualized `FlatList`s; Browse renders small batches and clips offscreen rows on Android.
3. Browse showed a “load more” control although the consumed BE contract has no pagination. The misleading control and its test were removed.
4. Expo Go on SDK 53 could crash at startup when the app imported `expo-updates` or tried to register remote push. OTA calls are now lazy and disabled when Expo Go is detected; notification response handling sits behind `NotificationPort`, and unsupported push registration degrades to no token.
5. Home/Browse bottom-tab switches accumulated duplicate routes in the root stack. Navigation now dismisses to the existing tab destination.
6. Native EventCards could mount a second image when both image URLs were the same. They now render one image for the normal BE thumbnail case.

## Black-box findings and retests

| Area / edge case | Evidence and result |
|---|---|
| Real event list and details | Web showed 16 live events. `GET /events` and `GET /events/{eventId}` returned 200. |
| Guest queue and checkout path | `POST /queue-entries` returned 201; queue state and claim returned 200; `POST /booking-sessions` returned 201; session read and stream returned 200. Reached checkout. |
| Missing checkout identity fields | Web, Android, and iOS showed required NIK/email validation when submitted empty. No identity data was entered and no payment was submitted. |
| Expired hold recovery | Expired-session recovery UI appeared on both native simulators; Android recovery to Home and Browse passed. |
| Home and Browse navigation | Android recovered from a stale expired-session route via “Cari Event Lain,” then Browse → guest Profile → Browse passed. iOS Browse → guest Profile → Browse passed; both showed the live 16-event catalog. |
| Guest profile and ticket empty state | Guest profile/login modal opened and closed; My Tickets showed its empty state. |
| History navigation and list reachability | Home “Lihat Semua” opened History. The 14-record live history list was traversed; history cards correctly remain disabled. |
| Expo Go SDK 53 startup | After a cleared Metro rebuild, both simulators opened and navigated in the app. Fresh Android logcat contained no `ExpoUpdates`, `expo-notifications`, or “Cannot find native module” errors. |
| Browser console | Real-API web flow completed with zero console errors. Development emitted Reanimated shared-value and style deprecation warnings. |

### API flow evidence

The real BE guest flow selected **Senja di Kota Tua Fest**, joined its queue, claimed the turn, created a booking session, and opened checkout. Responses observed: events `200`, detail `200`, queue creation `201`, queue state `200`, claim `200`, booking session creation `201`, session read `200`, session stream `200`.

The run stopped at empty-field validation. Payment/SNAP completion and payment callbacks were not exercised.

## White-box findings and fixes

- **Home preview cost:** fixed with an 8-event upcoming preview and 4-event history preview; the “Lihat Semua” links still open full lists.
- **Browse list cost:** `FlatList` now virtualizes the result set, renders bounded batches, and memoizes the row renderer/navigation callback.
- **History list cost:** replaced the full `ScrollView` map with `FlatList`, keeping all history records reachable while only mounting nearby rows.
- **Unsupported pagination UI:** removed Browse’s fake “Muat Lebih Banyak Event” action because the BE contract exposes no pagination.
- **Expo Go update crash:** replaced the eager `expo-updates` import with a lazy adapter guarded by Expo Go runtime detection; unavailable update methods return safely.
- **Expo Go push crash / layer leak:** remote token registration now skips Expo Go; response subscription was moved from the presentation hook into `NotificationPort` and its platform adapters.

These changes follow React Native’s guidance to tune FlatList windowing and batch sizes for the row content and device profile ([FlatList configuration](https://reactnative.dev/docs/optimizing-flatlist-configuration)). Expo Go SDK 53 does not support remote push tokens; a development build is required to verify actual remote delivery ([Expo push FAQ](https://docs.expo.dev/push-notifications/faq/)).

## Native memory and navigation follow-up — 2026-11-10

### Root cause found

The app uses a root Expo Router `Stack`. The custom bottom tabs were calling `router.navigate()` in both directions. On a different active route, React Navigation's stack `navigate` defaults to `pop: false`, so it pushes another route. Five Home → Browse → Home loops therefore retained another Home/Browse pair on the stack each time. Offscreen screens kept their lists, cards, and native views alive. This matches the Android before-fix measurements: after five loops, PSS grew from **545,853 KB to 2,146,938 KB**, native-heap PSS from **333,148 KB to 1,894,588 KB**, and Android Views from **851 to 4,826**.

### Fixes

- Added `navigateBottomTab` in `apps/client/src/presentation/components/design-system/BottomNav/navigation.ts`. Home uses one `push` to preserve the back-to-Home behavior; switching back from another tab uses Expo Router `dismissTo`, which pops to the existing destination or replaces the current route when the destination is absent. Applied it to Home, Browse, History, My Tickets, and Profile. Browse's header Home action also dismisses to `/`.
- In `EventCard`, native cards no longer mount a second `Image` layer when the grayscale and color URLs are identical (the normal BE thumbnail case). The reveal layer remains for fallback URLs where the two sources differ.
- Android and iOS Maestro flows now assert `browse-scroll` is absent after each return to Home, in addition to asserting the Home screen is visible.

The behavior is consistent with the installed Expo Router / React Navigation stack implementation and the documented default for stack `navigate` (`pop` defaults to false); Expo Router's `dismissTo` is the appropriate pop-to-destination operation ([React Navigation actions](https://reactnavigation.org/docs/navigation-actions/), [Expo Router API](https://docs.expo.dev/versions/latest/sdk/router/)).

### Repeated native measurements

Five cycles, six downward scroll gestures on each Browse visit, live 19-event BE response, Maestro, no screen recording during the FPS sample:

| Device / sample | Before | After | Result |
|---|---:|---:|---|
| Android, before fix | 546 MB PSS; 333 MB native heap; 851 Views | 2,147 MB PSS; 1,895 MB native heap; 4,826 Views | Reproduced runaway screen/view accumulation |
| Android, first post-fix warm-up | 468 MB PSS; 291 MB native heap; 505 Views | 569 MB PSS; 354 MB native heap; 510 Views | One-time increase while loading images and warming the runtime |
| Android, five more warm cycles | 586 MB PSS; 364 MB native heap; 528 Views | 581 MB PSS; 359 MB native heap; 515 Views | No per-loop accumulation; the small decrease is consistent with allocator/GC variation |
| iOS, fresh launch then first five cycles | 353 MB physical footprint | About 564 MB after the pass | One-time warm-up; no retained route growth was seen in the repeated flow |
| iOS, five more warm cycles | 564 MB footprint | 561 MB after the pass; 584 MB highest periodic sample | No continued growth across warm cycles |

The first-run Android increase is consistent with images/runtime caches warming; this is an inference from the bounded first pass, flat view count, and stable second pass, not a direct attribution from an allocator trace. iOS measurements use macOS `footprint` physical-footprint values, not virtual address size. The screenshot overlay's multi-gigabyte `RAM` reading is not directly comparable to this physical-footprint measurement.

Android's warm, unrecorded `dumpsys gfxinfo` sample counted **4,445 frames**, with **20.85% janky frames**, p50 **20 ms**, p90 **32 ms**, p95 **40 ms**, and p99 **61 ms**. The app no longer degrades on each loop, though this Expo Go development-emulator run still shows frame misses. React Native documents that development mode adds performance overhead and recommends release builds for production profiling ([Performance overview](https://reactnative.dev/docs/performance)). These numbers are evidence from the test emulator, not a production-device FPS guarantee.

### Native Release verification

After the Expo Go runs, the same live-API flow was run on embedded Release builds (`dev=false`, mocks disabled). Every accepted Maestro pass completed five Home → Browse → Home cycles, with six downward scroll gestures on each Browse visit and both route-visibility assertions at every return to Home. The iOS target was an iPhone 17 Pro simulator on iOS 26.5; Android was the `sdk_gphone64_arm64` / Pixel 7 Pro emulator on Android 16.

| Release run | Android PSS / native heap / Views | iOS physical footprint | Interpretation |
|---|---|---|---|
| First five-cycle pass | 244,924 → 302,789 KB PSS; 131,024 → 164,236 KB native heap; 378 → 903 `meminfo` Views | 32 samples: 153–226 MB (mean 190 MB); 234 MB after pass | Initial runtime and image-cache warm-up; one complete flow passed |
| Warm five-cycle repeat | 315,454 → 321,644 KB PSS; 183,580 → 180,356 KB native heap; 903 → 1,428 `meminfo` Views | 32 samples: 218–281 MB (mean 251 MB); later snapshot 307 MB | Android added about 6 MB PSS; iOS footprint varied during loading and collection |
| Further validation | Android one-cycle warm check: 323,261 → 321,376 KB PSS and 751 → 752 `meminfo` Views | Third five-cycle repeat: 32 samples 190–337 MB (mean 247 MB), ending at 250 MB; 253 MB immediately after | Neither platform continued to grow monotonically; iOS returned to the previous footprint range after the repeated pass |

Android's attached hierarchy stayed at **372 views** after the accepted Release gfx samples. The larger `dumpsys meminfo` Views count fluctuated between reads, then fell to 751 after the one-cycle check; it counts allocated view objects and is affected by collection, so it does not track only attached UI. Android PSS and iOS `footprint` are process-level measurements and are not directly comparable with the simulator overlay's multi-gigabyte `RAM` label.

The Android Release graphics results varied between accepted runs: **3.71% janky frames** / p95 **31 ms** on the first five-cycle pass, and **9.12%** / p95 **42 ms** on the warm repeat (6,086 frames). The third additional Android profiler run could not be completed after the emulator lost DNS resolution; I do not count that partial run as performance evidence. The measured route-stack growth is fixed, but these emulator frame-time samples do **not** establish consistently excellent FPS. They need follow-up on a physical Android device and with a reliable high-volume native dataset before making that claim.

Release route assertions: Android [first five cycles](perf/rbt168-android-release-5cycles-artifacts/2026-11-10_071242/commands-%28rbt168-android-release-5cycles-unrecorded.yaml%29.json), [warm five-cycle repeat](perf/rbt168-android-release-repeat2-artifacts/2026-11-10_071546/commands-%28rbt168-android-release-5cycles-unrecorded.yaml%29.json), and [one-cycle warm check](perf/rbt168-android-release-onecycle-artifacts/2026-11-10_072039/commands-%28rbt168-android-release-onecycle.yaml%29.json); iOS [first pass](perf/rbt168-ios-release-5cycles-artifacts/2026-11-10_073338/commands-%28rbt168-ios-release-5cycles.yaml%29.json), [second pass](perf/rbt168-ios-release-repeat2-artifacts/2026-11-10_073931/commands-%28rbt168-ios-release-5cycles.yaml%29.json), and [third pass](perf/rbt168-ios-release-repeat3-artifacts/2026-11-10_074430/commands-%28rbt168-ios-release-5cycles.yaml%29.json). iOS memory samples: [first](perf/rbt168-ios-release-footprint-samples.txt), [second](perf/rbt168-ios-release-repeat2-footprint-samples.txt), and [third](perf/rbt168-ios-release-repeat3-footprint-samples.txt).

### Retest recordings and logs

- Recorded visual stress passes: [Android, five cycles](perf/rbt168-android-final-5cycles-review.mp4), [iOS, five cycles](perf/rbt168-ios-final-5cycles-review.mp4). Both recordings were inspected; the last frame shows Home.
- Strong route assertions and unrecorded five-cycle runs: [Android Maestro output](perf/rbt168-android-5cycles-unrecorded-artifacts/2026-11-10_064024/commands-%28rbt168-android-5cycles-unrecorded.yaml%29.json), [iOS Maestro output](perf/rbt168-ios-5cycles-unrecorded-artifacts/2026-11-10_064654/commands-%28rbt168-ios-5cycles-unrecorded.yaml%29.json), [iOS live footprint samples](perf/rbt168-ios-live-footprint-repeat2.txt).
- Android measurements: before-fix [memory](perf/rbt168-android-pre-meminfo.txt) / [post-loop memory](perf/rbt168-android-pre-meminfo-after.txt); warm-run [memory before](perf/rbt168-android-repeat2-mem-before.txt) / [after](perf/rbt168-android-repeat2-mem-after.txt); [frame stats](perf/rbt168-android-repeat2-gfx-after.txt); [process snapshot](perf/rbt168-android-repeat2-top-after.txt).

Targeted code checks after these changes: **7 Jest suites / 55 tests passed**, typecheck passed, Prettier passed, ESLint passed with 31 existing warnings and no errors, and `git diff --check` passed.

## Production browser performance — 500 synthetic events

Measured with the production web export at **390 × 844**, with synthetic 500-event responses injected only in the browser. The BE CORS restriction means these synthetic-response measurements were separate from the live-API web flow.

| Screen | Initial render | Scrolled through | At bottom | Approx. JS heap | Long tasks |
|---|---:|---:|---:|---:|---:|
| Home | 8 event cards / 350 DOM nodes | — | — | 22.6 MB | 0 |
| Browse | 20 cards / 575 DOM nodes | all 500; 133 scroll steps | 26 cards / 719 DOM nodes | 70.8 MB | 0 |
| History | 21 cards / 583 DOM nodes | all 500; 128 scroll steps | 26 cards / 703 DOM nodes | 32.3 MB | 0 |

“Long tasks” uses the browser Long Tasks API; heap figures are Chromium measurements, so treat them as device/browser-specific estimates. The final web bundle exported successfully to 42 static routes after the adapter changes.

## Automated checks

- Targeted Jest: **7 suites, 55 tests passed** (Home, Browse, bottom-tab navigation, event card, notification hook/adapters, and Expo Updates adapter).
- `npm run typecheck`: passed.
- `npm run lint`: 0 errors, 31 warnings (`require()` style and unused-variable warnings).
- `npm run format:check`: passed.
- `git diff --check`: passed.
- `npx expo export --platform web --output-dir dist-rbt168`: passed; all 42 static routes generated, then the output directory was removed.

## Evidence files

- Live web screens: [home](rbt168-home-real-api.png), [event detail](rbt168-web-event-detail.png), [checkout validation](rbt168-web-checkout-validation.png), [history](rbt168-web-history-real.png).
- Native screens: [Android Browse](rbt168-android-browse-final.png), [iOS Browse](rbt168-ios-browse-final.png), [Android checkout validation](rbt168-android-checkout-final.png), [iOS checkout validation](rbt168-ios-checkout-final.png), [iOS History](rbt168-ios-history-final.png).
- 500-event production browser run: [Home](rbt168-prod-home-500.png), [Browse](rbt168-prod-browse-500.png), [History](rbt168-prod-history-500.png).

## Remaining limits

- Native end-to-end was validated against the live 16-event catalog, but the 500-event synthetic API harness did not feed the native list reliably. The 500-event performance measurements are therefore browser-only; no native high-volume performance claim is made.
- BE contract gaps O1/O2/O4 remain external: missing FE-NEED fields/endpoints, payment attempt/page-token shapes, and server browse filter/sort/history support. Genre filtering can return no matches when event genre metadata is empty; the client does not infer a genre from the title.
- Successful payment, SNAP callback routing, real remote push delivery, offline recovery, and server-side rate limiting were not exercised in this run.
- The resumed Android Release profiler attempt after pausing could not complete: the emulator resolved neither the BE hostname nor other DNS probes, while the host still returned HTTP 200. Its partial flow is retained as a setup/network failure and excluded from the passing Release measurements above.
- Android network-state evidence: [Home shell with BE data unavailable](perf/rbt168-android-release-network-state.png) and [DNS diagnosis](perf/rbt168-android-release-network-blocker.txt).
