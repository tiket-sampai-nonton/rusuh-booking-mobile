# Mock recreation verification

Branch: `cmp/mock`.

The Android debug APK, Compose web development bundle, and iOS simulator app were built after the mock UI changes. Shared behavior tests passed: 7 tests, 0 failures, 0 errors. `git diff --check` also passed.

Commands:

```sh
./gradlew :androidApp:assembleDebug :webApp:jsBrowserDevelopmentWebpack :shared:jsNodeTest --no-daemon
xcodebuild -project iosApp/RusuhBooking.xcodeproj -scheme RusuhBooking -configuration Debug -sdk iphonesimulator -destination 'generic/platform=iOS Simulator' CODE_SIGNING_ALLOWED=NO build
```

The Node test process emits Skiko WebAssembly initialization messages in this environment; these tests exercise pure mock behavior and complete with all seven assertions groups passing. Browser UI rendering is checked separately in the running web app. Native builds are compile/link verification, not device interaction tests.

The browser walkthrough covers responsive layouts at desktop and 390 × 844, carousel selection, city filtering, event navigation, queue admission, NIK entry using synthetic data, VIP stock contention preserving the form, and two-ticket payment totals (Rp 900.000 + Rp 15.000 = Rp 915.000). Successful mock payment returns from the embedded HTML page to the Compose success screen. Returning from payment preserves the selected category, NIK, and original payment deadline; resuming the same order does not reset the timer. The payment expiry preview returns to the Compose Expired screen, and its home action returns to discovery.

The source HTML has conflicting event dates and prices across pages. The recreated flow keeps event/date/category/quantity consistent after selection while preserving each page's visual structure. All runtime state remains simulated; no backend, wallet, email service, or ticket issuer is contacted.
