/** Payment screen styles — extracted from inline `style={{…}}` (refactor rule). */
import { StyleSheet, type DimensionValue } from "react-native";

import { v2 } from "@presentation/theme";

export const paymentStyles = StyleSheet.create({
  // V2 brutalist: square timer dot + square method icon chip (black fill).
  timerDot: { width: 8, height: 8 },
  methodIcon: { width: 44, height: 30, backgroundColor: v2.accent },
  tabularNum: { fontVariant: ["tabular-nums"] },
});

/** Sticky topbar top padding depends on the safe-area inset. */
export const paymentTopBar = (top: number) => ({ paddingTop: top + 10 });

/** Scroll content: fixed bottom pad + optional desktop max-width container. */
export const paymentScrollContent = (isDesktop: boolean) => ({
  padding: 20,
  paddingBottom: 120,
  ...(isDesktop ? { maxWidth: 620, width: "100%" as DimensionValue, alignSelf: "center" as const } : {}),
});

/** V2 brutalist sticky checkout bar — black ground + bottom safe-area inset. */
export const paymentBar = (bottom: number) => ({
  backgroundColor: v2.ink,
  paddingBottom: bottom + 16,
});
