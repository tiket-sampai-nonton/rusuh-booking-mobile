import { StyleSheet, type ViewStyle, type TextStyle } from "react-native";
import {
  designBorders,
  designColors,
  designSpacingSemantic,
  plusJakartaSansFonts,
} from "@presentation/theme";

function responsiveValue<T>(
  isNative: boolean,
  isMobileWeb: boolean,
  mobileWebValue: T,
  nativeValue: T,
  desktopValue: T,
): T {
  if (isMobileWeb) return mobileWebValue;
  if (isNative) return nativeValue;
  return desktopValue;
}

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
    marginBottom: responsiveValue(
      isNative,
      isMobileWeb,
      12,
      designSpacingSemantic.m,
      designSpacingSemantic.l,
    ),
    paddingBottom: isMobileWeb ? 0 : undefined,
    borderBottomWidth: isMobileWeb ? 0 : undefined,
  };
}

export function sectionHeaderTitleStyle(
  isNative: boolean,
  isMobileWeb = false,
): TextStyle {
  return {
    fontSize: responsiveValue(isNative, isMobileWeb, 18, 20, 24),
    letterSpacing: responsiveValue(isNative, isMobileWeb, -0.3, -0.2, 0.48),
    textTransform: isMobileWeb ? "none" : undefined,
  };
}

export function sectionLinkStyle(
  isNative: boolean,
  isMobileWeb = false,
): ViewStyle {
  return { gap: responsiveValue(isNative, isMobileWeb, 4, 4, 8) };
}

export function sectionLinkTextStyle(
  isNative: boolean,
  isMobileWeb = false,
): TextStyle {
  return {
    color: isNative ? designColors.inkMuted : designColors.ink,
    fontSize: responsiveValue(isNative, isMobileWeb, 12, 12, 14),
    fontFamily: isNative
      ? plusJakartaSansFonts.semiBold
      : plusJakartaSansFonts.bold,
    letterSpacing: responsiveValue(isNative, isMobileWeb, 0.48, 0.6, 0.56),
  };
}
