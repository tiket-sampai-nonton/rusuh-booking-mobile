import { StyleSheet } from "react-native";

import { interFonts } from "@presentation/theme/fonts";
import {
  designBorders,
  designColors,
  designFontSizes,
  designSpacingSemantic,
} from "@presentation/theme/event-design-tokens";

export const lineupStyles = StyleSheet.create({
  scroll: {
    marginHorizontal: -designSpacingSemantic.m,
  },
  scrollContent: {
    paddingHorizontal: designSpacingSemantic.m,
    paddingBottom: designSpacingSemantic.s,
    gap: designSpacingSemantic.s,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: designSpacingSemantic.s,
  },
  cardWeb: {
    width: 150,
    alignItems: "center",
    padding: designSpacingSemantic.m,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
  },
  cardHover: {
    backgroundColor: designColors.ink,
    transform: [{ translateY: -4 }],
  },
  cardNative: {
    width: 100,
    alignItems: "center",
    padding: designSpacingSemantic.s,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: designSpacingSemantic.xs,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
  },
  grayscaleDark: {
    borderRadius: 40,
    backgroundColor: "rgba(0, 0, 0, 0.25)",
  },
  grayscaleGray: {
    borderRadius: 40,
    backgroundColor: "rgba(128, 128, 128, 0.65)",
  },
  name: {
    fontFamily: interFonts.bold,
    fontSize: designFontSizes.xs,
    color: designColors.ink,
    textTransform: "uppercase",
    textAlign: "center",
  },
  nameHover: {
    color: designColors.ground,
  },
  role: {
    fontFamily: interFonts.regular,
    fontSize: 10,
    color: designColors.inkMuted,
    textAlign: "center",
    marginTop: 2,
  },
  roleHover: {
    color: designColors.ground,
    opacity: 0.7,
  },
  empty: {
    fontFamily: interFonts.regular,
    fontSize: designFontSizes.m,
    color: designColors.inkMuted,
  },
});
