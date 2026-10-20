---
inclusion: always
---

# Project structure

- `shared/src/commonMain/`: shared Compose screens and state.
- `shared/src/androidMain/`, `iosMain/`, `jsMain/`: platform implementations of the payment web host.
- `androidApp/`, `iosApp/`, `webApp/`: platform entry points.
- Add tests beside their related source sets when implementing behavior.
