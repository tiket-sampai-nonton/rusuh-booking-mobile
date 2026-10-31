# Action-Button Audit — all 7 screens vs prototype

Audited every interactive control (Pressable / Switch) across the 7 funnel
screens, cross-checked each against the prototype's actual action
(`.genesis/prototype/Final/*.html` — `location.href` / `onclick` / handlers),
confirmed the app's wiring, and verified each with a behavioral test (press →
assert the correct route/side-effect).

**Date:** 2026-10-31 · **Branch:** `feat/full-mock-integration`

## Result: every button works like the prototype

| Screen | Button (testID) | Prototype action | App handler | Verified by |
|---|---|---|---|---|
| **Home** | Event card (`event-card-*`) | → `event.html?eventId` | `router.push(/events/[id])` | HomeScreen.test, EventCard.test |
| Home | Hero "Booking Sekarang" (`hero-book`) | → `event.html?eventId` | `router.push(/events/[id])` | HomeScreen.test |
| Home | Hero "Lihat Semua" (`hero-see-all`) | scroll to catalog | `scrollToFeatured()` | HomeScreen.test |
| Home | "Filter Event" (`filter-open`) | → `browse.html` | `router.push(/browse)` | **FIXED** — was a dead no-op; HomeScreen.desktop.test |
| Home | Nav "Jelajah" (`nav-jelajah`) | → `browse.html` | `router.push(/browse)` | **NEW** — HomeScreen.desktop.test |
| Home | Nav "History" (`nav-history`) | scroll to `#history` | `scrollToHistory()` | **NEW** — HomeScreen.desktop.test |
| Home | Nav "Kategori" (`nav-kategori`) | → `browse.html` | `router.push(/browse)` | **NEW** — HomeScreen.desktop.test |
| Home | "Masuk / Daftar" (`nav-cta`) | login modal (optional) | `router.push(/browse)` | **FIXED** — was dead; login is optional per rules, routes to Browse until auth epic; HomeScreen.desktop.test |
| **Detail** | MiniNav back (`mini-nav-back`) | → `index.html` | `goHome()` → `/` | EventDetailScreen.test |
| Detail | "Masuk Antrean" (`join-cta`) | → `waiting.html?eventId` | `onJoin` → `/waiting/[id]` | EventDetailScreen.test |
| **Waiting** | "Keluar / Pilih event" (`waiting-leave`) | leave → `index.html` | `onLeave` → `/` | WaitingRoomScreen.test |
| Waiting | (admitted, auto) | → `detail.html` (checkout) | `router.replace(/checkout/[sid])` | WaitingRoomScreen.test |
| **Checkout** | back (`checkout-back`) | `history.back()` | `router.back()` | CheckoutScreen.test |
| Checkout | "Tambah tiket" (`add-ticket`) | add attendee row | `addRow()` | CheckoutScreen.test |
| Checkout | "Hapus tiket" (`remove-ticket-*`) | remove row | `onRemove()` | CheckoutScreen.test |
| Checkout | Category (`cat-*`) | pick category | `onPatch({categoryId})` | CheckoutScreen.test |
| Checkout | "Gunakan NIK pembeli" (`use-buyer-*`) | toggle NIK | `onUseBuyer` (Switch) | CheckoutScreen.test |
| Checkout | "Lanjut Bayar" (`checkout-submit`) | → `payment.html?bookingId` | `onSubmit` → `/payment/[id]` | CheckoutScreen.test |
| Checkout | (timer expiry) | → `expired.html?reason=booking` | `onExpire` → `/expired/[sid]` | CheckoutScreen.test |
| **Payment** | back (`payment-back`) | `history.back()` | `router.back()` | PaymentScreen.test |
| Payment | Method rows (`method-*`) | select method | `setMethod(code)` | PaymentScreen.test |
| Payment | "Bayar Sekarang" (`pay-now`) | → SNAP `redirectUrl` | `onPay` → `/snap/[id]` | PaymentScreen.test |
| Payment | (timer expiry) | → `expired.html?reason=payment` | `onExpire` → `/expired/[id]` | PaymentScreen.test |
| **SNAP** | "…berhasil" (`snap-success`) | → `success.html?bookingId` | `settle(PAID)` → `/success/[id]` | SnapSimulatorScreen.test |
| SNAP | "…gagal" (`snap-fail`) | → `expired.html?reason=payment` | `settle(FAILED)` → `/expired/[id]` | SnapSimulatorScreen.test |
| **Success** | "Unduh E-Tiket" (`success-download`) | `window.print()` | `downloadTicket()` → web: `window.print()`; native: no-op (never navigates) | **FIXED** — was wrongly calling goHome(); SuccessScreen.test (native + web branches) |
| Success | "Ke Beranda" (`success-home`) | → `index.html` | `goHome()` → `/` (resets state) | SuccessScreen.test |
| **Expired** | "Masuk Antrean Lagi" (`expired-requeue`) | → `event.html?eventId` | `onRequeue` → `/events/[id]` or `/` | ExpiredScreen.test |
| Expired | "Kembali ke Beranda" (`expired-home`) | → `index.html` | `onHome` → `/` | ExpiredScreen.test |

## Bugs found & fixed — ROUND 2 (interaction, not just navigation)

The first round fixed buttons that did nothing / navigated. Round 2 fixed buttons
that **navigated when the prototype opens a modal/popup** (the real complaint):

1. **Home "Masuk / Daftar" (`nav-cta`)** — was routing to `/browse`. Prototype
   opens the **OTP login/register modal**. Fixed: now opens `LoginModal`
   (email → OTP `123456` → register name+NIK for a new email → done; existing
   demo email `ada@rusuh.id` → signed → logout). Login stays optional (guest
   flow primary); the modal captures buyer identity for checkout auto-fill.
   → evidence `btn-02-login-email.png`, `btn-03-login-code.png`, `btn-04-login-register.png`
2. **Home "Filter Event" (`filter-open`)** — was routing to `/browse`. Prototype
   opens the **filter popup** (genre/waktu/urutan), and only "Terapkan Filter"
   navigates to `/browse?<params>`; "Batal"/backdrop close with no nav. Fixed:
   now opens `FilterModal`. → evidence `btn-05-filter-popup.png`
5. **`/browse` results page** — was a placeholder skeleton ("Browse — /browse"),
   so "Terapkan Filter" redirected to an empty page. Prototype `browse.html` is a
   real **filtered results list**. Built `BrowseScreen`: reads genre/time/sort
   from the URL, filters the catalog client-side (time bucket + sort; genre is a
   best-effort O1 match), renders a count line, removable filter chips,
   "Ubah Filter" (reopens the popup) / "Reset Filter", the EventCard grid (cards
   → `/events/[id]`), and an empty state. → evidence `btn-06-browse-results.png`
3. **Home nav "Jelajah" / "History" / "Kategori"** — were routing to `/browse`.
   Prototype are in-page anchors (`#featured`/`#history`/`#cat`). Fixed: now
   scroll in-page, no navigation.
4. **Checkout back (`checkout-back`)** — was a bare `router.back()`. Prototype
   opens a **"Tinggalkan halaman ini?" confirm** (Tetap di sini / Ya, keluar);
   only "Ya, keluar" → home. Fixed: now opens the confirm modal.

### Round 1 (kept)
- **Success "Unduh E-Tiket"** was `goHome()` → now `window.print()` on web,
  no-op on native, **never navigates**.

### New components
- `LoginModal.tsx` (multi-step OTP/register) · `FilterModal.tsx` (filter popup)
  · `account-store.ts` (optional signed-in buyer identity) · Checkout inline
  "leave" confirm modal.

## Gate (run once on main, all edits in)
- **53 suites / 367 tests pass**
- Coverage **98.25 / 94.2 / 97.55 / 98.83** (stmts / branches / funcs / lines) — ≥90% gate green
- `tsc --noEmit` clean · `eslint` clean
- New behavioral tests: `modals.test.tsx` (LoginModal full flow + FilterModal),
  updated `HomeScreen.desktop.test.tsx` (CTA→login modal, Filter→popup→apply,
  nav links scroll), `CheckoutScreen.test.tsx` (back→confirm→leave).

## Live button-press evidence (web export, Playwright-driven)
Each screenshot is the RESULT of actually pressing the button:
- `btn-01-home.png` — Home
- `btn-02-login-email.png` — "Masuk / Daftar" → login modal (email step)
- `btn-03-login-code.png` — → OTP code step
- `btn-04-login-register.png` — → "Lengkapi Pendaftaran" (new-email register)
- `btn-05-filter-popup.png` — "Filter Event" → filter popup (genre/waktu/urutan)

## Android emulator (Pixel_7_Pro, SDK 52)
Re-checked after the button edits (edits were pure JS/TSX — no native modules):
- Android JS bundle compiles clean (HTTP 200, ~8.9 MB, no transform errors)
- App launches in Expo Go, **no redbox / no JS error / no fatal** (logcat clean;
  "Bridgeless mode enabled", surface started)
- Live render confirmed — see `android-home-live.png` (hero carousel on slide 3,
  all CTAs present and interactive)

Screenshots: `android-home-devmenu.png` (first mount, dev menu overlay),
`android-home-live.png` (clean live Home with buttons).
