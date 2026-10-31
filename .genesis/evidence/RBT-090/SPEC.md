# RBT-090 — Accessibility tap-target floor + motion polish (design-research pass)

> **Branch:** `feat/design-ux-research` (off `feat/full-mock-integration`)
> **Phase:** 1 SPEC → awaiting **G1** (human approves this spec before DESIGN)
> **Workflow:** per `.kiro/steering/00-workflow.md` — no code before G1.

## Context & honest framing

The design/UX research (heroes, motion, mobile-vs-web, per-screen UX) was
audited against the **current source**. Finding: **~90% of the research is
already implemented** and test-covered —

- Reduced-motion (`useReducedMotion()`) honored in all 6 animated components.
- Ease-out curves, 240–360ms durations, composite-only (transform/opacity) props.
- Hero: Ken Burns + crossfade + parallax + carousel dots + pulse; all reduced-gated.
- Browse staggered reveal (`Reveal delay={i*60}`); Success one-shot check-draw.
- Waiting room = Queue-it "progress not wait" (ring + position + ETA + server-safe
  reassurance + `accessibilityLiveRegion` zone banner).
- Responsive: centered max-width desktop containers, `gridColumns` 3/2/1,
  `showNavLinks > 720px`, noindex funnel, locked image aspect ratios.

Re-implementing those would be re-doing finished work. **This ticket covers only
the two genuine gaps the audit surfaced.**

## Scope (the real gaps)

### AC1 — Touch-target floor ≥44×44pt (WCAG 2.5.5 / Apple HIG 44pt / Material 48dp)
Audit found **zero `hitSlop` project-wide** and several interactive `Pressable`s
whose rendered height is < 44pt (≈ `py-2` → ~33pt). In scope (interactive only —
display-only `View`s like badges/summary rows are explicitly OUT):

| Control | File | Current | Issue |
|---|---|---|---|
| Nav links Jelajah/History/Kategori | `screens/Home/fragments/HomeNav.tsx` | padding-only `navLink` | small text link, no min height |
| Ubah/Reset Filter chips | `screens/Browse/fragments/BrowseChips.tsx` | `px-3.5 py-2` | ~33pt tall |
| Filter option pills | `components/FilterModal.tsx` | `px-3.5 py-2` | ~33pt tall |
| Category pills REG/VIP | `screens/Checkout/fragments/TicketItem.tsx` | `px-4 py-2` | ~33pt tall |
| (sweep) every other interactive `Pressable` across the 9 screens | — | — | verify ≥44 or add floor |

**Done when:** each interactive `Pressable` guarantees an effective ≥44×44pt
target via a `minHeight`/`minWidth` on the pressable (preferred) or `hitSlop`
where visual size must stay small (e.g. compact chips). A shared helper/constant
(e.g. `TAP_MIN = 44`) is acceptable to keep it DRY. No visual-1:1 regression on
the prototype-matched surfaces — where a control must stay visually compact,
use `hitSlop` so the hit region grows without changing the pixel look.

### AC2 — Checkout ticket-row add/remove motion (optional polish, from the motion table)
`screens/Checkout/index.tsx` adds/removes rows with no transition. Add a subtle
enter/exit (Reanimated layout animation or height/opacity), **ease-out ~200ms,
reduced-motion gated** (instant when `useReducedMotion()` is true).
*May be dropped from scope at G1 if you want AC1 only.*

### AC3 — No regressions (guardrail, not new work)
- No change to any `domain/` or `application/` file; no port changes.
- No visual-1:1 regression vs prototype V5 on matched screens.
- Reduced-motion still honored; all four coverage metrics stay ≥90%; `tsc` + ESLint clean.

## Out of scope (already implemented — do NOT re-touch)
Hero motion/parallax/carousel, reduced-motion gating, responsive containers/grid,
waiting-room reassurance, scarcity/price visibility, SEO/noindex, aspect ratios.

## Verification plan (Phase 4 → G3)
- Code audit table: every interactive `Pressable` → effective target size, before/after.
- New/updated tests assert the tap-target floor (min size or hitSlop present) on the fixed controls; AC2 adds a reduced-motion-gated row-animation test.
- Full suite green (coverage ≥90% all four); `tsc` + ESLint (incl. boundary guard) clean.
- Web screenshot of HomeNav + Browse chips showing unchanged visuals (hitSlop invisible).
- Evidence → `.genesis/evidence/RBT-090/`.

## Board
`Backlog → To Do → In progress → QA → In review → Done` — this ticket enters **To Do** on G1 approval.
