# RBT-116 — Browse event card navigation

## Result

Browse event cards now open their event detail when tapped, including sold-out and closed cards. Availability still controls the status styling and purchase action; it no longer blocks access to event details. History cards remain disabled.

## Android evidence

- `before/android-browse-card.png` — Browse grid showing the sold-out event card.
- `after/android-browse-card-tap-opens-detail.png` — Pixel 7 Pro emulator after tapping the body/image area of that sold-out card; its event detail is open and the ticket purchase action remains disabled.

## Verification

- Android Pixel 7 Pro emulator: tapped the sold-out card image/body and confirmed navigation to its detail page.
- `BrowseScreen.test.tsx`: 9 tests passed, including the sold-out card navigation regression.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
