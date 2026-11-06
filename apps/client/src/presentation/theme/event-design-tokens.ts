/**
 * RBT-096 —  "Brutalist Mono" Design Tokens (Re-implementation)
 *
 * Single source of truth: `.genesis/prototype/v2/MASTER-SPEC.md` + `design-tokens.json`
 *
 * RULES (MASTER-SPEC §1 + §7):
 * - Colors: ONLY #000, #fff, #666, #f5f5f5, #ff0000, #00aa00, #ff6600
 * - Borders: 2px solid black (3px for waiting room ONLY)
 * - Shadows: hard offset, NO blur (e.g. 4px 4px 0 #000)
 * - Fonts: Inter (waiting room: JetBrains Mono)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// COLORS
// ═══════════════════════════════════════════════════════════════════════════════

export const designColors = {
  // Core palette (semantic naming)
  ground: "#ffffff", // Page background - WHITE ONLY
  ink: "#000000", // Primary text/borders - BLACK ONLY
  inkMuted: "#666666", // Secondary text - THIS GRAY ONLY
  field: "#f5f5f5", // Input backgrounds, subtle surfaces

  // Functional colors
  danger: "#ff0000", // Errors, warnings, urgent states - PURE RED
  success: "#00aa00", // Success states, confirmations
  warning: "#ff6600", // Warnings, caution states

  // Legacy aliases (for backwards compatibility in components)
  black: "#000000",
  white: "#ffffff",
  gray: "#666666", // Legacy alias - uses inkMuted per Design Palette Guide (NO arbitrary grays)
  red: "#ff0000",
  green: "#00aa00",
  accent: "#000000", // CTAs same as ink for brutalist

  // Additional aliases for backwards compatibility
  muted: "#666666", // Alias for inkMuted
  warn: "#ff6600", // Alias for warning
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// TYPOGRAPHY
// ═══════════════════════════════════════════════════════════════════════════════

export const designFonts = {
  sans: "Inter", // Primary font
  mono: "JetBrains Mono", // Waiting room ONLY
} as const;

export const designFontWeights = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  black: "900",
} as const;

export const designFontSizes = {
  "2xs": 10, // 0.625rem - micro labels
  xs: 12, // 0.75rem - captions, badges
  s: 14, // 0.875rem - body small, buttons
  m: 16, // 1rem - body default
  l: 18, // 1.125rem - body large
  xl: 20, // 1.25rem - subheadings
  "2xl": 24, // 1.5rem - section titles (clamp min)
  "3xl": 32, // 2rem - page titles (clamp min)
  hero: 48, // 3rem - hero headlines (clamp min, scales to 160px)
} as const;

export const designLineHeights = {
  tight: 1.1,
  snug: 1.25,
  normal: 1.5,
  relaxed: 1.625,
} as const;

export const designLetterSpacing = {
  tight: -0.02, // -0.02em
  normal: 0,
  wide: 0.05, // 0.05em (buttons)
  wider: 0.1, // 0.1em
  widest: 0.15, // 0.15em
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SPACING (8px base unit)
// ═══════════════════════════════════════════════════════════════════════════════

export const designSpacing = {
  0: 0,
  1: 4, // 0.25rem
  2: 8, // 0.5rem - xs
  3: 12, // 0.75rem
  4: 16, // 1rem - s
  5: 20, // 1.25rem
  6: 24, // 1.5rem - m
  8: 32, // 2rem
  10: 40, // 2.5rem
  12: 48, // 3rem - l
  16: 64, // 4rem
  20: 80, // 5rem - xl
  24: 96, // 6rem
} as const;

// Semantic spacing aliases (MASTER-SPEC §1)
export const designSpacingSemantic = {
  xs: 8, // 0.5rem
  s: 16, // 1rem
  m: 24, // 1.5rem
  l: 32, // 2rem — mobile prototype --space-l
  xl: 48, // 3rem — mobile prototype --space-xl
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// BORDERS
// ═══════════════════════════════════════════════════════════════════════════════

export const designBorders = {
  standard: 2, // Default border width - 2px
  thick: 3, // Waiting room ONLY - 3px
  thin: 1, // Muted/subtle borders
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// SHADOWS (HARD OFFSET ONLY - NO BLUR)
// ═══════════════════════════════════════════════════════════════════════════════

export const designShadows = {
  sm: { x: 2, y: 2, blur: 0, color: "#000000" },
  md: { x: 4, y: 4, blur: 0, color: "#000000" },
  lg: { x: 6, y: 6, blur: 0, color: "#000000" },
  xl: { x: 8, y: 8, blur: 0, color: "#000000" },
} as const;

// Shadow as CSS string helper
export const designShadowCSS = {
  sm: "2px 2px 0 #000000",
  md: "4px 4px 0 #000000",
  lg: "6px 6px 0 #000000",
  xl: "8px 8px 0 #000000",
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// ANIMATIONS (MASTER-SPEC §1 + §5)
// ═══════════════════════════════════════════════════════════════════════════════

export const designDuration = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  slower: 800,
} as const;

// Easing curves as Reanimated-compatible bezier tuples
export const designEasing = {
  // Primary easing - smooth deceleration
  primary: [0.16, 1, 0.3, 1] as const,
  // Gentle ease out
  out: [0.33, 1, 0.68, 1] as const,
  // Gentle ease in
  in: [0.32, 0, 0.67, 0] as const,
  // Symmetric in-out
  inOut: [0.65, 0, 0.35, 1] as const,
  // Playful elastic bounce
  elastic: [0.68, -0.6, 0.32, 1.6] as const,
  // Subtle bounce
  bounce: [0.34, 1.56, 0.64, 1] as const,
  // Spring pop
  spring: [0.175, 0.885, 0.32, 1.275] as const,
} as const;

// Easing curves as CSS cubic-bezier strings
export const designEasingCSS = {
  primary: "cubic-bezier(0.16, 1, 0.3, 1)",
  out: "cubic-bezier(0.33, 1, 0.68, 1)",
  in: "cubic-bezier(0.32, 0, 0.67, 0)",
  inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
  elastic: "cubic-bezier(0.68, -0.6, 0.32, 1.6)",
  bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  spring: "cubic-bezier(0.175, 0.885, 0.32, 1.275)",
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// Z-INDEX SCALE
// ═══════════════════════════════════════════════════════════════════════════════

export const designZIndex = {
  behind: -1,
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  header: 300,
  overlay: 400,
  modal: 500,
  popover: 600,
  toast: 700,
  tooltip: 800,
  cursor: 10000,
  max: 99999,
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// LAYOUT
// ═══════════════════════════════════════════════════════════════════════════════

export const designLayout = {
  headerHeight: 60,
  headerHeightMobile: 56, // Mobile: 56px (design-tokens.css --header-height)
  bottomBarHeight: 72, // Mobile: 72px (design-tokens.css --bottom-bar-height)
  tapTarget: 44, // Mobile: 44px min touch target
  contentNarrow: 600,
  contentDefault: 700,
  contentWide: 1200,
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// BREAKPOINTS (MASTER-SPEC §6)
// ═══════════════════════════════════════════════════════════════════════════════

export const designBreakpoints = {
  sm: 640, // Mobile
  md: 768, // Tablet
  lg: 1024, // Desktop
} as const;

// Grid columns by breakpoint
export const designGridColumns = {
  mobile: 1, // < 640px
  tablet: 2, // 640-900px
  desktop: 3, // > 900px
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT TOKENS
// ═══════════════════════════════════════════════════════════════════════════════

export const designButton = {
  paddingY: 10, // 0.625rem default
  paddingX: 20, // 1.25rem default
  paddingYLarge: 16, // 1rem large
  paddingXLarge: 32, // 2rem large
  fontSize: 14, // --text-s
  fontSizeLarge: 16, // --text-m
  fontWeight: "700",
  letterSpacing: 0.04, // 0.04em
} as const;

export const designInput = {
  paddingY: 16, // 1rem
  paddingX: 16, // 1rem
  fontSize: 16, // --text-m
  fontWeight: "500",
} as const;

export const designCard = {
  padding: 24, // 1.5rem
} as const;

export const designModal = {
  padding: 48, // 3rem (MASTER-SPEC §2.4)
  maxWidth: 400,
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// WAITING ROOM ZONE BANNERS (MASTER-SPEC §3.3)
// ═══════════════════════════════════════════════════════════════════════════════

export const designZoneBanners = {
  guaranteed: {
    bg: "#e8f5e9",
    border: "#2e7d32",
    text: "#1b5e20",
  },
  possible: {
    bg: "#fff3e0",
    border: "#f57c00",
    text: "#e65100",
  },
  notEnough: {
    bg: "#ffebee",
    border: "#c62828",
    text: "#b71c1c",
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════════
// COMPLETE TOKEN BAG (single ergonomic import)
// ═══════════════════════════════════════════════════════════════════════════════

export const designTokens = {
  colors: designColors,
  fonts: designFonts,
  fontWeights: designFontWeights,
  fontSizes: designFontSizes,
  lineHeights: designLineHeights,
  letterSpacing: designLetterSpacing,
  spacing: designSpacing,
  spacingSemantic: designSpacingSemantic,
  borders: designBorders,
  shadows: designShadows,
  shadowCSS: designShadowCSS,
  duration: designDuration,
  easing: designEasing,
  easingCSS: designEasingCSS,
  zIndex: designZIndex,
  layout: designLayout,
  breakpoints: designBreakpoints,
  gridColumns: designGridColumns,
  button: designButton,
  input: designInput,
  card: designCard,
  modal: designModal,
  zoneBanners: designZoneBanners,
} as const;

export type EventDesignTokens = typeof designTokens;

// ═══════════════════════════════════════════════════════════════════════════════
export const designZone = {
  ok: designZoneBanners.guaranteed,
  warn: designZoneBanners.possible,
  bad: designZoneBanners.notEnough,
} as const;

/** @deprecated Use designEasingCSS and designEasing instead */
export const designMotion = {
  ease: designEasingCSS.primary,
  easeBezier: designEasing.primary,
  easeOut: designEasingCSS.out,
  easeOutBezier: designEasing.out,
  elastic: designEasingCSS.elastic,
  elasticBezier: designEasing.elastic,
  expo: "cubic-bezier(0.76, 0, 0.24, 1)",
  expoBezier: [0.76, 0, 0.24, 1] as const,
} as const;

/** @deprecated Use designBorders instead */
export const designBorder = {
  base: designBorders.standard,
  heavy: designBorders.thick,
} as const;

/** @deprecated Use designFonts instead */
export const designFont = designFonts;
