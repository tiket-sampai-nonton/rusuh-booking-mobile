---
inclusion: always
---

# Tech (mobile)

- React Native + TypeScript (Expo, expo-router). Android wajib; iOS tidak wajib untuk assessment.
- Payment memakai payment page web lewat `react-native-webview` (SCP-01), tidak dibangun native.
- Test: Jest (jest-expo) + Testing Library; E2E Appium (menyusul).
- Distribusi: APK dari GitHub Actions (`release-android.yml`) ke GitHub Releases saat tag `v*`.
