# DESIGN-SYSTEM.md — Rusuh Booking Tiket (FE)

> GENESIS Phase 2 output. Conforms to `GROOMING-DECISIONS.md` and `ARCHITECTURE.md`.
> Scope: the shared cross-platform (Expo + RN + RN Web) design language in `apps/client/src/presentation/theme` (token re-exports) + `apps/client/src/presentation/components`, styled with **NativeWind**. The single token source of truth is `apps/client/tailwind.config.js` (generated from prototype V5).
> Visual reference: prototype V5 (red/ember, glassmorphism, Plus Jakarta Sans). Platform split is presentation-only; tokens and primitives are shared.

## 1. Principles

- **One shared visual language, three targets.** Tokens live in `tailwind.config.js` (consumed via NativeWind utility classes) with a `presentation/theme` re-export for non-className use; primitives live in `presentation/components`. `.web.tsx`/`.native.tsx` only change presentation, never logic (D2.3).
- **Accessible by default.** WCAG 2.1 AA on web (D6.6): contrast ≥4.5:1 body / ≥3:1 large, visible focus, keyboard operable, reduced-motion honored.
- **Calm under load.** No decorative motion that blocks state; skeletons over spinners; never gate queue/timer/payment state on animation completion.
- **Status is never color-only.** Every status (available / sold-out / queue zone / payment state) pairs color with an icon + text label (color-blind safe).

## 2. Design tokens (`tailwind.config.js` + `presentation/theme` re-export)

Tokens are platform-neutral values defined once in `apps/client/tailwind.config.js` (the single source of truth) and consumed via NativeWind classes on RN + RN Web; `presentation/theme` re-exports the same values for SVG/Canvas/QR/Reanimated. Exact hex comes from the prototype V5 token set in `.genesis/prototype/Final` (ported, not invented — e.g. `--red:#EC1C24`, `--ember:#ff5a2d`, `--ink`, `--paper`, status `--ok`/`--warn`; radii 7/12/20/22/26/999).

| Token group | Members |
|---|---|
| Color — brand | `brand.primary` (ember/red), `brand.primaryPressed`, `brand.onPrimary` |
| Color — surface | `surface.base`, `surface.raised`, `surface.glass` (glassmorphism overlay), `surface.border` |
| Color — text | `text.primary`, `text.secondary`, `text.onBrand`, `text.disabled` |
| Color — status | `status.available`, `status.soldOut`, `status.warning`, `status.danger`, `status.info` |
| Color — queue zone | `zone.guaranteed` (green), `zone.possible` (amber), `zone.notEnough` (red) |
| Typography | family `Plus Jakarta Sans`; scale `display/h1/h2/h3/body/caption/mono`; weights 400/500/600/700 |
| Spacing | 4-pt base scale: `space.1..10` (4,8,12,16,20,24,32,40,48,64) |
| Radius | `radius.sm/md/lg/pill` |
| Elevation | `elevation.0..3` (shadow tokens; web box-shadow / native elevation) |
| Motion | `motion.fast/base/slow` durations + standard easing; all respect reduced-motion |
| Z-index | `z.base/sticky/overlay/modal/toast` |

> **Theming rule:** always set a background together with its text color; never a fixed literal. A half-set pair breaks dark mode. A `theme.mode` (light/dark) flag selects token values.

## 3. Core components (`presentation/components`)

Each is a shared RN primitive with accessible labels, loading/empty/error/disabled states, and a web escape hatch only where DOM/keyboard/print needs it.

| Component | Used on | Notes |
|---|---|---|
| `Button` / `IconButton` | all | variants: primary, secondary, ghost, danger; pressed + disabled + loading states |
| `EventCard` | Home, Browse | status badge (Tersedia / Stok Menipis / Sold Out), price-from (`minorToIDR`), date `DD-MMM-YYYY`, disabled when sold out |
| `StatusBadge` | Home, Event | icon+label+color triad, never color-only |
| `Countdown` | Checkout, Payment | renders from `ServerClock.remaining()`; `aria-live="polite"`; reduced-motion safe; never drives logic |
| `QueuePositionCard` | Waiting | "orang di depan" + "estimasi"; zone color + label; polite live region on change |
| `TicketRow` | Checkout | category dropdown + attendee name + attendee NIK + "Gunakan NIK pembeli" single-use checkbox |
| `NikField` | Checkout, Register | 16-digit mask, inline validation, debounced attendee-check status, never echoes full NIK in logs |
| `ConsentCheckbox` | Register, Checkout | required NIK/email consent gate (D7.1) before collection |
| `PaymentMethodSelector` | Payment | FE-built method-bucket picker (VA BCA/BNI/BRI/Permata · QRIS · GoPay) driven by server `page.methods`; selected row drives the "Bayar" CTA (D10). Instrument entry happens on SNAP, not here |
| `OrderSummaryPanel` / `PaymentTimer` | Payment, Checkout | summary (total = `amountMinor`, no service-fee line) + server-authoritative countdown from `expiresAt`+`serverTime` |
| `Toast` / `InlineError` | all | error-code → Bahasa mapping; no `alert`/`confirm` |
| `Skeleton` | all lists | loading placeholder; no layout shift (CLS budget) |
| `EmptyState` / `ErrorState` / `ExpiredState` | all | recoverable actions (retry / re-queue / home) |
| `QrTicket` | Success | `react-native-svg` QR from BE `qrPayload`; never embeds raw NIK |
| `Sheet` / `Modal` | Filter, confirm-leave | focus trap + ESC/back close on web; native sheet on mobile |

## 4. Layout & responsiveness

- **Breakpoints:** `sm` (mobile ≤640), `md` (tablet), `lg` (desktop ≥1024). Mobile-first; desktop gets `.web.tsx` layout where mobile conventions would hurt (multi-column catalog, wider forms).
- **Public pages** (Home, Browse, Event) are semantic + SEO-ready (D6.2); **transactional pages** (Waiting/Checkout/Payment/Success) are client-rendered and `noindex`.
- Touch targets ≥44×44pt; desktop hover/pointer states only via web escape hatch.

## 5. Motion

- Reanimated for shared transitions (queue progress, card press, sheet). `prefers-reduced-motion` (web) + native reduced-motion → disable non-essential motion, keep timers/state updating.
- No animation longer than a few seconds without a control; nothing decorative on the critical booking path.

## 6. Accessibility checklist (per screen)

- Keyboard-operable (web), logical focus order, visible focus ring.
- Screen-reader labels on all interactive controls; form errors announced.
- Live regions for countdown + queue position changes.
- Contrast verified against tokens; status conveyed by icon+text+color.
- Reduced-motion verified.

## 7. Open/deferred

- Exact hex token values: port from the prototype V5 token set during P0/P2 (ARCHITECTURE roadmap); verify 1:1 against the agreed visual reference.
- Telkomsel-inspired theme tokens: seeded in `apps/client/tailwind.config.js` and noted in ARCHITECTURE §6.5.
