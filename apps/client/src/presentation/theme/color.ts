/**
 * Color utilities for non-className drawing contexts.
 *
 * NativeWind styles via className, but raw `style={{}}` surfaces (shadows,
 * overlays, alpha tints) sometimes need a computed color. `withAlpha` derives an
 * `rgba(...)` from a TOKEN hex so those call sites never hardcode a literal hue —
 * the single source of truth stays the token in `tokens.ts` / `tailwind.config.js`.
 */

/** Hex `#rrggbb` → `rgba(r,g,b,a)`. Keeps alpha tints anchored to a token value. */
export function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
