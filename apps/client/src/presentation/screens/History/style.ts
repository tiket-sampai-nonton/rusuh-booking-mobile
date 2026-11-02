/** History screen styles — extracted from inline style (refactor rule). */
import { StyleSheet, type DimensionValue } from "react-native";

const GAP = 22;

export const historyStyles = StyleSheet.create({
  gridList: { marginTop: 20, gap: 22 },
});

/** Top-bar padding depends on the safe-area inset (runtime factory). */
export const historyTopBar = (top: number) => ({ paddingTop: top + 12 });

/** Scroll content: bottom inset + optional desktop max-width container. */
export const historyScrollContent = (bottom: number, isDesktop: boolean) => ({
  padding: 20,
  paddingBottom: bottom + 32,
  ...(isDesktop
    ? {
        maxWidth: 1180,
        width: "100%" as DimensionValue,
        alignSelf: "center" as const,
      }
    : {}),
});

/** Multi-column grid row (desktop) — negative margin gutters. */
export const historyGridRow = {
  flexDirection: "row" as const,
  flexWrap: "wrap" as const,
  marginHorizontal: -GAP / 2,
  marginTop: 20,
};

/** One cell in the multi-column grid. */
export const historyGridCell = (columns: number) => ({
  width: `${100 / columns}%` as DimensionValue,
  paddingHorizontal: GAP / 2,
  marginBottom: GAP,
});
