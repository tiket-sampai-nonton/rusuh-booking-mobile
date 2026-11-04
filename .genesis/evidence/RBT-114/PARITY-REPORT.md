# RBT-114 — Native Browse spacing

Reduced the native Browse content top offset so the results-count/filter row follows the fixed category strip with a 12 dp gap. The fixed app header and category strip reservations remain unchanged.

## Pixel 7 Pro evidence

- `before/android-browse-gap.png` — prior layout with the large blank gap.
- `after/android-browse-tightened-gap.png` — refreshed Expo Go capture after the offset change.

## Verification

- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `BrowseScreen.test.tsx` — passed, 8 tests.
- BrowseScreen coverage — 86% statements, 82% branches, 81% functions, 90% lines.
