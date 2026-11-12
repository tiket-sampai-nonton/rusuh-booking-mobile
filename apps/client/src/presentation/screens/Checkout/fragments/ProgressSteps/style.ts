import { StyleSheet } from "react-native";
import {
  designColors,
  designBorders,
  plusJakartaSansFonts,
} from "@presentation/theme";

import type { DynamicStyle } from "@presentation/utils/style";

export const componentStyles = StyleSheet.create({
  elementBackgroundColor0: {
    backgroundColor: designColors.ground,
    borderBottomWidth: designBorders.standard,
    borderBottomColor: designColors.ink,
    paddingVertical: 16,
  },
  elementMaxWidth1: {
    maxWidth: 800,
    marginHorizontal: "auto",
    paddingHorizontal: 32,
    width: "100%",
  },
  elementFlexDirection2: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    position: "relative",
  },
  elementPosition3: {
    position: "absolute",
    top: 20, // Half of step circle height (40/2)
    left: "10%",
    right: "10%",
    height: 2,
    backgroundColor: designColors.field,
    zIndex: 1,
  },
  elementAlignItems4: {
    alignItems: "center",
    gap: 8,
    zIndex: 3,
  },
  mobileWebContainer: { paddingVertical: 8 },
  mobileWebMaxWidth: { paddingHorizontal: 16 },
  mobileWebLabel: { fontSize: 9, letterSpacing: 0.3 },
});

export function styleForProgressStepsAnimatedView2(): DynamicStyle {
  return {
    position: "absolute",
    top: 20,
    left: "10%",
    height: 2,
    backgroundColor: designColors.accent,
    zIndex: 2,
  } as DynamicStyle;
}

export function styleForProgressStepsText3(
  arg0: boolean,
  arg1: boolean,
): DynamicStyle {
  let color = designColors.gray;
  if (arg0) color = designColors.accent;
  else if (arg1) color = designColors.ink;
  return {
    fontSize: 12,
    fontFamily: plusJakartaSansFonts.medium,
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color,
  } as DynamicStyle;
}
