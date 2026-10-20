---
inclusion: always
---

# Technology

- Kotlin Multiplatform and Compose Multiplatform are the final UI stack for Android, iOS, and web.
- Only the payment page uses an embedded web view (`WebView` on Android, `WKWebView` on iOS, iframe on web). All other screens use shared Compose UI.
- Gradle builds the Android and web apps and the shared iOS framework. Xcode builds the iOS app.
- The server is authoritative for business rules and state. Do not hard-code queue timers, ticket limits, or polling intervals in the client.
