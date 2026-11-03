# RUSUH TIKET — V2 Brutalist Mono
## React Native Implementation Specification

> **This is the ONLY file you need.** Implement exactly as specified — no guessing, no interpretation.

---

# 1. DESIGN TOKENS

```typescript
// theme/tokens.ts
export const tokens = {
  // ═══════════ COLORS ═══════════
  colors: {
    ground: '#ffffff',      // Background - WHITE ONLY
    ink: '#000000',         // Primary text/borders - BLACK ONLY
    inkMuted: '#666666',    // Secondary text - THIS GRAY ONLY
    field: '#f5f5f5',       // Input backgrounds
    danger: '#ff0000',      // Errors - PURE RED
    success: '#00aa00',     // Success states
    warning: '#ff6600',     // Warning states
  },
  
  // ═══════════ TYPOGRAPHY ═══════════
  fonts: {
    sans: 'Inter',          // Primary font
    mono: 'JetBrains Mono', // Waiting room ONLY
  },
  
  fontWeights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    black: '900',
  },
  
  fontSizes: {
    xs: 12,    // 0.75rem
    s: 14,     // 0.875rem
    m: 16,     // 1rem
    l: 20,     // 1.25rem
    xl: 24,    // 1.5rem
    hero: 48,  // Scales with screen
  },
  
  // ═══════════ SPACING ═══════════
  spacing: {
    xs: 8,     // 0.5rem
    s: 16,     // 1rem
    m: 24,     // 1.5rem
    l: 48,     // 3rem
    xl: 80,    // 5rem
  },
  
  // ═══════════ BORDERS ═══════════
  borders: {
    standard: 2,  // Default border width
    thick: 3,     // Waiting room only
  },
  
  // ═══════════ SHADOWS ═══════════
  // HARD OFFSET ONLY - NO BLUR
  shadows: {
    sm: { x: 2, y: 2, blur: 0, color: '#000000' },
    md: { x: 4, y: 4, blur: 0, color: '#000000' },
    lg: { x: 6, y: 6, blur: 0, color: '#000000' },
  },
  
  // ═══════════ ANIMATIONS ═══════════
  easing: {
    primary: [0.16, 1, 0.3, 1],      // cubic-bezier
    out: [0.33, 1, 0.68, 1],
    elastic: [0.68, -0.6, 0.32, 1.6],
    bounce: [0.34, 1.56, 0.64, 1],
  },
} as const;
```

---

# 2. GLOBAL COMPONENTS

## 2.1 Button Component

```typescript
// components/Button.tsx
interface ButtonProps {
  variant: 'ghost' | 'primary';
  size?: 'default' | 'large';
  disabled?: boolean;
  children: React.ReactNode;
  onPress: () => void;
}

// STYLES:
// padding: 10px 20px (default), 16px 32px (large)
// fontSize: 14 (default), 16 (large)
// fontWeight: 700
// textTransform: uppercase
// letterSpacing: 0.04em
// border: 2px solid #000

// GHOST: bg transparent, text #000
// GHOST hover: bg #000, text #fff (fill animation from bottom)

// PRIMARY: bg #000, text #fff
// PRIMARY hover: bg #fff, text #000 (reveal animation from top)
```

## 2.2 Input Component

```typescript
// components/Input.tsx
// STYLES:
// padding: 16px
// border: 2px solid #000
// fontSize: 16
// fontWeight: 500

// FOCUS STATE:
// boxShadow: 4px 4px 0 #000
// transform: translate(-2px, -2px)

// VALID STATE: borderColor: #00aa00
// ERROR STATE: borderColor: #ff0000
```

## 2.3 Loading Screen

```typescript
// components/LoadingScreen.tsx
// STYLES:
// position: absolute, inset: 0
// background: #000
// display: flex, center

// TEXT: white, fontSize 24-48, fontWeight 900, uppercase
// Letter bounce animation: translateY 0 to -10px, 0.6s
// Each letter delayed by 0.1s

// EXIT: clip-path inset animation (0 0 0 0 → 0 0 100% 0), 0.8s
```

## 2.4 Modal

```typescript
// components/Modal.tsx
// OVERLAY:
// background: rgba(0,0,0,0.8)
// backdropFilter: blur(4px)

// MODAL:
// background: #fff
// border: 2px solid #000
// padding: 48px
// maxWidth: 400

// ENTRANCE: opacity 0→1, translateY 20→0, scale 0.95→1, 0.4s
```

## 2.5 Toast

```typescript
// components/Toast.tsx
// position: fixed, bottom: 120px (above checkout bar)
// background: #000, color: #fff
// padding: 16px 32px
// fontWeight: 700

// success variant: background: #00aa00
// error variant: background: #ff0000

// ENTRANCE: translateY 100→0, opacity 0→1
```

---

# 3. SCREEN SPECIFICATIONS

## 3.1 Home Screen

### Header
- Fixed top, height 60px
- Logo: fontSize 18, fontWeight 900, uppercase
- Slide in from top on mount (translateY -100% → 0)

### Hero Carousel
- Full viewport height (100vh)
- Background images: grayscale(100%) contrast(1.1)
- Slow zoom animation: scale 1 → 1.05, 20s infinite
- Overlay gradient: white 0% → white/70% 30% → white/30% 100%
- Title: fontSize hero (clamp 48-160), fontWeight 900, lineHeight 0.85

### Event Cards Grid
- 3 columns desktop, 2 tablet, 1 mobile
- Gap: 2px (creates border effect)
- Background: #000 (gap color)

### Event Card
- Background: #fff
- Hover: translateY(-8px) rotateX(2deg), shadow
- Image: grayscale 100% → 0% on hover
- Badge slides in from left on hover

### Stats Section
- Background: #000, text: #fff
- Counter animation on scroll into view
- Stagger: each stat delays 0.1s

---

## 3.2 Event Detail Screen

### Flow Steps (Breadcrumb)
- Horizontal scroll
- Step number in circle (24x24, border 2px)
- Active: filled circle
- Connector line between steps

### Hero
- Height: 60vh (min 400px)
- Grayscale with contrast boost
- Scan line overlay effect

### Ticket Categories (READ-ONLY on this screen)
- List of available tiers with prices
- Hover: background #f5f5f5, translateX(4px)

### Floating CTA
- Fixed bottom
- Slide up on mount (translateY 100% → 0)
- Pulse glow animation on button

---

## 3.3 Waiting Room Screen

**⚠️ CRITICAL: Font changes to JetBrains Mono**
**⚠️ CRITICAL: Border thickness changes to 3px**

### Status Badge
- padding: 8px 16px
- background: #000, color: #fff
- uppercase, letterSpacing: 2px
- Pulse animation

States:
- Default: "IN QUEUE" - black bg, pulse
- Your turn: "IT'S YOUR TURN!" - red bg, no pulse
- Sold out: "SOLD OUT" - gray bg, no pulse

### Ring Progress
- SVG circle, 220x220
- strokeWidth: 8
- strokeDasharray: 628 (2πr where r=100)
- Rotate -90deg so progress starts from top

### Position Display
- fontSize: 56, fontWeight: 800
- Update animation: scale 1.1, color red

### Zone Banners
- GUARANTEED: green bg (#e8f5e9), green border
- POSSIBLE: orange bg (#fff3e0), orange border
- NOT_ENOUGH: red bg (#ffebee), red border

### Auto-Redirect
- When position = 0, show 5-second countdown
- Red background, pulse animation
- Auto-navigate to ticket selection

### Network Status
- Fixed bottom bar
- Orange when offline
- Green flash when reconnected

---

## 3.4 Ticket Selection Screen

### Timer
- Fixed top-right
- background: #000, color: #fff
- Tabular numerals (fixed-width)
- When < 60s: red background, pulse animation

### Ticket Item Card
- border: 2px solid #000
- Header: background #f9f9f9
- Remove button: red text, uppercase

### Add Ticket Button
- Full width
- border: 2px DASHED #000
- Disabled at max capacity (3 tickets)

### Checkout Bar
- Fixed bottom
- Total price: fontSize 24, fontWeight 900

### Validation Rules
```typescript
// NIK: exactly 16 digits
const validateNik = (nik: string) => /^\d{16}$/.test(nik);

// Email: standard format
const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Buyer NIK can only be "use for attendee" on ONE ticket
// Max 3 tickets total
```

---

## 3.5 Payment Screen

### Payment Methods
- Radio button list
- Hover: fill animation from left (background slides in)
- Selected: inverted colors (white on black)

### Timer: 15 minutes countdown

### VA Instructions
- VA number: fontSize 24, fontWeight 900, letterSpacing 0.1em
- Copy button

### QRIS
- QR code: 180x180
- Download button

### Polling
- Check payment status every 5 seconds
- Spinner: 14x14, border animation

---

## 3.6 Expired Screen

**Background: #000 (BLACK)**
**Text: #fff (WHITE)**

### Variants (based on ?reason= param)

| reason | Title | Icon | CTA |
|--------|-------|------|-----|
| booking | "Time's Up" | ⏱️ | "Join Queue Again" |
| payment | "Payment Expired" | 💳 | "Try Again" |
| payment-failed | "Payment Failed" | ↻ | "Try Different Method" |

### Noise overlay
- SVG noise pattern
- opacity: 0.03

---

## 3.7 Success Screen

**Background: #000 (BLACK)**
**Text: #fff (WHITE)**

### Success Icon
- Circle with checkmark
- border: 3px solid #00aa00
- Pop animation: scale 0→1.1→1

### Checkmark
- SVG path draw animation
- strokeDasharray/offset technique

### Ticket Card
- background: #fff, text: #000
- Perforated edge effect (circles cut out)
- Dashed divider line

---

# 4. EDGE CASES (WAITING ROOM)

The waiting room has 25 critical edge cases:

| # | Case | Action |
|---|------|--------|
| 1 | Position = 0 | Show 5s countdown → auto-redirect |
| 2 | Tab in background | Still redirect + push notification |
| 3 | Click "Leave Queue" | Show confirmation modal |
| 4 | Browser back | Intercept with modal |
| 5 | Close tab | Browser beforeunload prompt |
| 6 | Refresh (F5) | Browser beforeunload prompt |
| 7 | Turn expires (5min) | Show "Turn Expired" state |
| 8 | SOLD_OUT response | Show "Sold Out" state |
| 9 | Sale ended | Show "Sale Ended" state |
| 10 | Session timeout (30min) | Show "Session Expired" state |
| 11 | Multiple tabs | Full-screen block warning |
| 12 | Network offline | Show orange status bar |
| 13 | Network online | Flash green "Reconnected" |
| 14 | Long wait (>10min) | Offer notification opt-in |
| 15 | Position jumps | Animate with scale effect |

---

# 5. ANIMATION SPECIFICATIONS

Every screen MUST have:

| Animation | Trigger | Duration | Easing |
|-----------|---------|----------|--------|
| Loading screen | Mount | 1.5s + 0.8s exit | primary |
| Header slide | Mount | 0.8s, delay 0.5s | primary |
| Section reveal | Scroll into view | 0.6s, stagger 0.1s | primary |
| Button hover fill | Hover | 0.4s | primary |
| Input focus lift | Focus | 0.3s | primary |
| Card hover | Hover | 0.5s | primary |
| Image grayscale | Hover | 0.5s | primary |
| Modal entrance | Show | 0.4s | primary |
| Toast slide | Show | 0.4s | out |

---

# 6. RESPONSIVE BREAKPOINTS

```typescript
const breakpoints = {
  sm: 640,   // Mobile
  md: 768,   // Tablet
  lg: 1024,  // Desktop
};

// Grid columns:
// < 640: 1 column
// 640-900: 2 columns
// > 900: 3 columns
```

---

# 7. IMPLEMENTATION CHECKLIST

Before marking ANY screen complete, verify:

## Visual
- [ ] Colors: only #000, #fff, #666, #f5f5f5, #ff0000, #00aa00, #ff6600
- [ ] Borders: 2px solid black (3px for waiting room)
- [ ] Shadows: hard offset, no blur (4px 4px 0 #000)
- [ ] Fonts: Inter (waiting room: JetBrains Mono)
- [ ] Images: grayscale → color on interaction

## Interactions
- [ ] Button hover has fill/reveal effect
- [ ] Input focus has shadow + lift
- [ ] Cards have hover transform

## Animations
- [ ] Loading screen with exit animation
- [ ] Sections fade up on scroll
- [ ] Staggered animations where specified

## Edge Cases
- [ ] Waiting room: all 15+ edge cases
- [ ] Ticket selection: NIK validation (16 digits)
- [ ] Payment: timer + polling
- [ ] Expired: correct variant by reason param

---

# 8. FILE MAPPING

| Prototype | React Native Screen |
|-----------|---------------------|
| 01-home.html | screens/Home/ |
| 02-event-detail.html | screens/EventDetail/ |
| 06-waiting.html | screens/WaitingRoom/ |
| 07-ticket-selection.html | screens/TicketSelection/ |
| 08-payment.html | screens/Payment/ |
| 09-expired.html | screens/Expired/ |
| 10-success.html | screens/Success/ |

---

**END OF SPECIFICATION**

This document contains everything needed for 1:1 implementation. Do not reference any other .md file.
