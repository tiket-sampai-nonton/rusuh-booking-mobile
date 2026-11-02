/** Checkout screen styles — extracted from inline `style={{…}}` (refactor rule). */
import { StyleSheet, type DimensionValue } from "react-native";

export const checkoutStyles = StyleSheet.create({
  timerDot: { width: 8, height: 8, borderRadius: 999 },
  hero: {
    aspectRatio: 16 / 7,
    borderRadius: 24,
    overflow: "hidden",
    justifyContent: "flex-end",
    backgroundColor: "#222",
  },
  heroScrim: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(10,10,12,0.4)",
  },
  heroPad: { padding: 22 },
});

/** Sticky topbar top padding (safe-area inset, runtime). */
export const checkoutTopBar = (top: number) => ({ paddingTop: top + 10 });

/** Scroll content: fixed bottom pad + optional desktop max-width container. */
export const checkoutScrollContent = (isDesktop: boolean) => ({
  padding: 20,
  paddingBottom: 120,
  ...(isDesktop ? { maxWidth: 760, width: "100%" as DimensionValue, alignSelf: "center" as const } : {}),
});

/** Dark sticky checkout bar — fixed ink bg + bottom safe-area inset. */
export const checkoutBar = (bottom: number) => ({
  backgroundColor: "#0a0a0c",
  paddingBottom: bottom + 16,
});
