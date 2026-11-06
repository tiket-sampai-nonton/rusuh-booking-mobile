import { StyleSheet } from "react-native";
import {
  designBorders,
  designColors,
  designSpacingSemantic,
  plusJakartaSansFonts,
} from "@presentation/theme";

import type { ViewStyle, TextStyle } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: designSpacingSemantic.s,
    borderBottomWidth: designBorders.standard,
    borderBottomColor: designColors.ink,
  },
  actions: { flexDirection: "row", alignItems: "center", gap: 16 },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
    width: 44,
    height: 44,
    padding: 0,
    justifyContent: "center",
  },
  link: { flexDirection: "row", alignItems: "center" },
  title: {
    color: designColors.ink,
    fontFamily: plusJakartaSansFonts.extraBold,
    textTransform: "uppercase",
  },
  linkText: { textTransform: "uppercase" },
});

export function sectionHeaderContainerStyle(
  isNative: boolean,
  isMobileWeb = false,
): ViewStyle {
  return {
    marginBottom: isMobileWeb
      ? 12
      : isNative
        ? designSpacingSemantic.m
        : designSpacingSemantic.l,
    paddingBottom: isMobileWeb ? 0 : undefined,
    borderBottomWidth: isMobileWeb ? 0 : undefined,
  };
}

export function sectionHeaderTitleStyle(
  isNative: boolean,
  isMobileWeb = false,
): TextStyle {
  return {
    fontSize: isMobileWeb ? 18 : isNative ? 20 : 24,
    letterSpacing: isMobileWeb ? -0.3 : isNative ? -0.2 : 0.48,
    textTransform: isMobileWeb ? "none" : undefined,
  };
}

export function sectionLinkStyle(
  isNative: boolean,
  isMobileWeb = false,
): ViewStyle {
  return { gap: isMobileWeb ? 4 : isNative ? 4 : 8 };
}

export function sectionLinkTextStyle(
  isNative: boolean,
  isMobileWeb = false,
): TextStyle {
  return {
    color: isNative ? designColors.inkMuted : designColors.ink,
    fontSize: isMobileWeb ? 12 : isNative ? 12 : 14,
    fontFamily: isNative
      ? plusJakartaSansFonts.semiBold
      : plusJakartaSansFonts.bold,
    letterSpacing: isMobileWeb ? 0.48 : isNative ? 0.6 : 0.56,
  };
}
