import { StyleSheet } from "react-native";
import { designColors, plusJakartaSansFonts } from "@presentation/theme";

import type { DynamicStyle } from "@presentation/utils/style";

export const componentStyles = StyleSheet.create({
  // Toggle: grey track, white thumb with black border (same in both states).
  toggleTrack: {
    width: 48,
    height: 28,
    borderRadius: 14,
    backgroundColor: designColors.gray,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: designColors.white,
    borderWidth: 2,
    borderColor: designColors.black,
  },
  toggleThumbOn: {
    alignSelf: "flex-end",
    backgroundColor: designColors.black,
  },
  elementMarginTop0: {
    marginTop: 16,
    borderWidth: 2,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
    padding: 20,
  },
  elementFlexDirection1: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  elementFontSize2: {
    fontSize: 14,
    fontFamily: plusJakartaSansFonts.bold,
    color: designColors.ink,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  elementFontSize3: {
    fontSize: 12,
    fontFamily: plusJakartaSansFonts.bold,
    color: designColors.danger,
    textTransform: "uppercase",
  },
  elementMarginTop4: {
    marginTop: 16,
    fontSize: 10,
    fontFamily: plusJakartaSansFonts.bold,
    color: designColors.gray,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  elementMarginTop5: {
    marginTop: 8,
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  buyerDataControl: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  elementFlex7: {
    flex: 1,
    paddingRight: 12,
    fontSize: 13,
    fontFamily: plusJakartaSansFonts.regular,
    color: designColors.ink,
  },
  validationError: {
    color: designColors.danger,
    marginTop: 6,
    fontSize: 12,
    fontFamily: plusJakartaSansFonts.medium,
  },
});

export function styleForTicketItemPressable0(arg0: boolean): DynamicStyle {
  return {
    borderWidth: 2,
    borderColor: designColors.ink,
    backgroundColor: arg0 ? designColors.ink : designColors.ground,
    paddingHorizontal: 16,
    paddingVertical: 10,
  } as DynamicStyle;
}

export function styleForTicketItemText1(arg0: boolean): DynamicStyle {
  return {
    fontSize: 12,
    fontFamily: plusJakartaSansFonts.bold,
    color: arg0 ? designColors.ground : designColors.ink,
    textTransform: "uppercase",
  } as DynamicStyle;
}

export function styleForTicketItemText2(arg0: {
  label: string;
  color: string;
}): DynamicStyle {
  return {
    marginTop: 8,
    fontSize: 11,
    fontFamily: plusJakartaSansFonts.medium,
    color: arg0.color,
  } as DynamicStyle;
}
