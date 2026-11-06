# RBT-120 — Waiting room and cross-platform typography evidence

## Typography alignment

- General application UI uses the bundled Inter family on web and native. NativeWind's `sans` and `v2` defaults, the design token fallback, and the web document defaults now resolve to the same loaded Inter face.
- The waiting room uses the bundled JetBrains Mono face on web, iOS, and Android, as required by its mono design. The checkout timer uses the same shared font definition.
- Browse sort/count styling now uses the shared Inter font aliases rather than browser-only family names.
- Native operating-system chrome (status/navigation bars) remains platform-rendered.

## Visual captures

The waiting-room captures below were reviewed after the font changes. Reference and before captures are retained alongside them.

| Platform / viewport | Final capture |
|---|---|
| Web mobile | `after/web/mobile.png` |
| Web desktop | `after/web/desktop.png` |
| iOS simulator | `after/native/ios.png` |
| Android emulator | `after/native/android.png` |

The waiting-room runtime fixture shows “Rusuh Fest 2026” and queue position 4, while the static prototype reference contains different event and queue data. These are content differences; the font and layout comparison uses the same rendered screen structure.

## Verification

- TypeScript typecheck: passed.
- Targeted ESLint on changed font, token, waiting-room, browse, checkout, and related test files: passed.
- Targeted Jest: 4 suites passed, 51 tests passed.
- `git diff --check`: passed.
- Web mobile/desktop and iOS/Android final captures were inspected. The waiting-room text uses the same JetBrains Mono face across all four captures.
