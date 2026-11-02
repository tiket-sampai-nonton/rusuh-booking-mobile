# RBT-080 — WCAG 2.1 AA checklist (Rusuh Booking Tiket FE)

> Automated structural a11y is enforced by `src/__tests__/a11y/accessibility.test.tsx`
> (roles + labels + live regions) and the per-screen RNTL suites. Full WCAG 2.1 AA
> conformance also needs the manual items below — axe cannot run against React
> Native (no DOM), and real screen-reader output / contrast ratios / keyboard
> order require a human pass. **Full validation requires manual testing with
> assistive technologies and expert accessibility review** — this checklist
> records the FE's built-in support, not a conformance certificate.

## AC1 — Web (React Native Web)

| WCAG | Item | State |
|------|------|-------|
| 1.4.3 Contrast (AA) | Body text / buttons use theme tokens tuned to the prototype; brand red `#EC1C24` on white = 4.0:1 (large/UI), foreground on card ≥ 7:1. Verify small-text pairs with a contrast tool. | built-in tokens; **manual verify** |
| 1.4.1 Use of Color | Status is NEVER color-only: "LIVE · FLASH SALE" + dot, "SEDANG BERLANGSUNG" label, payment states carry text ("Pembayaran berhasil", "gagal atau kedaluwarsa"), the e-ticket QR has a text ref. | ✓ enforced (a11y test asserts status title text) |
| 2.1.1 Keyboard | All actions are `Pressable`/`Text onPress` with `accessibilityRole="button"` → focusable + Enter/Space on web. | ✓ roles present; **manual tab-order pass** |
| 2.4.3 Focus Order | Single-column flows, DOM order = visual order. | **manual verify on web** |
| 4.1.3 Status Messages | Live regions (`accessibilityLiveRegion="polite"` → `aria-live` on web) on: queue status/position (Waiting), countdown timers (Checkout/Payment TopBar), error banners (Home/Checkout/Payment), and the verify/processing status (PaymentResult, Success — added in RBT-080). | ✓ |

## AC2 — Native (VoiceOver / TalkBack)

| Item | State |
|------|-------|
| Interactive controls expose `accessibilityRole` + `accessibilityLabel` (buttons, QR card, back, pay, retry, re-queue, snap actions). | ✓ enforced by the a11y test |
| Headers use `accessibilityRole="header"` for rotor/heading navigation. | ✓ across screens |
| Reduced motion honored: `useReducedMotion()` gates HeroCarousel autoplay, Reveal, ScreenFade, TrustStrip, Waiting pulse; the poll cadence raises its floor under reduced motion. | ✓ |
| Secrets never announced: the success screen shows only the MASKED NIK; the QR encodes a safe ref — no raw NIK reaches the a11y tree. | ✓ (D7.1, asserted) |
| **Manual**: run VoiceOver (iOS) + TalkBack (Android) through the full funnel; confirm every control is reachable, labelled, and that timer/queue updates are announced. | **manual pass required** |

## AC3 — Automated + manual

- **Automated (CI-feasible)**: `accessibility.test.tsx` + per-screen RNTL suites assert roles, labels, and live regions. These run in the husky/CI jest gate.
- **axe**: not applicable to RN (no DOM). On the exported **web** build, a one-off axe-core run in a real browser is the recommended supplement (documented, not wired into CI because the web export + a headless browser are not part of the cloud gate — WORKFLOW.md keeps e2e/browser checks out of the cloud CI gate).
- **Manual checklist**: the rows marked **manual** above — contrast spot-checks, web keyboard tab-order, and a VoiceOver/TalkBack pass — to be run before release (RBT-084).

## Summary
The FE ships with the structural a11y contract in place and enforced by tests
(roles, labels, live regions, reduced-motion, no color-only status, masked PII).
Remaining WCAG 2.1 AA conformance items are inherently manual (AT output,
measured contrast, keyboard order) and are listed here for the release pass.
