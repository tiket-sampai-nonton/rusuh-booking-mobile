# RBT-119 — Expo client refactor analysis

- **Status:** Refactor implementation complete; cross-platform visual verification remains partial
- **Branch:** `chore/RBT-119` from `develop` (`b3c2b1b`)
- **Tracker:** [#128](https://github.com/tiket-sampai-nonton/rusuh-booking-mobile/issues/128)
- **Baseline captured:** 2026-11-04
**Evidence:** `.genesis/evidence/RBT-119/`

## Research findings

### Component and screen organization

- React recommends deriving component boundaries from the UI hierarchy and placing nested visual regions in child components. Keep state at the closest owner that coordinates the behavior; flow state downward via props. [Thinking in React](https://react.dev/learn/thinking-in-react), [Sharing State Between Components](https://react.dev/learn/sharing-state-between-components)
- For this codebase, screens should own route inputs, data/query composition, action wiring, and screen-level state. Screen-specific view regions belong in that screen's `fragments/`; shared UI belongs in `presentation/components/`. A component should be declared in its own module/folder when it has an independent role, test surface, or reuse. Avoid splitting trivial markup solely to increase file count.
- “More than one component per file” is interpreted as screens composing multiple fragment components. Each component declaration remains in its own file/folder, consistent with the explicit per-component-folder requirement.
- Fragments here are project-local screen fragments; this does not refer to React's `<Fragment>`.

### Styling

- NativeWind is already the locked project styling choice. Use it for stable visual rules and tokens; use named `StyleSheet` definitions or style factories only for computed/animated/platform values that cannot be expressed clearly with the existing utilities. React Native documents `StyleSheet` as a named, type-checked way to organize styles and still supports a `style` prop for dynamic values. [NativeWind](https://www.nativewind.dev/), [React Native Style](https://reactnative.dev/docs/style), [StyleSheet](https://reactnative.dev/docs/stylesheet)
- Preserve the existing token source (`apps/client/tailwind.config.js`) and platform presentation adapters. Do not introduce a new styling package or a new architecture layer.

### Testing, SOLID, and Clean Architecture

- UI tests should exercise the experience through accessible controls and observable results rather than mirror implementation details. [React Native Testing Library](https://callstack.github.io/react-native-testing-library/), [Testing Library guiding principles](https://testing-library.com/docs/guiding-principles/)
- Follow `.genesis/docs/ARCHITECTURE.md` and `.genesis/docs/08-RULES.md`: dependencies point inward; domain/application stay framework-free; presentation uses application/domain and does not import infrastructure; concrete adapters are wired only in the composition root. Extract abstractions around real policy/variation, not just to satisfy SOLID labels.
- Project testing guidance currently sets ≥90% for shared domain/application, while RBT-119 asks for ≥90% per applicable file. The final report will show per-file measured results and explicitly identify files that Jest cannot measure; it will not silently exclude them.

## Baseline inventory

Captured from `develop` at `b3c2b1b` before application-source edits.

| Check | Baseline |
|---|---|
| `apps/client/src` files | 356 |
| Files with `V2`-prefixed names | 19 (including tests) |
| TypeScript `V2` identifiers/references | 365 across 39 files |
| Inline `style={{...}}` object occurrences | 498 across 56 TSX files |
| Typecheck | Fails in `EventDetail/fragments/Lightbox.tsx` (two `PressableStateCallbackType.hovered` type errors) |
| Lint | Passes |
| Test suite | 105 suites / 816 tests pass; Jest reports it did not exit one second after tests (open async handles) |
| Overall Jest coverage | 79.57% statements, 68.23% branches, 74.82% functions, 80.73% lines |
| Console warnings | RNTL reports repeated unwrapped `Animated(View)` / timer updates (`act(...)`) in animated/modal/checkout tests; exact counts to follow baseline run |

### Baseline screen captures

Web mobile captures were produced from the running app at `localhost:8081`; desktop Home is captured at 1365×900. Native captures are from the booted iPhone 16 Pro simulator and Android emulator. Android was already on the expired-session screen at capture time, so that image is labeled as an expired-state capture and is not represented as Home.

| Screen/state | Web | Native |
|---|---|---|
| Home | `evidence/RBT-119/baseline/web/home-mobile.png`, `home-desktop.png` | `evidence/RBT-119/baseline/native/ios-home.png` |
| Browse | `evidence/RBT-119/baseline/web/browse.png` | `evidence/RBT-119/baseline/native/android-browse.png` |
| Event detail | `evidence/RBT-119/baseline/web/event-detail.png` | `evidence/RBT-119/baseline/native/android-event-detail.png` (captured redbox during card navigation) |
| Waiting room | `evidence/RBT-119/baseline/web/waiting.png` | pending |
| Checkout | `evidence/RBT-119/baseline/web/checkout.png` | pending |
| Payment | `evidence/RBT-119/baseline/web/payment.png` | pending |
| Success | `evidence/RBT-119/baseline/web/success.png` (loading state; replace using a valid paid fixture) | pending |
| Expired/recovery | `evidence/RBT-119/baseline/web/expired.png` | `evidence/RBT-119/baseline/native/android-expired-initial.png` |

## Refactor approach

1. Preserve an inventory and baseline test/evidence output.
2. Rename `V2`-prefixed modules with safe case-sensitive renames and update imports, tests, mocks, and references.
3. Extract screen-only UI from screen entrypoints to screen fragments; organize reusable components as per-component modules/folders. Keep platform forks presentation-only.
4. Replace inline style objects with NativeWind classes or named styles/style factories, retaining visual values and dynamic behavior.
5. Review hardcoded dynamic data, log calls, warnings, and layer-boundary imports; change only items supported by current contracts/configuration.
6. Run tests and quality checks, then replay the same screen and edge-state matrix on web and available simulators. Capture before/after images per tested flow and keep a report of unverified states.

## Scope and risks

- This is a cross-cutting refactor across 356 existing source/test files, with high visual-regression and import-cycle risk. Apply focused batches and run the narrow affected checks before each larger suite.
- Existing missing backend endpoints/contracts, mock behavior, queue/payment semantics, and live-data differences are out of scope. Preserve existing contracts and the SNAP boundary.
- The baseline Android Home → Browse → Event Detail flow showed a React Native redbox (`addViewAt: failed to insert view ... The specified child already has a parent`). Internal Browse → Event Detail → Checkout now works in repeated Android replay. A separate external Expo Go deep-link redbox remains unverified; retain its evidence and do not claim it is fixed.
- Any edge state that cannot be reached from the running native app will be checked through existing behavior tests and recorded as not visually captured, rather than claimed as visually verified.

## Final implementation and verification — 2026-11-06

| Work item | Status | Evidence / notes |
|---|---|---|
| Research and baseline (AC1–AC2) | **Done** | Research, architecture interpretation, risk inventory, baseline checks, captures, and isolated `chore/RBT-119` worktree are recorded above and under `.genesis/evidence/RBT-119/`. |
| V2 path/import cleanup (AC3) | **Done** | Structural audit reports 0 V2-prefixed path segments and 0 V2 import references. |
| Component folders and fragments (AC3–AC4) | **Done** | AST audit finds 171 presentation component declarations in 171 files, with 0 files declaring multiple UI components. Component TSX lives in per-component folders; screen-only regions live under screen fragments. |
| Styles and code clarity (AC5) | **Done** | 0 inline object styles, 0 `StyleSheet.create` calls outside `style.ts`, and 0 nested ternaries across source and tests. Animated styles depending on shared values remain in their owning components. |
| Architecture and dynamic values (AC6) | **Done with fixture/policy boundaries** | No direct console calls or forbidden inward-layer imports detected. Live event, queue, booking, and payment state use ports/adapters; mock content remains in named mock fixtures. Ticket cap copy uses the shared domain policy constant. Queue estimates use the server-provided rate. |
| Warnings and errors (AC7) | **Actionable export warning cleared** | Moving root-layout styles out of `src/app` removed the Expo Router route warning. The final web export now completes without Metro or Node color-environment warnings; the query-string shim loads the installed base module by a relative path instead of an unexported package subpath. Android log review found no app `ReactNativeJS` exception or fatal crash; the remaining `android.xr`/IPC messages are emulator/system output. |
| Coverage (AC8) | **Done** | Current run: 185 suites / 1,096 tests; all 418 applicable instrumented files meet ≥90% statements, lines, branches, and functions. Overall: 99.52% statements, 99.78% lines, 97.38% branches, and 99.78% functions. Per-file minimums are 94.44% statements/lines, 90% functions, and 90% branches. See `.genesis/evidence/RBT-119/after/final/FINAL-REPORT.md`. |
| Cross-platform replay (AC9) | **Partial; limitations recorded** | Web includes the complete mock booking route through payment/SNAP/Success/QR/download and profile/auth flows. Android captures Browse, Event Detail, queue admission, Checkout consent/expiry, recovery to an empty queue, authenticated profile/tickets, and sign-out. Its live Checkout hold expired before this replay reached Payment/SNAP. iOS has prior captures for checkout/payment/SNAP/Success/QR and queue admission; during the final replay its stale loader was cleared by restarting Expo Go and opening `exp://127.0.0.1:8081`, which rendered Home. Computer Use clicks still returned `noWindowsAvailable`, so a fresh interactive iOS flow could not be repeated. See the final report and captures under `.genesis/evidence/RBT-119/after/final/`. |
| Waiting timeout/reconnect | **Implemented and behavior-tested; native reconnect state not freshly captured** | The polling hook preserves the cached position during a timeout, refetches the same queue after recovery, updates the position/status, and indicates reconnection. Targeted tests cover recoverable timeouts, same-queue recovery, and membership restore. Queue admission and timeout recovery states are captured where reachable; the connection-restored banner was not captured in a fresh native replay. |

Final checks: typecheck, lint, all 185 test suites, and web export pass. The export creates 29 static routes with no bundler warnings after the query-string shim adjustment. The remaining evidence limits are the Android native Payment/SNAP handoff not being reached before the mock Checkout hold expired and the final iOS UI click API returning `noWindowsAvailable`; the simulator was nevertheless relaunched and the app Home rendered. The complete Web payment route and existing iOS captures remain available. The pre-existing Browse sort mismatch and external Expo Go deep-link crash are not claimed as fixed by this refactor. See [the final report](../evidence/RBT-119/after/final/FINAL-REPORT.md).
