# Rusuh Tiket

A Compose Multiplatform recreation of the seven supplied `V1` HTML mockups for **Android, iOS, and web**.

Home, Event, Waiting Room, Ticket Selection, Success, and Expired are shared Compose screens. **Only payment is embedded HTML**: Android `WebView`, iOS `WKWebView`, and an iframe on web. The original photo assets and Plus Jakarta Sans font are bundled for offline rendering.

## Preview the mock

```sh
./gradlew :webApp:jsBrowserDevelopmentRun
```

Open the localhost URL printed by Gradle. On Android, run the `androidApp` configuration in Android Studio. For iOS, open `iosApp/RusuhBooking.xcodeproj` and run `RusuhBooking`.

The demo supports carousel selection, concert search and filters, event details, an advancing queue, ticket category/quantity selection, 16-digit NIK format validation, payment method selection, and success/expiry screens. Select VIP first to reproduce its sold-out recovery; the form retains your NIK so another category can be selected. The payment page has a “Pratinjau waktu habis” action for inspecting expiry.

All queue positions, availability, limits, deadlines, identity data, and payment results are mock fixtures. No backend or payment gateway is called, no money is charged, and no email or admission ticket is issued. Use synthetic identity data while testing. The e-ticket download button explains the mock status; it does not create a valid ticket.

## Build and test

```sh
./gradlew :shared:jsNodeTest
./gradlew :androidApp:assembleDebug
./gradlew :webApp:jsBrowserDevelopmentWebpack
./gradlew :shared:linkDebugFrameworkIosSimulatorArm64
```

Use JDK 17+, Android SDK 36, and Xcode for iOS. The iOS project targets arm64 devices and simulators. Node runs shared behavior tests and web build tooling; it is not an application platform.

## Structure

- `shared/src/commonMain/`: Compose screens, mock fixtures/state, and bundled assets.
- `shared/src/commonTest/`: search, selection, validation, totals, and payment bridge tests.
- `shared/src/androidMain/`, `iosMain/`, `jsMain/`: payment web hosts and platform back handling.
- `androidApp/`, `iosApp/`, `webApp/`: application launchers.
- `docs/mock-assets/`: reference attribution and font license.

Production integration must replace mock fixtures with server configuration and state, verify final booking status through the booking API, and enforce the real payment origin and wallet navigation rules. Kotlin/Compose specifies the client stack; the backend language is independent.

System specifications are linked in [docs/README.md](docs/README.md).
