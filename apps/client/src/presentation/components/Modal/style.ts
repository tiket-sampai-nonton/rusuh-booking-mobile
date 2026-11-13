import { StyleSheet } from "react-native";
import {
  designColors,
  designBorders,
  designModal,
  plusJakartaSansFonts,
  withAlpha,
} from "@presentation/theme";

import type { DynamicStyle } from "@presentation/utils/style";

export const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: withAlpha(designColors.overlay, 0.8),
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    // Note: backdropFilter blur not available in RN, handled by semi-transparent bg
  },
  cardWrapper: {
    width: "100%",
    maxWidth: designModal.maxWidth,
  },
  card: {
    backgroundColor: designColors.ground,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    padding: designModal.padding,
  },
  title: {
    color: designColors.ink,
    fontSize: 20,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: -0.02 * 20, // --tracking-tight
    marginBottom: 12,
    fontFamily: plusJakartaSansFonts.bold,
  },
});

export function styleForModalPressable0(): DynamicStyle {
  return { justifyContent: "flex-end", padding: 0 } as DynamicStyle;
}

export function styleForModalPressable1(): DynamicStyle {
  return { maxWidth: "100%" } as DynamicStyle;
}

export function styleForModalAnimatedView2(): DynamicStyle {
  return { padding: 24, borderBottomWidth: 0 } as DynamicStyle;
}
