import { StyleSheet, type ViewStyle } from "react-native";

import {
  designColors,
  designZIndex,
  plusJakartaSansFonts,
} from "@presentation/theme";

export const toastStyles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: 120,
    left: 24,
    right: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    zIndex: designZIndex.toast,
    alignItems: "center",
  },
  message: {
    color: designColors.ground,
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    fontFamily: plusJakartaSansFonts.medium,
  },
});

export function toastBackgroundStyle(color: string): ViewStyle {
  return { backgroundColor: color };
}
