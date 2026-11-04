# RBT-111 — Native splash, carousel, and Indonesian copy

## Changes

- Added an animated, native-only launch splash based on `v2-mobile/00-splash.html`. The web root does not render it.
- Enabled automatic rotation among the three upcoming Home hero events on web and native. Slides still rotate with reduced motion enabled; transitions and glitch effects are skipped in that mode.
- Replaced Android's blurred elevation shadow on Home event cards with the prototype's hard offset shadow.
- Unified the Home event heading as **Event Minggu Ini** and localized visible interface wording across Home, Browse, ticket, waiting, payment, and profile screens. API status values remain unchanged; the UI maps them to Indonesian labels.
- Removed the native Home filter control at the narrow breakpoint after the device capture showed it colliding with the heading and “Lihat Semua”. The Browse screen retains filtering.

## Captures

- `ios-splash.png` — iPhone 16 Pro launch splash.
- `ios-home-rotated.png` — iPhone 16 Pro Home after the hero advanced to another event.
- `android-home-shadow.png` — Android emulator Home with Indonesian event labels and the hard card shadow.
- `web-home-a.png` and `web-home-b.png` — web hero before and after rotation, captured with reduced motion enabled. The hero changed from Rusuh Fest to Nonton Bareng Finale.

## Verification

- `npm run typecheck` — passed.
- `npm run lint` — passed.
- Targeted Jest run — 6 suites, 45 tests passed. Jest then remained alive due to open handles and the lingering process was stopped after the completed results.
- `npx expo export --platform web` — passed; Expo emitted a pre-existing `query-string/base.js` package-export warning.

Event names and technical terms such as SNAP and QR are retained as proper names or product terminology.
