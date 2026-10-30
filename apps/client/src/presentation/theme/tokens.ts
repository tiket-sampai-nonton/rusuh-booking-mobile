/**
 * RBT-003 — Raw design-token VALUES (prototype V5).
 *
 * These mirror `apps/client/tailwind.config.js` exactly. NativeWind cannot style
 * raw drawing surfaces (react-native-svg, Canvas, QR code `color`/`backgroundColor`,
 * Reanimated easing), so those call sites import the value from here instead of a
 * className. `tailwind.config.js` stays the source of truth; this file mirrors it.
 *
 * Every DERIVED (non-prototype) value is marked `DERIVED (flag)`.
 */

/** Brand hues — prototype `--red` / `--red-deep` / `--ember`. */
export const brand = {
  red: "#EC1C24", //      --red
  redDeep: "#a8111b", //  --red-deep
  ember: "#ff5a2d", //    --ember
} as const;

/** Status hues — prototype `--ok` / `--warn` (+ dark-context from waiting.html). */
export const status = {
  ok: "#17a34a", //       --ok
  okDark: "#4ade80", //   waiting.html dark --ok
  warn: "#e8830c", //     --warn
  warnDark: "#f5b301", // waiting.html --amber
  error: "#EC1C24", //    DERIVED (flag): no --err token; reuses --red
  errorDark: "#ff6a4c", // DERIVED (flag): lightened red for dark surfaces
} as const;

/** Neutral / surface hues — prototype `--ink*` / `--paper` / `--card` / `--muted` / `--line`. */
export const neutral = {
  ink: "#0a0a0c", //      --ink
  ink2: "#121217", //     --ink-2
  paper: "#fbfbfd", //    --paper
  card: "#ffffff", //     --card
  muted: "#6b6b76", //    --muted
  line: "rgba(10,10,12,0.08)", // --line
  mutedDark: "rgba(255,255,255,0.62)", // waiting.html dark --muted
  lineDark: "rgba(255,255,255,0.12)", // DERIVED (flag)
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

/** Font family stack — prototype body font. */
export const fontFamily = [
  "Plus Jakarta Sans",
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
  brand: "0 4px 12px -2px rgba(236,28,36,0.5)",
  button: "0 14px 40px -12px rgba(0,0,0,0.5)",
  filter: "0 12px 30px -24px rgba(10,10,12,0.5)",
  ok: "0 16px 40px -14px rgba(23,163,74,0.7)",
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
