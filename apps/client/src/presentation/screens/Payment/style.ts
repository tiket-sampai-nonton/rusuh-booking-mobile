/** Payment screen styles — extracted from inline `style={{…}}` (refactor rule). */
import { StyleSheet, type DimensionValue } from "react-native";

import { designColors } from "@presentation/theme";

export const paymentStyles = StyleSheet.create({
  //  brutalist: square timer dot + square method icon chip (black fill).
  timerDot: { width: 8, height: 8 },
  methodIcon: { width: 44, height: 30, backgroundColor: designColors.accent },
  tabularNum: { fontVariant: ["tabular-nums"] },
});

/** Sticky topbar top padding depends on the safe-area inset. */
export const paymentTopBar = (top: number) => ({ paddingTop: top + 10 });

/** Scroll content: fixed bottom pad + optional desktop max-width container. */
export const paymentScrollContent = (
  isDesktop: boolean,
  isMobileWeb = false,
) => ({
  padding: isMobileWeb ? 16 : 20,
  paddingBottom: isMobileWeb ? 88 : 120,
  ...(isDesktop
    ? {
        maxWidth: 620,
        width: "100%" as DimensionValue,
        alignSelf: "center" as const,
      }
    : {}),
});

/**  mobile prototype sticky checkout bar — white ground + bottom safe-area inset. */
export const paymentBar = (bottom: number, isMobileWeb = false) => ({
  backgroundColor: designColors.ground,
  borderTopColor: designColors.ink,
  paddingBottom: bottom + (isMobileWeb ? 8 : 16),
  paddingHorizontal: isMobileWeb ? 16 : 20,
});
