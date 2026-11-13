# RBT-140 as-built report — 2026-11-13

This report records the RBT-140 work on `fix/RBT-140-cross-platform-readiness`, based on `origin/develop` at `4e1231f795c48bb2f3ac82d2a97d0d151027b61f`. The implementation and evidence are still uncommitted. No push, PR, merge, or GitHub issue closure was performed.

## Outcome

RBT-140 is **partially implemented and verified**. The Browse filter state, payment recovery code paths, connectivity feedback, documentation reconciliation, and web image deferral are implemented. Targeted unit/component tests and simulator launch checks pass. Desktop Lighthouse is green in all applicable categories. Mobile Lighthouse Performance is **not green** (67–76), so the requested “90+ in every category” target is not met. Full payment E2E across physical Android/iOS devices and SNAP was not completed.

## Implemented behavior

| Area | Current behavior | Verification and limits |
|---|---|---|
| Browse filters | The selected category replaces `SEMUA`; category, time, sort, and clear action share a same-height horizontal row. Applied URL/filter state initializes the Browse modal, including navigation from Home. | Verified in the browser at `http://localhost:8081/browse?category=festival&time=week&sort=furthest`; the row and reopened Browse modal showed Festival, Minggu ini, and Terjauh selected. Covered by Browse and FilterModal tests. Narrow-screen row uses horizontal scrolling. |
| Explicit exit before/after SNAP | Payment exit runs through the booking cancellation use case and reconciles payment/booking status before routing. `PAID` takes precedence over cancellation. A locked active SNAP attempt is not reported as cancelled. | Targeted tests cover payment screen and WebView exit/status paths. Live transaction and race were not run. |
| App/browser restore | Only `bookingId` is persisted for journey recovery (SecureStore on native, localStorage on web). On return, FE asks BE for current payment status before restoring or routing terminal outcomes. Raw NIK and SNAP URLs are not persisted. | Storage, hooks, and recovery bridge are covered by targeted tests. BE remains authoritative. A resumable attempt requires BE to expose a usable current attempt/URL. |
| Network loss | `expo-network` is behind a `ConnectivityPort`; the UI shows offline/reconnected state and query refetches on reconnect. Loss of signal does not automatically cancel. Status and expiry are rechecked with BE when possible. | Adapter and payment UI tests cover state handling. Airplane-mode lifecycle was not exercised in a live transaction on a physical device. Installing the new native adapter requires a new Android/iOS build. |
| Web images | Event-card images defer loading until near the viewport. | In the measured Home run, image traffic changed from 16 requests / about 1.20 MB to 7 / about 449 KB. Browse measured 5 image requests / about 190 KB after deferral. Mobile Lighthouse Performance improved only slightly. |

## Payment and provider limits

- The inspected BE contract supports `POST /bookings/{bookingId}/cancel` before the payment lock. Once an attempt locks the booking, the current public Payment API has no separate cancel-attempt endpoint; cancellation can return `BOOKING_LOCKED`. FE reconciles status and leaves the booking recoverable rather than claiming SNAP was cancelled.
- A force-closed app, closed browser tab, or lost connection cannot reliably send a cancellation request. The client restores the booking reference and reconciles with BE on next launch/visit. Browser unload cancellation is not treated as proof of cancellation.
- An active SNAP attempt can be resumed only if BE/provider state still permits it and the current payment response supplies a usable URL. FE cannot guarantee a closed provider page can always be reopened.
- No valid payment or cancellation was submitted during this task. Simulator launch is not equivalent to transaction E2E.

## Architecture and SOLID review

Reviewed the documented layer rules against all `apps/client/src` TypeScript/TSX files (**696 files**, including tests) and the RBT-140 changes. The source-wide ESLint run passed with **0 errors**. The active lint rules enforce inward-only layer imports, ban framework imports in domain/application, prevent presentation imports from infrastructure, and confine TanStack Query to presentation hooks. Additional source scans found no domain/application imports from React/Expo/native packages, no direct presentation imports from infrastructure, and no TanStack Query imports outside `presentation/hooks`.

The added connectivity and payment-journey ports are narrow interfaces; OS/network and persistence details live in infrastructure adapters; concrete implementations are composed at `providers/container.ts`. Cancellation orchestration is represented by an application use case, with screens/hooks consuming it through the presentation layer. This review found **no Clean Architecture boundary violations in the current source tree**. ESLint still reports 31 non-blocking warnings, chiefly existing `require()` style warnings and one unused test import; none are boundary-rule errors. SOLID is a design review rather than a property proven by lint, so this records the boundary and responsibility review, not a formal proof of every class's design.

## Lighthouse

Reports are saved under [`evidence/RBT-140/lighthouse/`](../evidence/RBT-140/lighthouse/). Before/after JSON files include the Lighthouse audits and environment settings. Scores below are baseline mobile versus final mobile, followed by final desktop. All scores are out of 100.

| Route | Mobile before → after: Perf / A11y / BP / SEO | Desktop after: Perf / A11y / BP / SEO |
|---|---|---|
| Home `/` | 73/100/100/100 → **74**/100/100/100 | 98/100/100/100 |
| Browse `/browse` | 74/100/100/100 → **76**/100/100/100 | 98/100/100/100 |
| Event `/events/349fa2e4-77f7-46ff-967c-06955c1a7dde` | 66/95/100/100 → **67**/95/100/100 | 97/95/100/100 |

Mobile profile: Lighthouse 13.6, simulated Android 11 Moto G Power, viewport 412×823 at DPR 1.75, 150 ms RTT, ~1.6 Mbps throughput, CPU slowdown ×4. Desktop profile: 1350×940, DPR 1, 40 ms RTT, CPU slowdown ×1. Runs used a production-like Expo web export, gzip serving on local port 8081, development BE (`EXPO_PUBLIC_USE_MOCKS=false`), and live event data. Thus the profile is repeatable but the local host, API latency, and remote event images can influence results; it is not a deployed production measurement.

Mobile LCP remains 5.7–6.5 s (event detail FCP 3.6 s); the live hero/event images, API-backed content, and JavaScript startup dominate the constrained profile. Deferring card images reduces transfer but did not solve the mobile LCP bottleneck. **Mobile Performance acceptance remains open.** Desktop categories and all mobile Accessibility, Best Practices, and SEO scores are at least 90.

## Test and runtime evidence

- Lighthouse before/after: `evidence/RBT-140/lighthouse/{before,final-mobile,final-desktop}-{home,browse,event}.json`.
- Android emulator app launch: [`evidence/RBT-140/android-emulator-launch.png`](../evidence/RBT-140/android-emulator-launch.png). No physical Android device was available during verification.
- iOS Simulator app launch: [`evidence/RBT-140/ios-simulator-launch.png`](../evidence/RBT-140/ios-simulator-launch.png). No physical iPhone transaction was run.
- Browser filter state was checked on port 8081, with the real dev API and mocks disabled. The current Expo server remains running at `http://localhost:8081`.
- Targeted Jest: **13 suites / 113 tests passed** across payment, payment WebView, checkout, recovery, connectivity adapter, root app, Browse/filter persistence, and event card image deferral. TypeScript typecheck, Prettier check, `web:metadata`, `web:verify`, and `git diff --check` passed. ESLint completed with 0 errors and 31 warnings. Web artifact verification covered 9 public routes, 17 transactional routes, SEO files, and gzip budgets. These tests do not substitute for physical-device or live SNAP E2E.
- Browser filter state was inspected in Chrome through the in-app browser; no standalone browser video/screenshot was saved. Playwright CLI could not launch Chrome in this sandbox (temporary-profile process exited with `EPERM`). The saved Lighthouse JSON and simulator launch screenshots are the retained artifacts.
- Evidence excludes raw NIK, access tokens, and payment credentials.

## Documentation audit

The audit reviewed **48 substantive files** that existed under `.genesis/docs/` before this report was added (49 filesystem entries including `.DS_Store`). It compared implementation, API snapshots, route behavior, architecture, security, testing guidance, and operational instructions. Historical decision and contract snapshots were retained rather than rewritten to imply a new upstream approval.

The 27 root-level documents reviewed were: `01-PHASE-1-REQUIREMENT-ANALYSIS.md`, `02-PHASE-1-GROOMING-AGENDA.md`, `03-GROOMING-DECISIONS.md`, `04-PHASE-2-INDEX.md`, `05-TASK-LIST.md`, `06-TASK-ORDER.md`, `07-SKILLS-MAP.md`, `08-RULES.md`, `09-IMPLEMENTATION-READINESS.md`, `10-PROJECT-SETUP.md`, `ARCHITECTURE.md`, `AS-BUILT-ALIGNMENT-2026-11-12.md`, `DESIGN-SYSTEM.md`, `EDGE-CASES.md`, `EXPO-53-UPGRADE-NOTES.md`, `FE-BE-align-contract.md`, `FE-Flow-Diagrams.md`, `OBSERVABILITY.md`, `PIPELINE.md`, `RBT-119-REFACTOR-ANALYSIS.md`, `README.md`, `SCREEN-API-CONTRACT-COVERAGE-2026-11-07.md`, `SRC-ALIGNMENT-PENTEST-REPORT.md`, `SECURITY.md`, `TESTING-STRATEGY.md`, `WEB-HOSTING-GUIDE.md`, and `analyze native diff.md`.

The 17 API-contract files reviewed were the ten `api-contract/07-11` files (`IMPLEMENTATION-NOTES.md`, `INTEGRATION-RBT-128.md`, `booking-internal.md`, `booking.md`, `integrate-status.md`, `notification.md`, `payment-internal.md`, `payment.md`, `queue.md`, `user.md`) and seven OpenAPI snapshots (`1. User Service API.openapi.json`, `2. Queue Service API.openapi.json`, `3. Booking Service API.openapi.json`, `4. Payment Service API.openapi.json`, `5. Notification Service API.openapi.json`, `Booking Internal API.openapi.json`, `Payment Internal API.openapi (1).json`). The existing evidence screenshot and three mock-fixture files were also reviewed.

Current implementation/runtime changes were reconciled in `03-GROOMING-DECISIONS.md`, `05-TASK-LIST.md`, `ARCHITECTURE.md`, `EDGE-CASES.md`, `FE-BE-align-contract.md`, `FE-Flow-Diagrams.md`, `README.md`, `SECURITY.md`, `TESTING-STRATEGY.md`, `WEB-HOSTING-GUIDE.md`, and `analyze native diff.md`. These clarify the native direct-SNAP redirect, web page-token route scope, recovery storage, connectivity port, cancellation limitations, and test boundary. OpenAPI files remain dated service snapshots; the missing BE cancel-attempt capability is not invented in FE documentation.

## GitHub issue inventory and closure proposal

The repository has 19 open issues in this inventory. **Proposed closure list: none**; RBT-140 does not fully resolve any entire issue, and several are unrelated. No issue was closed.

| Issue | Title | Disposition |
|---|---|---|
| [#195](https://github.com/tiket-sampai-nonton/rusuh-booking-mobile/issues/195) | RBT-139 Resolve SonarCloud promotion findings | Keep open; separate release/code-quality scope |
| [#179](https://github.com/tiket-sampai-nonton/rusuh-booking-mobile/issues/179) | RBT-132 Session recovery and cross-platform auth UX | Keep open; RBT-140 payment recovery is only partial overlap |
| [#175](https://github.com/tiket-sampai-nonton/rusuh-booking-mobile/issues/175) | RBT-130 Smooth image scrolling, pricing, queue recovery, and local notifications | Keep open; broader than image deferral |
| [#168](https://github.com/tiket-sampai-nonton/rusuh-booking-mobile/issues/168) | Cross-platform end-to-end QA and event-list performance | Keep open; device/payment E2E and mobile performance remain incomplete |
| [#165](https://github.com/tiket-sampai-nonton/rusuh-booking-mobile/issues/165) | RBT-128 Align FE HTTP adapters with BE API | Keep open; not fully resolved here |
| [#163](https://github.com/tiket-sampai-nonton/rusuh-booking-mobile/issues/163) | RBT-127 Apply OTA updates during startup and reduce native navigation slowdown | Keep open; unrelated |
| [#160](https://github.com/tiket-sampai-nonton/rusuh-booking-mobile/issues/160) | RBT-125 Polish cross-platform event, checkout, and recovery UX | Keep open; broader than this task |
| [#150](https://github.com/tiket-sampai-nonton/rusuh-booking-mobile/issues/150) | RBT-124 Improve checkout validation and consistent navigation | Keep open; broader checkout scope |
| [#148](https://github.com/tiket-sampai-nonton/rusuh-booking-mobile/issues/148) | RBT-123 Polish app branding and cross-platform UI details | Keep open; unrelated |
| [#140](https://github.com/tiket-sampai-nonton/rusuh-booking-mobile/issues/140) | RBT-122 Align React Native Web screens with v2-after mobile design | Keep open; unrelated |
| [#134](https://github.com/tiket-sampai-nonton/rusuh-booking-mobile/issues/134) | RBT-121 Upgrade Expo client to SDK 53 and validate native runtime | Keep open; unrelated |
| [#112](https://github.com/tiket-sampai-nonton/rusuh-booking-mobile/issues/112) | RBT-110 Cross-platform navigation, booking, and screen UX fixes | Keep open; broader than this task |
| [#109](https://github.com/tiket-sampai-nonton/rusuh-booking-mobile/issues/109) | RBT-087 Complete native visual parity for v2 mobile screens | Keep open; unrelated |
| [#104](https://github.com/tiket-sampai-nonton/rusuh-booking-mobile/issues/104) | RBT-096 V2 Brutalist Mono — Complete Re-implementation | Keep open; unrelated |
| [#82](https://github.com/tiket-sampai-nonton/rusuh-booking-mobile/issues/82) | RBT-085 Code-quality cleanup — audit fixes | Keep open; unrelated |
| [#44](https://github.com/tiket-sampai-nonton/rusuh-booking-mobile/issues/44) | RBT-084 Release readiness | Keep open; release readiness remains broader |
| [#43](https://github.com/tiket-sampai-nonton/rusuh-booking-mobile/issues/43) | RBT-083 QA suites | Keep open; broader QA suite scope |
| [#42](https://github.com/tiket-sampai-nonton/rusuh-booking-mobile/issues/42) | RBT-082 Flash-crowd load test | Keep open; unrelated load testing |
| [#41](https://github.com/tiket-sampai-nonton/rusuh-booking-mobile/issues/41) | RBT-081 Performance + bundle budgets | Keep open; mobile performance target remains unmet |

## Native build and remaining work

`expo-network` was added to implement native connectivity detection. This dependency contains native platform code, so a new Android and iOS development/release build is required before distributing the change; an OTA update alone is insufficient. Simulator launch screenshots were collected, but the full flow needs physical-device QA. Remaining work before RBT-140 can be called complete: bring mobile Lighthouse Performance to 90+, run physical Android/iOS payment and offline/reconnect E2E with SNAP, and confirm any BE support needed for cancelling locked SNAP attempts or reopening their URLs.
