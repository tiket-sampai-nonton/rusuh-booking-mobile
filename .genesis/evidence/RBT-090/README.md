# RBT-090 — Evidence (G3)

**Branch:** `feat/design-ux-research` (off `feat/full-mock-integration`)
**Phase 4 complete — awaiting G3 (human approves this evidence before PR).**

## What shipped (the two real design-research gaps)

### AC1 — 44×44pt touch-target floor (WCAG 2.5.5 / Apple HIG 44pt)
New framework-free helper `src/shared/utils/tap-target.ts`:
`TAP_MIN = 44`, `tapSlop(w,h,min?)`, `tapSlopSquare(size,min?)` — pure math,
100% covered. Two application patterns, chosen per control:
- **`minHeight: 44` + centered** for controls that may grow (text/back links,
  modal buttons) — invisible when already tall enough.
- **`hitSlop`** for controls that MUST keep their pixel size (compact chips /
  pills) — widens only the hit region, so the prototype 1:1 look is unchanged.

| Control | File | Fix | Why |
|---|---|---|---|
| Nav links Jelajah/History/Kategori + CTA | `screens/Home/fragments/HomeNav.tsx` | `hitSlop` | inside the fixed-size floating pill — can't grow |
| Ubah/Reset Filter chips | `screens/Browse/fragments/BrowseChips.tsx` | `hitSlop` | compact chip |
| Filter option pills (genre/waktu/urutan) | `components/FilterModal.tsx` | `hitSlop` | compact pill |
| Category pills REG/VIP + "Hapus" | `screens/Checkout/fragments/TicketItem.tsx` | `hitSlop` | compact pill / small link |
| Browse "← Beranda" back | `screens/Browse/fragments/BrowseTopBar.tsx` | `minHeight` | text link, free to grow |
| MiniNav "← Beranda" (event/waiting/etc.) | `components/MiniNav.tsx` | `minHeight` | text link |
| Checkout / Payment "← Kembali" | `screens/{Checkout,Payment}/fragments/*TopBar.tsx` | `minHeight` | text link |
| Success "Ke Beranda" (error state) | `screens/Success/fragments/SuccessStates.tsx` | `minHeight` | ~41pt → 44 |
| Leave-confirm Tetap/Ya buttons | `screens/Checkout/fragments/LeaveConfirm.tsx` | `minHeight` | ~41pt → 44 |
| Login modal Batal/primary (all steps) | `components/LoginModal.tsx` | `minHeight` | ~41pt → 44 |

**Audit of controls NOT changed (already ≥44pt):** hero CTAs (`py-4`), Expired /
Snap / Success action buttons (`py-4`/`py-3.5`), Payment/Checkout pay bars
(`py-3.5` + pin), PaymentMethods rows (`p-3.5` + 2 lines), BuyBox CTA, PillButton
(`py-4`), EventCard (full-card press). Display-only `View`s (badges, summary rows)
are not interactive and correctly excluded.

### AC2 — Checkout ticket-row add/remove motion
`screens/Checkout/fragments/TicketItem.tsx` root is now an `Animated.View` with
`FadeInDown(200ms)` entering / `FadeOut(160ms)` exiting, **gated by
`useReducedMotion()`** (both `undefined` → instant when the OS asks for reduced
motion). Co-located in the row so `Checkout/index.tsx` is untouched.

### AC3 — No regressions
- No `domain/` or `application/` change; `tap-target.ts` is framework-free in `shared/`.
- `hitSlop` changes the hit region only → **no visual-1:1 regression** on prototype-matched surfaces (the reason compact chips use hitSlop not minHeight).
- Reduced-motion still honored everywhere (the new animation is gated).

## Gates (run once on main, all edits in)
- **55 suites / 394 tests pass** (added `tap-target.test.ts` + floor assertions in Browse/Home-desktop/Checkout tests).
- Coverage **98.96 / 95.41 / 98.5 / 99.27** — all four ≥90%. `tap-target.ts` 100%.
- `tsc` clean; ESLint clean (incl. `import/no-restricted-paths` boundary guard).

## Honest note
The audit found ~90% of the design research already implemented (reduced-motion
system, hero motion, responsive layout, waiting-room reassurance, price/scarcity
visibility). This ticket deliberately covers ONLY the two genuine gaps rather
than re-implementing finished work.
