/**
 * RBT-003 — `@presentation/theme` public surface.
 *
 * Re-exports the raw token values and the semantic light/dark theme for
 * non-className drawing contexts (SVG / Canvas / QR / Reanimated). See
 * ARCHITECTURE.md §6.5. `tailwind.config.js` remains the single source of truth;
 * these values mirror it.
 */
export * from "./tokens";
export * from "./theme";
