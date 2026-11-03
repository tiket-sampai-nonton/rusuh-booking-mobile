# Rusuh Tiket — Mobile Design Palette Guide

> V2 Brutalist Mono Theme • Mobile-First Reference

---

## 🎨 Color System

### Core Palette (Strict)

| Token | Value | Usage |
|-------|-------|-------|
| `--ground` | `#ffffff` | Page background, card backgrounds |
| `--ink` | `#000000` | Primary text, borders, UI elements |
| `--ink-muted` | `#666666` | Secondary text, placeholders |
| `--field` | `#f5f5f5` | Input backgrounds, subtle surfaces |

### Functional Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--danger` / `--red` | `#ff0000` | Errors, urgent states, LIVE badge, accent |
| `--success` / `--green` | `#00aa00` | Success states, confirmations |
| `--warning` | `#ff6600` | Warnings, caution states |

### ⚠️ Brutalist Rule

**NO GRAYS in main UI** — Only use `--ink-muted` (#666) for disabled/placeholder states.

```css
/* ✅ Correct */
color: #000;
background: #fff;
border: 2px solid #000;

/* ❌ Wrong */
color: #333;        /* No arbitrary grays */
background: #f0f0f0; /* Use --field if needed */
border-color: #ccc;  /* Use #000 or transparent */
```

---

## 🔤 Typography

### Font Families

| Context | Font | Token |
|---------|------|-------|
| **Primary UI** | Inter | `--font-sans` |
| **Waiting Room / Counters** | JetBrains Mono | `--font-mono` |

```html
<!-- Inter for most pages -->
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet">

<!-- JetBrains Mono for waiting room -->
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | `400` | Body text |
| Medium | `500` | Subtle emphasis |
| Semibold | `600` | Labels, buttons |
| Bold | `700` | Headings |
| Black | `900` | Hero titles, impact text |

### Type Scale (Mobile)

| Token | Size | Usage |
|-------|------|-------|
| `--text-xs` | 12px | Captions, badges, timestamps |
| `--text-s` | 14px | Body small, buttons |
| `--text-m` | 16px | Body default |
| `--text-l` | 18px | Body large |
| `--text-xl` | 20px | Subheadings |
| `--text-2xl` | 24-32px | Section titles |
| `--text-3xl` | 32-48px | Page titles |
| `--text-hero` | 48-80px | Hero headlines (mobile-capped) |

---

## 📐 Spacing System

8px base unit system.

| Token | Value | Mobile Usage |
|-------|-------|--------------|
| `--space-2` | 8px | Tight gaps, icon padding |
| `--space-3` | 12px | Card internal gaps |
| `--space-4` | 16px | Standard padding (mobile frame) |
| `--space-6` | 24px | Section spacing |
| `--space-8` | 32px | Between sections |
| `--space-12` | 48px | Major section breaks |

### Mobile Frame

```css
padding: 16px; /* Standard horizontal frame */
padding: 0 env(safe-area-inset-right) 0 env(safe-area-inset-left); /* Edge devices */
```

---

## 🔲 Borders & Shadows

### Border System

| Style | CSS | Usage |
|-------|-----|-------|
| **Standard** | `2px solid #000` | Cards, buttons, inputs |
| **Thick** | `3px solid #000` | Waiting room (mono variant) |
| **Thin** | `1px solid #000` | Dividers |

### Hard Offset Shadows (Brutalist)

```css
/* ✅ Correct — Hard offset, no blur */
box-shadow: 4px 4px 0 #000;

/* ❌ Wrong — No soft shadows */
box-shadow: 0 4px 12px rgba(0,0,0,0.1);
```

| Size | CSS |
|------|-----|
| Small | `2px 2px 0 #000` |
| **Medium** | `4px 4px 0 #000` |
| Large | `6px 6px 0 #000` |
| XL | `8px 8px 0 #000` |

### Inverted (On Dark BG)

```css
box-shadow: 4px 4px 0 #fff;
```

---

## 📱 Mobile-Specific Patterns

### Safe Areas

```css
/* Header */
padding-top: env(safe-area-inset-top, 0px);

/* Bottom bar */
padding-bottom: env(safe-area-inset-bottom, 0px);

/* Full viewport height */
min-height: 100dvh;
```

### Touch Targets

- **Minimum**: 44px × 44px tap area
- **Recommended**: 48px height for primary buttons

```css
button {
  min-height: 48px;
  padding: 12px 24px;
}
```

### No Hover → Active States

```css
/* Web (removed for mobile) */
/* .card:hover { ... } */

/* Mobile */
.card:active {
  transform: translateY(2px);
  box-shadow: 2px 2px 0 #000;
}
```

### Bottom Navigation

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 72px;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  background: #fff;
  border-top: 2px solid #000;
  z-index: 100;
}
```

---

## 🎬 Animation Tokens

### Durations

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 150ms | Micro-interactions |
| `--duration-normal` | 300ms | State transitions |
| `--duration-slow` | 500ms | Page transitions |

### Easing Curves

```css
--ease: cubic-bezier(0.16, 1, 0.3, 1);        /* Primary — smooth decel */
--ease-out: cubic-bezier(0.33, 1, 0.68, 1);   /* Exit animations */
--ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1); /* Playful feedback */
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 🧩 Component Patterns

### Primary Button

```css
.btn-primary {
  background: #000;
  color: #fff;
  border: 2px solid #000;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 4px 4px 0 #000;
  transition: all 150ms cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-primary:active {
  transform: translate(2px, 2px);
  box-shadow: 2px 2px 0 #000;
}
```

### Secondary Button

```css
.btn-secondary {
  background: #fff;
  color: #000;
  border: 2px solid #000;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  box-shadow: 4px 4px 0 #000;
}
```

### Card

```css
.card {
  background: #fff;
  border: 2px solid #000;
  padding: 16px;
  box-shadow: 4px 4px 0 #000;
}
```

### Input Field

```css
.input {
  width: 100%;
  padding: 14px 16px;
  font-size: 16px; /* Prevents iOS zoom */
  background: #fff;
  border: 2px solid #000;
  outline: none;
}

.input:focus {
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px #000;
}
```

### Badge

```css
.badge {
  display: inline-block;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  background: #000;
  color: #fff;
  border: 2px solid #000;
}

.badge-live {
  background: #ff0000;
  border-color: #ff0000;
  animation: pulse 1.5s ease infinite;
}
```

---

## 📋 Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│  RUSUH TIKET — V2 Brutalist Mono Mobile                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  COLORS         #000 ink / #fff ground / #f00 danger   │
│  FONTS          Inter (UI) / JetBrains Mono (waiting)  │
│  BORDERS        2px solid #000 (always)                │
│  SHADOWS        4px 4px 0 #000 (hard offset, no blur)  │
│  RADIUS         0 (sharp) or 2-4px (subtle only)       │
│  TAP TARGET     min 44px, recommended 48px             │
│  FRAME          16px horizontal padding                │
│  SAFE AREA      env(safe-area-inset-*)                 │
│                                                         │
│  ✅ DO:  Stark contrast, uppercase labels, hard edges  │
│  ❌ DON'T: Grays, soft shadows, gradients, blur        │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 File Structure

```
.oil-ui/v2-mobile/
├── design-tokens.css          # Shared token system (link this)
├── DESIGN-PALETTE-GUIDE.md    # This file
├── 01-home.html
├── 02-event-detail.html
├── 03-checkout.html
├── 04-my-tickets.html
├── 05-ticket-detail.html
├── 06-waiting.html            # Uses JetBrains Mono
├── 07-ticket-selection.html
├── 08-payment.html
├── 08a-snap.html
├── 09-expired.html
├── 10-success.html
└── (other screens...)
```

---

## 🔗 Token Import

Every mobile page should link the shared tokens:

```html
<link rel="stylesheet" href="design-tokens.css">
```

Then use CSS variables:

```css
body {
  font-family: var(--font-sans);
  background: var(--ground);
  color: var(--ink);
}
```

---

*Last updated: November 2026*
