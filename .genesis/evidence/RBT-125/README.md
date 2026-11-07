# RBT-125 — Cross-platform UX polish evidence

Branch: `codex/rbt-125-cross-platform-ux-polish`
Base: `develop`
Issue: https://github.com/tiket-sampai-nonton/rusuh-booking-mobile/issues/160
Captured: 2026-11-07 (Asia/Jakarta)

## Live web QA

Ran the Expo web app locally at `http://localhost:8081` using the development mock data.

- `browse-desktop.png` — 1440 × 1000 desktop browse; category defaults to `Semua`, filter is separate from sort, and event cards render in a grid.
- `browse-filter-modal.png` — category choices in the filter modal.
- `browse-selected-category-mobile.png` — 390 × 844 mobile browse with `Festival` selected from the URL; the category chip is reflected and the local fixture list is filtered.
- `home-mobile.png` — 390 × 844 mobile home; hero title is positioned at the lower left without the hero action buttons.
- `profile-desktop.png` — 1440 × 1000 desktop profile layout.

Home, Browse, and Profile loaded with zero browser console errors. Expo reported one warning during page loads; the warning did not block rendering.

## Automated local checks

- `npm run typecheck -- --pretty false` — passed.
- `npm run lint` — passed with existing `no-require-imports` warnings (0 errors).
- `npm run format:check` — passed after formatting the changed files.
- `EXPO_PUBLIC_SITE_URL=https://rusuh-booking.pages.dev npx expo export --platform web`, followed by `web:metadata` and `web:verify` — passed; 9 public routes, 16 transactional routes, SEO files, and gzip budgets verified.
- `git diff --check` — passed.
- Jest/RNTL and physical Android/iOS device QA were not run in this capture. Device-level navigation, native splash rendering, and native queue positioning still need native QA.

## Known limitation

The current API contract has no event-category field. The selected category is kept in the client URL/state and matched against available event text/genres; this does not add or assume a backend filter contract.
