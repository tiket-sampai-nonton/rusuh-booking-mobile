# RBT-117 — Native SNAP surface and border

## Result

The native SNAP simulator now uses a white screen canvas and a 2px black border around the content panel, with 16px of panel padding. The web canvas retains its existing gray background and layout.

## Android evidence

- `before/android-snap-gray-background.png` — native SNAP screen before the update, with gray canvas and no enclosing content border.
- `after/android-snap-white-background-bordered-content.png` — Pixel 7 Pro emulator after the update, with the white canvas and bordered, padded content panel.

## Verification

- Pixel 7 Pro emulator: visually inspected the refreshed native SNAP route.
- `SnapSimulatorScreen.test.tsx`: 6 tests passed, including native surface and border assertions.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
