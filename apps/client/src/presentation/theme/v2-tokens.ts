/**
 * RBT-086 — V2 "Brutalist Mono" raw token VALUES.
 *
 * Mirrors the `v2` namespace in `apps/client/tailwind.config.js` EXACTLY, for
 * the non-className drawing contexts NativeWind cannot style (react-native-svg,
 * QR `color`/`backgroundColor`, Reanimated easing, canvas). `tailwind.config.js`
 * stays the single source of truth; this file mirrors it.
 *
 * Unifies the prototype's two token systems:
 *   home / event-detail : --ground / --ink / --ink-muted / --field / --accent / --danger
 *   flow screens        : --black / --white / --gray / --red / --green
 * into ONE set. Prototype-specific accents (live red, warn/amber, info blue,
 * zone tints) are named tokens here, never inline literals in components.
 */

/** Core Brutalist Mono palette — pure black/white base. */
export const v2 = {
  ink: "#000000", //     --ink / --black
  ground: "#ffffff", //  --ground / --white
  muted: "#666666", //   --ink-muted (readable gray)
  gray: "#888888", //    --gray (secondary gray)
  field: "#f5f5f5", //   --field (elevated/input surface)
  accent: "#ff0000", //  --red (brutalist accent / live red)
  danger: "#dc2626", //  --danger (destructive)
  success: "#00aa00", // --green (success)
  warn: "#ff6600", //    offline/paused warning
  info: "#3b82f6", //    --info (browse blue)
} as const;

/** Waiting-room zone-banner tints (prototype 06 `.zone.*`). */
export const v2Zone = {
  ok: { bg: "#e8f5e9", border: "#2e7d32", text: "#1b5e20" }, //  GUARANTEED
  warn: { bg: "#fff3e0", border: "#f57c00", text: "#e65100" }, // POSSIBLE
  bad: { bg: "#ffebee", border: "#c62828", text: "#b71c1c" }, //  NOT_ENOUGH
} as const;

/** V2 easings (CSS form + Reanimated bezier tuples). */
export const v2Motion = {
  ease: "cubic-bezier(0.16, 1, 0.3, 1)", //            --ease
  easeBezier: [0.16, 1, 0.3, 1] as const,
  easeOut: "cubic-bezier(0.33, 1, 0.68, 1)", //        --ease-out
  easeOutBezier: [0.33, 1, 0.68, 1] as const,
  elastic: "cubic-bezier(0.68, -0.6, 0.32, 1.6)", //   --ease-elastic
  elasticBezier: [0.68, -0.6, 0.32, 1.6] as const,
  expo: "cubic-bezier(0.76, 0, 0.24, 1)", //           flow loader/fill ease
  expoBezier: [0.76, 0, 0.24, 1] as const,
} as const;

/** V2 border widths — hard brutalist borders. */
export const v2Border = {
  base: 2, //  default V2 border
  heavy: 3, //  waiting-room variant
} as const;

/** V2 font families. */
export const v2Font = {
  sans: "Inter",
  mono: "JetBrains Mono", // waiting-room terminal variant (deliberate)
} as const;

/** The complete V2 token bag — single ergonomic import. */
export const v2Tokens = {
  color: v2,
  zone: v2Zone,
  motion: v2Motion,
  border: v2Border,
  font: v2Font,
} as const;

export type V2Tokens = typeof v2Tokens;
