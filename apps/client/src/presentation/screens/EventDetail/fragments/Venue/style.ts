
import { StyleSheet } from "react-native";
import { interFonts } from "@presentation/theme/fonts";
import { designBorders, designColors, designFontSizes, designSpacingSemantic } from "@presentation/theme/event-design-tokens";

import type { DynamicStyle } from "@presentation/utils/style";

export const venueStyles = StyleSheet.create({
  mapContainer: {
    position: "relative",
    aspectRatio: 16 / 9,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    overflow: "hidden",
  },
  mapImage: {
    width: "100%",
    height: "100%",
  },
  mapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
  },
  mapBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: designSpacingSemantic.xs,
    paddingVertical: designSpacingSemantic.s,
    paddingHorizontal: designSpacingSemantic.m,
    backgroundColor: designColors.ground,
  },
  mapBtnIcon: {
    fontSize: 16,
  },
  mapBtnText: {
    fontFamily: interFonts.bold,
    fontSize: designFontSizes.s,
    color: designColors.ink,
    textTransform: "uppercase",
    letterSpacing: designFontSizes.s * 0.04,
  },
  info: {
    marginTop: designSpacingSemantic.m,
  },
  name: {
    fontFamily: interFonts.bold,
    fontSize: designFontSizes.l,
    color: designColors.ink,
    marginBottom: designSpacingSemantic.xs,
  },
  address: {
    fontFamily: interFonts.regular,
    fontSize: designFontSizes.s,
    color: designColors.inkMuted,
    lineHeight: designFontSizes.s * 1.5,
  },
});

export function styleForVenueImage0(arg0: boolean): DynamicStyle {
  return {
              filter: arg0 ? "grayscale(0%)" : "grayscale(100%)",
              transition: "filter 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            } as DynamicStyle;
}

export function styleForVenueView1(arg0: boolean): DynamicStyle {
  return { opacity: arg0 ? 1 : 0 } as DynamicStyle;
}
