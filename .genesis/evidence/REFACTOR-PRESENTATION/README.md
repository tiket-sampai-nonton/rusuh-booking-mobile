# Evidence — Presentation-layer refactor (screens → folder-per-screen)

**Date:** 2026-10-31
**Scope:** Refactor every `presentation/screens/*` screen into the structure
`index.tsx` (parent/orchestration) + `fragments/` + `interface.ts` + `style.ts`
(+ pure-logic helpers where present), one folder per screen, **zero inline
styles**, no barrel files. No behaviour, flow, or UI output change.

## Structure after refactor

```
presentation/screens/
  Home/        index.tsx + fragments/{HomeNav,HomeSections,HomeStates,CardGrid} + interface.ts + style.ts
  EventDetail/ index.tsx + fragments/{Block,BuyBox,DetailHero,DetailStates,Fact,TrustBox} + interface.ts + style.ts
  Browse/      index.tsx + fragments/{BrowseChips,BrowseGrid,BrowseStates,BrowseTopBar} + filter.ts + interface.ts + style.ts
  Checkout/    index.tsx + fragments/{CheckoutBar,CheckoutHero,CheckoutTopBar,LeaveConfirm,TicketItem,common} + categories.ts + interface.ts + style.ts
  Payment/     index.tsx + fragments/{PaymentBar,PaymentMethods,PaymentSummary,PaymentTopBar} + interface.ts + style.ts
  Snap/        index.tsx + fragments/{SnapActions,SnapLogo,SnapSummary} + interface.ts + style.ts
  Success/     index.tsx + fragments/{SuccessActions,SuccessCheck,SuccessStates,SuccessSummary} + interface.ts + style.ts
  Waiting/     index.tsx + fragments/{Shell,WaitingActive,WaitingStates,common} + interface.ts + style.ts
  Expired/     index.tsx + fragments/{ExpiredActions,ExpiredGlyph} + copy.ts + interface.ts + style.ts
```

- Routes/tests import the folder directly (`@presentation/screens/Browse`) — **no barrel files**
  (per the `react-native-best-practices` `bundle-barrel-exports` rule).
- `grep 'style={{'` across all screen `.tsx` returns **zero** matches.
- The old monolithic `*Screen.tsx` files and the two shared folders (`Events/`,
  `Payment/` holding two screens each) are removed.

## Static gates (run once on main, all edits in)

| Gate | Result |
|------|--------|
| `tsc --noEmit` (strict) | ✅ clean |
| `eslint` (incl. `import/no-restricted-paths` boundary guard) | ✅ clean |
| Full test suite | ✅ **54 suites / 384 tests pass** |
| Coverage (stmts / branch / funcs / lines) | ✅ **98.95 / 95.64 / 98.49 / 99.27** — all four ≥90% |

## Architecture audit (Clean Arch / GENESIS / AGENTS.md) — zero violations

Verified against the **enforced** ESLint boundary guard + source greps:

| Rule | Result |
|------|--------|
| `domain` + `application` framework-free (no React/RN/Expo/TanStack) | ✅ |
| Dependencies inward-only (domain ⇐ application ⇐ presentation) | ✅ |
| `presentation` never imports `infrastructure` directly (→ use case → port) | ✅ |
| TanStack Query confined to `presentation/hooks` (D3 swap seam) | ✅ |
| Concrete adapters bound only at composition root (`providers/container.ts`) | ✅ |
| Routes (`src/app`) thin mount shells, no logic | ✅ |

## Live E2E walk (post-refactor) — the real funnel, no page errors

Driven on the web export (`EXPO_PUBLIC_USE_MOCKS=true`) with
node + playwright (`--no-sandbox`), phone viewport 393×852, client-side
navigation on the SPA. **Console/page errors: NONE.** Real server-issued ids
carried through the whole funnel:

```
Home → login modal → filter modal → Browse(/browse?genre=…)
→ Event Detail → Masuk Antrean → Waiting(/waiting/evt-1)
→ auto-claim → Checkout(/checkout/sess-evt-1-1) → fill + Lanjut Bayar
→ Payment(/payment/bk-…) → Bayar Sekarang → SNAP(/snap/bk-…)
→ snap-success → Success(/success/bk-…)   + Expired(/expired/evt-1)
```

| # | Screen | Evidence | Note |
|---|--------|----------|------|
| 01 | Home | `e2e/01-home.png` | hero carousel + floating nav + sections |
| 02 | Home → Masuk/Daftar | `e2e/02-home-login-modal.png` | login/OTP modal opens (not a redirect) |
| 03 | Home → Filter Event | `e2e/03-home-filter-modal.png` | filter popup opens (genre/waktu/urutan) |
| 04 | Browse | `e2e/04-browse.png` | redirected from filter Apply; count + chips + grid |
| 05 | Event Detail | `e2e/05-event-detail.png` | hero + about/line-up/terms blocks + buy box |
| 06 | Waiting | `e2e/06-waiting.png` | queue ring + zone + stats |
| 07 | Checkout | `e2e/07-checkout.png` | buyer + ticket rows + Reguler/VIP + Total bar + timer |
| 08 | Payment | `e2e/08-payment.png` | summary + method rows + pay bar |
| 09 | SNAP simulator | `e2e/09-snap.png` | logo + summary + success/fail |
| 10 | Success | `e2e/10-success.png` | green check + **masked NIK 32****99** (D7.1) + e-ticket QR |
| 11 | Expired | `e2e/11-expired.png` | expired/failed screen |

**Security preserved through the refactor:** the Success summary shows the NIK
masked (`32****99`), never the raw value (D7.1/D7.5).

## Conclusion

The refactor split all 9 screens into the mandated structure with zero inline
styles and no barrels, **preserved every flow / function / UI output** (proven
by the full live funnel walk with no errors), kept all four coverage metrics
≥90%, and introduced **no architecture violation** (boundary guard green).
