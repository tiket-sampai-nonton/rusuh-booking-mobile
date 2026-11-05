
import { StyleSheet } from 'react-native';
import { designBorders, designColors, designSpacingSemantic, interFonts } from '@presentation/theme';

import type { ViewStyle, TextStyle } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: designSpacingSemantic.s,
    borderBottomWidth: designBorders.standard,
    borderBottomColor: designColors.ink,
  },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
    width: 44,
    height: 44,
    padding: 0,
    justifyContent: 'center',
  },
  link: { flexDirection: 'row', alignItems: 'center' },
  title: {
    color: designColors.ink,
    fontFamily: interFonts.black,
    textTransform: 'uppercase',
  },
  linkText: { textTransform: 'uppercase' },
});

export function sectionHeaderContainerStyle(isNative: boolean): ViewStyle {
  return { marginBottom: isNative ? designSpacingSemantic.m : designSpacingSemantic.l };
}

export function sectionHeaderTitleStyle(isNative: boolean): TextStyle {
  return { fontSize: isNative ? 20 : 24, letterSpacing: isNative ? -0.2 : 0.48 };
}

export function sectionLinkStyle(isNative: boolean): ViewStyle {
  return { gap: isNative ? 4 : 8 };
}

export function sectionLinkTextStyle(isNative: boolean): TextStyle {
  return {
    color: isNative ? designColors.inkMuted : designColors.ink,
    fontSize: isNative ? 12 : 14,
    fontFamily: isNative ? interFonts.semiBold : interFonts.bold,
    letterSpacing: isNative ? 0.6 : 0.56,
  };
}
