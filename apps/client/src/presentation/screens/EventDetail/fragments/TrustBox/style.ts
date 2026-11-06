import { StyleSheet } from "react-native";
import { interFonts } from "@presentation/theme/fonts";
import {
  designBorders,
  designColors,
  designFontSizes,
  designSpacingSemantic,
} from "@presentation/theme/event-design-tokens";

export const trustStyles = StyleSheet.create({
  container: {
    padding: designSpacingSemantic.m,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    borderStyle: "dashed",
    gap: designSpacingSemantic.s,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: designSpacingSemantic.s,
  },
  check: {
    fontFamily: interFonts.black,
    fontSize: designFontSizes.s,
    color: designColors.success, // #00aa00 per Design Palette Guide
    lineHeight: designFontSizes.s * 1.5,
  },
  text: {
    flex: 1,
    fontFamily: interFonts.regular,
    fontSize: designFontSizes.s,
    color: designColors.inkMuted,
    lineHeight: designFontSizes.s * 1.5,
  },
});
