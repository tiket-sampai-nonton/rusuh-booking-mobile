/** Payment screen styles — extracted from inline `style={{…}}` (refactor rule). */
import { StyleSheet, type DimensionValue } from "react-native";

export const paymentStyles = StyleSheet.create({
  timerDot: { width: 8, height: 8, borderRadius: 999 },
  methodIcon: { width: 44, height: 30, borderRadius: 7 },
});

/** Sticky topbar top padding depends on the safe-area inset. */
export const paymentTopBar = (top: number) => ({ paddingTop: top + 10 });

/** Scroll content: fixed bottom pad + optional desktop max-width container. */
export const paymentScrollContent = (isDesktop: boolean) => ({
  padding: 20,
  paddingBottom: 120,
  ...(isDesktop ? { maxWidth: 620, width: "100%" as DimensionValue, alignSelf: "center" as const } : {}),
});

/** Dark sticky checkout bar — fixed ink bg + bottom safe-area inset. */
export const paymentBar = (bottom: number) => ({
  backgroundColor: "#0a0a0c",
  paddingBottom: bottom + 16,
});
