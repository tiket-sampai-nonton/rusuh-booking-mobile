import { StyleSheet } from "react-native";
import {
  designBorders,
  designColors,
  plusJakartaSansFonts,
} from "@presentation/theme";

import type { ViewStyle } from "react-native";

export const GRID_GAP = 2;

export const styles = StyleSheet.create({
  empty: {
    padding: 48,
    borderWidth: designBorders.standard,
    borderStyle: "dashed",
    borderColor: designColors.ink,
  },
  emptyLabel: {
    color: designColors.inkMuted,
    fontSize: 14,
    textAlign: "center",
    fontFamily: plusJakartaSansFonts.regular,
  },
  grid: {
    borderWidth: GRID_GAP,
    borderColor: designColors.ink,
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "transparent",
    overflow: "hidden",
  },
});

export function gridItemStyle(
  index: number,
  itemCount: number,
  columns: number,
  isMobileWeb = false,
  includeOuterBorder = false,
): ViewStyle {
  if (isMobileWeb) {
    return { width: "100%", borderWidth: 0 };
  }
  const isLastInRow = (index + 1) % columns === 0;
  const totalRows = Math.ceil(itemCount / columns);
  const currentRow = Math.floor(index / columns) + 1;
  const isLastRow = currentRow === totalRows;

  const style: ViewStyle = {
    width: `${100 / columns}%` as `${number}%`,
    borderRightWidth: isLastInRow ? 0 : GRID_GAP,
    borderBottomWidth: isLastRow ? 0 : GRID_GAP,
    borderColor: designColors.ink,
  };

  if (!includeOuterBorder) return style;

  return {
    ...style,
    borderLeftWidth: index % columns === 0 ? GRID_GAP : undefined,
    borderTopWidth: index < columns ? GRID_GAP : undefined,
    borderRightWidth:
      isLastInRow || index === itemCount - 1
        ? GRID_GAP
        : style.borderRightWidth,
    borderBottomWidth: isLastRow ? GRID_GAP : style.borderBottomWidth,
  };
}

export function gridContainerStyle(isMobileWeb: boolean): ViewStyle {
  return isMobileWeb ? { borderWidth: 0, gap: 8, overflow: "visible" } : {};
}
