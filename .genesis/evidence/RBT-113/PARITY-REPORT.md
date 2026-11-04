# RBT-113 — Browse filter icon

## Change

Replaced the visible “Saring” filter-launch text in the Browse results header with the same outlined sliders icon used on Home. Applied the icon-only treatment to the active-filter refine control as well. Both controls retain accessible Indonesian labels and their existing filter-sheet behavior.

## Live Android evidence

- `after/android-browse-icon-only.png` — Pixel 7 Pro AVD showing the Browse header with the icon-only filter control.
- `after/android-browse-filter-sheet.png` — same screen after pressing the icon; the filter sheet opens.

## Verification

- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `BrowseScreen.test.tsx` and `browse-fragments.test.tsx` — 2 suites, 13 tests passed.
