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

/** Cyberpunk brand hues used by the OTA theme test. */
export const brand = {
  purple: "#7C3AED",
  purpleDeep: "#5B21B6",
  magenta: "#FF32C8",
  cyan: "#007F9E",
  neonCyan: "#49E8FF",
} as const;

/** Status hues adapted for readable contrast on the cyberpunk surfaces. */
export const status = {
  ok: "#087F68",
  okDark: "#5EEAD4",
  warn: "#9A5B00",
  warnDark: "#FFD166",
  error: "#C02677",
  errorDark: "#FF7AB6",
} as const;

/** Lavender and deep-violet surfaces for light and dark color schemes. */
export const neutral = {
  ink: "#1B1026",
  ink2: "#28113D",
  paper: "#F7F2FF",
  card: "#FFFCFF",
  darkBackground: "#0B0614",
  darkCard: "#170D24",
  darkForeground: "#F7F2FF",
  overlay: "#0B0614",
  muted: "#665873",
  line: "rgba(43,19,67,0.14)",
  mutedDark: "#C7B8D8",
  lineDark: "rgba(220,190,255,0.18)",
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
  brand: "0 4px 16px -2px rgba(124,58,237,0.48)",
  button: "0 14px 40px -12px rgba(27,16,38,0.42)",
  filter: "0 12px 30px -24px rgba(43,19,67,0.5)",
  ok: "0 16px 40px -14px rgba(8,127,104,0.45)",
} as const;

/** The complete raw token bag — single object for ergonomic import. */
export const tokens = {
  brand,
  status,
  neutral,
  radius,
  spacing,
  fontSize,
  fontWeight,
  fontFamily,
  motion,
  shadow,
} as const;

export type Tokens = typeof tokens;
