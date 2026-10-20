# Rusuh Booking

Compose Multiplatform scaffold for **Android, iOS, and web**. Home, Waiting Room, and Ticket Detail are shared Compose UI. Payment is the only embedded web page: Android uses `WebView`, iOS uses `WKWebView`, and the web app uses an iframe.

This is an initial project scaffold. Screen content is placeholder text; booking, queue, payment URL, origin validation, and server status handling are not yet connected. Business rules and final payment state must come from the backend.

## Build

- Android debug APK: `./gradlew :androidApp:assembleDebug`
- Web development bundle: `./gradlew :webApp:jsBrowserDevelopmentWebpack`
- Web development server: `./gradlew :webApp:jsBrowserDevelopmentRun`
- iOS simulator framework: `./gradlew :shared:linkDebugFrameworkIosSimulatorArm64`
- iOS app: open `iosApp/RusuhBooking.xcodeproj` in Xcode and run the `RusuhBooking` scheme.

Use JDK 17 or newer, Android SDK 36, and Xcode for iOS. Gradle downloads Kotlin and web tooling on the first build.

## Modules

- `shared/`: common Compose UI and platform payment web hosts
- `androidApp/`: Android launcher
- `webApp/`: browser launcher
- `iosApp/`: SwiftUI launcher and Xcode project

See [docs/README.md](docs/README.md) for the system specifications.
