/**
 * Shared color and layout values mirrored by `apps/client/tailwind.config.js`.
 *
 * These mirror `apps/client/tailwind.config.js` exactly. NativeWind cannot style
 * raw drawing surfaces (react-native-svg, Canvas, QR code `color`/`backgroundColor`,
 * Reanimated easing), so those call sites import the value from here instead of a
 * className. `tailwind.config.js` stays the source of truth; this file mirrors it.
 *
 * Tailwind remains the color-token source of truth; this file mirrors colors
 * for SVG, QR, Canvas, and other raw drawing surfaces.
 */

const tailwind = require("../../../tailwind.config.js");
const colors = tailwind.theme.extend.colors;
const shadows = tailwind.theme.extend.boxShadow;

/** Brand hues derived from Tailwind's canonical palette. */
export const brand = {
  primary: colors.brand.DEFAULT,
  deep: colors.brand.deep,
  ember: colors.brand.ember,
} as const;

/** Status hues mirrored from Tailwind's semantic tokens. */
export const status = {
  ok: colors.ok.DEFAULT,
  okDark: colors.ok.dark,
  warn: colors.warn.DEFAULT,
  warnDark: colors.warn.dark,
  error: colors.error.DEFAULT,
  errorDark: colors.error.dark,
} as const;

/** Neutral and field surfaces mirrored from Tailwind's semantic tokens. */
export const neutral = {
  ink: colors.ink.DEFAULT,
  ink2: colors.ink[2],
  paper: colors.paper,
  card: colors.card.DEFAULT,
  darkBackground: colors.background.dark,
  darkCard: colors.card.dark,
  darkForeground: colors.foreground.dark,
  overlay: colors.v2.overlay,
  muted: colors.muted.DEFAULT,
  line: colors.line.DEFAULT,
  mutedDark: colors.muted.dark,
  lineDark: colors.line.dark,
  field: colors.v2.field,
} as const;

/** Waiting-room status surfaces mirrored from Tailwind's `v2` tokens. */
export const zone = {
  ok: {
    bg: colors.v2["zone-ok"],
    border: colors.v2["zone-ok-border"],
    text: colors.v2["zone-ok-text"],
  },
  warn: {
    bg: colors.v2["zone-warn"],
    border: colors.v2["zone-warn-border"],
    text: colors.v2["zone-warn-text"],
  },
  bad: {
    bg: colors.v2["zone-bad"],
    border: colors.v2["zone-bad-border"],
    text: colors.v2["zone-bad-text"],
  },
} as const;

/** Border radii in px — prototype `border-radius` values. */
export const radius = {
  mk: 7,
  sm: 9,
  base: 10,
  md: 12,
  lg: 14,
  xl: 16,
  "2xl": 20,
  "3xl": 22,
  "4xl": 24,
  "5xl": 26,
  pill: 999,
} as const;

/** Spacing steps in px — prototype paddings. */
export const spacing = {
  1.5: 6,
  1.75: 7,
  2.25: 9,
  2.75: 11,
  3.25: 13,
  3.5: 14,
  3.75: 15,
  4.5: 18,
  5.5: 22,
  6.5: 26,
  7.5: 30,
} as const;

/** Font sizes in px — prototype `font-size` scale. */
export const fontSize = {
  micro: 8,
  "2xs": 10,
  xs: 12,
  sm: 13,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  "2xl": 20,
  "3xl": 24,
  display: 38,
  hero: 48,
} as const;

/** Font weights — prototype uses 600 / 700 / 800. */
export const fontWeight = {
  semibold: "600",
  bold: "700",
  extrabold: "800",
} as const;

/** Font family stack — bundled Plus Jakarta Sans plus platform fallbacks. */
export const fontFamily = [
  "PlusJakartaSans_400Regular",
  "system-ui",
  "-apple-system",
  "sans-serif",
] as const;

/**
 * Motion tokens — prototype `--ease` and the durations it pairs with.
 * `easeBezier` is the raw control-point tuple for Reanimated `Easing.bezier(...)`.
 */
export const motion = {
  ease: "cubic-bezier(0.32, 0.72, 0, 1)", // --ease (CSS form)
  easeBezier: [0.32, 0.72, 0, 1] as const, //  Reanimated form
  duration: {
    250: 250,
    350: 350,
    400: 400,
    600: 600,
    700: 700,
  },
} as const;

/** Elevation shadows — prototype `box-shadow` values (CSS strings). */
export const shadow = {
  brand: shadows.brand,
  button: shadows.button,
  filter: shadows.filter,
  ok: shadows.ok,
} as const;

/** The complete raw token bag — single object for ergonomic import. */
export const tokens = {
  brand,
  status,
  neutral,
  zone,
  radius,
  spacing,
  fontSize,
  fontWeight,
  fontFamily,
  motion,
  shadow,
} as const;

export type Tokens = typeof tokens;
