import { Platform, StyleSheet } from "react-native";
import { interFonts, designBorders, designColors } from "@presentation/theme";

import type { EdgeInsets } from "react-native-safe-area-context";
import type { DynamicStyle } from "@presentation/utils/style";
import { hardShadowStyle } from "@presentation/utils/style";

export const componentStyles = StyleSheet.create({
  elementFlex0: {
    flex: 1,
    alignItems: "center",
    justifyContent: Platform.OS === "web" ? "center" : "flex-end",
    padding: Platform.OS === "web" ? 24 : 0,
    backgroundColor: "rgba(0,0,0,0.72)",
  },
  elementFlexDirection1: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
  },
  elementFlex2: { flex: 1 },
  elementColor3: {
    color: designColors.ink,
    fontFamily: interFonts.black,
    fontSize: 20,
    textTransform: "uppercase",
  },
  elementMarginTop4: {
    marginTop: 6,
    color: designColors.inkMuted,
    fontFamily: interFonts.regular,
    fontSize: 13,
  },
  elementWidth5: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
  },
  elementMaxHeight6: { maxHeight: 340, marginTop: 12 },
  elementMarginTop7: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  elementMinHeight8: {
    minHeight: 44,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
  },
  elementColor9: {
    color: designColors.ink,
    fontFamily: interFonts.bold,
    fontSize: 13,
    textTransform: "uppercase",
  },
  elementMinHeight10: {
    minHeight: 44,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: designColors.ink,
  },
  elementColor11: {
    color: designColors.ground,
    fontFamily: interFonts.bold,
    fontSize: 13,
    textTransform: "uppercase",
  },
});

export function styleForFilterModalPressable0(arg0: EdgeInsets): DynamicStyle {
  return {
    width: "100%",
    maxWidth: 480,
    maxHeight: "90%",
    padding: 24,
    paddingBottom: Platform.OS === "web" ? 24 : Math.max(24, arg0.bottom + 16),
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
    ...hardShadowStyle(4, 4, designColors.ink, 5),
  } as DynamicStyle;
}

export function styleForFilterModalView1(): DynamicStyle {
  return { zIndex: 10000, elevation: 10000 } as DynamicStyle;
}
