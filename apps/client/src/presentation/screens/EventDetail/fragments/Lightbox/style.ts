import { StyleSheet } from "react-native";
import { plusJakartaSansFonts } from "@presentation/theme/fonts";
import { withAlpha } from "@presentation/theme";
import {
  designColors,
  designFontSizes,
  designSpacingSemantic,
} from "@presentation/theme/event-design-tokens";

import { Animated } from "react-native";
import type { DynamicStyle } from "@presentation/utils/style";

export const lightboxStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: withAlpha(designColors.overlay, 0.95),
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    top: designSpacingSemantic.m,
    right: designSpacingSemantic.m,
  },
  content: {
    maxWidth: "90%",
    maxHeight: "90%",
  },
  image: {
    width: "100%",
    height: "100%",
    minWidth: 300,
    minHeight: 200,
    maxWidth: 1200,
    maxHeight: 800,
  },
  counter: {
    position: "absolute",
    bottom: designSpacingSemantic.m,
    fontFamily: plusJakartaSansFonts.medium,
    fontSize: designFontSizes.s,
    color: designColors.ground,
    opacity: 0.7,
  },
});

export function styleForLightboxAnimatedView0(
  arg0: Animated.Value,
): DynamicStyle {
  return { opacity: arg0 } as DynamicStyle;
}

export function styleForLightboxAnimatedView1(
  arg0: Animated.Value,
): DynamicStyle {
  return { transform: [{ scale: arg0 }] } as DynamicStyle;
}
