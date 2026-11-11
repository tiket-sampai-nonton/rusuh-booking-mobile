# RBT-130 — Native performance and regression evidence

Date: 2026-11-11  
Branch: `fix/RBT-130`  
Platforms checked: physical Android device and iOS Simulator

## Cause found and change made

Native event cards were using the same animated card implementation as web. Each virtualized card created Reanimated shared values and animated styles for hover, stagger, image scale, badge, shadow, and title effects that native cards do not need. More significantly, Unsplash cards loaded a grayscale base image and a second color reveal image, with memory caching disabled for both. The source URL requested 1200 px images even when a card rendered at roughly half that width. Each mount also subscribed to responsive window dimensions although native layout is fixed.

`EventCard` now renders a memoized static native card with regular React Native views and text; the animated implementation remains for web. Native cards load one color image, allow FastImage's memory cache to work, and request a 576 px, quality-75 thumbnail in grid mode or 960 px in list mode. Browse and Home no longer update React state from list viewability callbacks during scrolling. Home's native hero autoplay was disabled, and both event lists use bounded FlatList rendering. The existing iOS FastImage configuration caps its memory cache at 128 MiB and disk cache at 512 MiB with 30-day expiry; Android uses Glide's defaults, with the smaller requested source images reducing decoded bitmap size there.

This follows React Native's guidance to keep virtualized list items light and to profile frame deadlines and missed frames rather than infer smoothness from screenshots ([FlatList optimization](https://reactnative.dev/docs/optimizing-flatlist-configuration), [profiling](https://reactnative.dev/docs/profiling)). FastImage supports explicitly bounded native memory and disk caches ([cache configuration](https://github.com/DylanVann/react-native-fast-image/blob/main/docs/how-is-caching-handled.md)).

## Android physical-device run

Device: ASUS ROG Phone 8, Android 16, 1080 × 2400. I ran five cycles of Home vertical scrolling and horizontal event-carousel scrolling, Browse navigation and vertical scrolling, then return to Home. Each cycle reset and captured Android `dumpsys gfxinfo`; the whole interaction was recorded. The QA debug APK included the embedded JS bundle and Chucker.

| Refresh mode | Cycle | Frames | Janky | P95 frame time | Missed frame deadlines |
|---|---:|---:|---:|---:|---:|
| 60 Hz | 1 | 300 | 2.00% | 18 ms | 6 |
| 60 Hz | 2 | 315 | 0.95% | 22 ms | 3 |
| 60 Hz | 3 | 313 | 0.96% | 9 ms | 3 |
| 60 Hz | 4 | 314 | 0.96% | 11 ms | 3 |
| 60 Hz | 5 | 312 | 0.96% | 12 ms | 3 |
| 120 Hz | 1 | 514 | 6.42% | 17 ms | 33 |
| 120 Hz | 2 | 601 | 0.67% | 13 ms | 4 |
| 120 Hz | 3 | 609 | 0.49% | 7 ms | 3 |
| 120 Hz | 4 | 612 | 0.65% | 7 ms | 4 |
| 120 Hz | 5 | 609 | 0.66% | 11 ms | 4 |

The 120 Hz mode was verified in the display service both immediately before and after the recording. The 120 Hz first cycle includes the initial warm-up; the following four repeated cycles stayed below 0.7% janky frames. `dumpsys gfxinfo` counts render frames and deadline misses, not continuous idle refreshes, so these results do not claim a constant measured FPS value.

Android process PSS was 405.9 MiB before and 454.0 MiB after the 60 Hz run; it was 413.0 MiB before and 455.2 MiB after the 120 Hz run. This is the expected image/cache warm-up range across the five cycles, with no runaway growth toward the reported multi-gigabyte figure. The original 60 Hz preference was restored and verified afterward.

Evidence:

- 60 Hz recording: [`final-scroll-android-60hz-ultra-durable-final.mp4`](./final-scroll-android-60hz-ultra-durable-final.mp4)
- 60 Hz frame and memory captures: [`final-gfxinfo-cycles-60hz-ultra-durable-final.txt`](./final-gfxinfo-cycles-60hz-ultra-durable-final.txt), [`final-meminfo-cycles-60hz-ultra-durable-final.txt`](./final-meminfo-cycles-60hz-ultra-durable-final.txt)
- 120 Hz recording: [`final-scroll-android-120hz-verified.mp4`](./final-scroll-android-120hz-verified.mp4)
- 120 Hz mode and frame captures: [`final-display-before-120hz-verified.txt`](./final-display-before-120hz-verified.txt), [`final-display-120hz-verified.txt`](./final-display-120hz-verified.txt), [`final-gfxinfo-cycles-120hz-verified.txt`](./final-gfxinfo-cycles-120hz-verified.txt)
- Recorded Browse list and formatted prices: [`android-browse-price-static-cards.png`](./android-browse-price-static-cards.png)
- Restored phone display preference: [`android-display-restored-60hz.txt`](./android-display-restored-60hz.txt)
- Repeatable capture script: [`record-android-scroll.py`](./record-android-scroll.py)

## iOS Simulator run

The updated app was rebuilt and run on an iPhone 17 Pro simulator (iOS 26.5). The same five-cycle Home/Browse flow completed with 30 of 30 Maestro actions successful. The Browse recording shows 16 event cards, including the expected `Rp 275.000` price.

- Recording: [`ios-scroll-five-cycles-static-cards.mp4`](./ios-scroll-five-cycles-static-cards.mp4)
- Maestro result: [`commands-(ios-scroll-five-cycles.yaml).json`](./ios-maestro-final-static-cards/2026-11-11_083048/commands-(ios-scroll-five-cycles.yaml).json)
- End screenshot: [`ios-home-end-static-cards.png`](./ios-home-end-static-cards.png)
- Browse screenshot with the `Rp 275.000` event price: [`ios-browse-price-static-cards.png`](./ios-browse-price-static-cards.png)
- Memory capture: [`ios-memory-final-static-cards.txt`](./ios-memory-final-static-cards.txt)

The post-run `vmmap` snapshot reported a 384.8 MiB peak physical footprint for a simulator process marked as a corpse. A separate live `ps` capture after relaunch measured about 180 MiB RSS. These are iOS Simulator measurements, not physical iPhone memory figures. No physical iPhone was connected. Xcode's Animation Hitches instrument reported that hitches are unsupported on this simulator runtime, so iOS FPS could not be measured with that instrument. The video verifies the interaction flow, but it does not substitute for a physical iPhone FPS trace.

## Other RBT-130 checks

- Price formatting now treats the BE `*Minor` values as whole rupiah; `275000` displays as `Rp 275.000`.
- Splash tagline is `Pesan tiket tanpa ribet`, constrained to one line.
- Local Notifee messages are wired for payment success/failure, leaving payment, and leaving the waiting room. Android waiting-room exit delivery was observed on-device; notification rule/adapter/payment wiring is covered by focused tests. A real payment terminal state was not generated on-device.
- Full Jest suite: 189 suites and 1,149 tests passed.
- The Malam Akustik Rintik re-entry case remains a BE contract gap. Cancel releases the admission allocation but the BE code does not publish the queue journey-ended transition, leaving the one-use admission entry `CLAIMED`; a second join then gets `ADMISSION_TOKEN_INVALID`. FE now stops polling that claimed token and provides recovery instead of looping. Immediate same-event re-queue needs a BE lifecycle fix (tracked in issue #175); it cannot be truthfully implemented by FE alone.

## Local verification

- Android debug build: succeeded.
- iOS simulator build: succeeded.
- TypeScript: passed.
- Prettier: passed.
- ESLint: 0 errors, 31 warnings (mostly existing dynamic-import warnings).
- Full Jest suite: 189 suites, 1,149 tests passed.
- Prettier and `git diff --check`: passed.
