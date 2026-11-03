# RBT-097: V2 Mobile Design Divergences — Implementation Summary

## PR
https://github.com/tiket-sampai-nonton/rusuh-booking-mobile/pull/106

## Overview
Implements mobile-specific design divergences from `.genesis/prototype/v2-mobile/` into the V2 Brutalist Mono codebase.

## Files Modified/Created

### New Components
1. **`src/presentation/components/v2/V2BottomNav.tsx`** (NEW)
   - Native-only bottom navigation bar (72px + safe area)
   - 4 tabs: Home, Browse, Tiket, Akun
   - Active indicator: 3px bar slides from top
   - Press feedback: scale(0.9) on icon, field background
   - Slide-up animation on mount (1.3s delay)

### Updated Components

2. **`src/presentation/hooks/useResponsive.ts`**
   - Added `isNative`, `height`, `headerHeight`, `heroHeightVh`, `bottomBarHeight`, `tapTarget`
   - Mobile values: 56px header (vs 60px desktop), 70vh hero (vs 100vh), 72px bottom bar

3. **`src/presentation/theme/v2-tokens.ts`**
   - Added `v2Layout.headerHeightMobile` (56px)
   - Added `v2Layout.bottomBarHeight` (72px)
   - Added `v2Layout.tapTarget` (44px)

4. **`src/presentation/components/v2/V2Header.tsx`**
   - Uses `useResponsive().headerHeight` for platform-adaptive height
   - Mobile: 56px, Desktop: 60px

5. **`src/presentation/components/v2/V2HeroCarousel.tsx`**
   - Uses `useResponsive().heroHeightVh` for platform-adaptive height
   - Mobile: 70vh, Desktop: 100vh
   - Also uses `isNative` for narrow layout detection

6. **`src/presentation/components/v2/V2EventCard.tsx`**
   - Added `staggerIndex` prop for staggered entry animation
   - FadeInUp.delay(index * 100ms) per card on mount

7. **`src/presentation/components/v2/index.ts`**
   - Updated exports to include V2BottomNav

8. **`src/presentation/screens/ExpiredRecovery/index.tsx`**
   - Changed background from dark (ink) to white (ground) per mobile prototype
   - Added "turn" variant with icon ⚡ and copy for "Giliran Terlewat"
   - Added info box with detailed explanation and bullet points
   - Updated button styling with proper tap targets

9. **`src/presentation/screens/Success/index.tsx`**
   - Added email note: "✉️ E-tiket juga dikirim ke email kamu"

10. **`src/domain/rules/payment-recovery.ts`**
    - Added "turn" to `ExpiryReason` union type
    - Updated `requeueRoute()` to handle turn reason

## Design Tokens Added
From `design-tokens.css`:
- `--tap-target: 44px` — Minimum touch target
- `--header-height: 56px` — Mobile header
- `--bottom-bar-height: 72px` — Mobile bottom nav

## Platform Divergence Techniques Used
1. **useResponsive hook** — For layout branches (header height, hero height)
2. **Platform.OS check** — V2BottomNav renders null on web
3. **Reanimated** — For all animations (stagger, slide-in, press feedback)

## Verification
- `npm run typecheck` — ✅ PASS
- `npm run lint` — ✅ PASS

## Notes
- G1-G3 bypassed per user authorization
- G4 (evidence collection) followed
- G5 (PR process) to follow
