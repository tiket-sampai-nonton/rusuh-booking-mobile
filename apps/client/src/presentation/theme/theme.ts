/**
 * RBT-003 — Semantic theme for non-className drawing surfaces.
 *
 * Mirrors the `background`/`foreground`/`card`/`muted`/`line` semantic colors in
 * `tailwind.config.js`. Every surface is a background+text PAIR (AC2): callers that
 * draw to Canvas/SVG/QR read a whole `ThemeColors` object so no surface can be set
 * with a background and no readable foreground.
 */
import { brand, neutral, status } from "./tokens";

/** A resolved color set for one color scheme. Every bg has a paired fg. */
export interface ThemeColors {
  /** Page background. */
  background: string;
  /** Default text on `background`. */
  foreground: string;
  /** Raised surface (card/sheet) background. */
  card: string;
  /** Text on `card`. */
  cardForeground: string;
  /** Secondary / low-emphasis text. */
  muted: string;
  /** Hairline / divider color. */
  line: string;
  /** Brand accent. */
  brand: string;
  /** Success status. */
  ok: string;
  /** Warning status. */
  warn: string;
  /** Error status. */
  error: string;
}

/** Light scheme — white surfaces with red brand accents. */
export const lightColors: ThemeColors = {
  background: neutral.paper,
  foreground: neutral.ink,
  card: neutral.card,
  cardForeground: neutral.ink,
  muted: neutral.muted,
  line: neutral.line,
  brand: brand.primary,
  ok: status.ok,
  warn: status.warn,
  error: status.error,
};

/**
 * Dark scheme — black surfaces with high-contrast red accents.
 */
export const darkColors: ThemeColors = {
  background: neutral.darkBackground,
  foreground: neutral.darkForeground,
  card: neutral.darkCard,
  cardForeground: neutral.darkForeground,
  muted: neutral.mutedDark,
  line: neutral.lineDark,
  brand: brand.primary,
  ok: status.okDark,
  warn: status.warnDark,
  error: status.errorDark,
};

/** The two color schemes keyed by name. */
export const themes = {
  light: lightColors,
  dark: darkColors,
} as const;

export type ColorSchemeName = keyof typeof themes;

/**
 * Resolve the color set for a scheme. Falls back to `light` for `null`/unknown
 * (react-native `useColorScheme()` returns `null` before the OS value is known).
 */
export function getThemeColors(
  scheme: ColorSchemeName | null | undefined,
): ThemeColors {
  return scheme === "dark" ? darkColors : lightColors;
}

/**
 * Reduced-motion flag. Mirrors the prototype's
 * `@media(prefers-reduced-motion:reduce)` guard for the imperative (JS-driven)
 * animations the prototype also gated via `matchMedia(...reduce).matches`.
 *
 * `durationFor` returns `0` when motion is reduced so Reanimated / timing-based
 * animations collapse to an instant state change instead of a transition.
 */
export function durationFor(ms: number, reducedMotion: boolean): number {
  return reducedMotion ? 0 : ms;
}

/** `true` when the OS asks for reduced motion (defaults to `false`). */
export function prefersReducedMotion(
  reduceMotionEnabled: boolean | null | undefined,
): boolean {
  return reduceMotionEnabled === true;
}
