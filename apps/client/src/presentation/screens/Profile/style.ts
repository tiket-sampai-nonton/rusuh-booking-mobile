import type { ViewStyle } from "react-native";
import { StyleSheet } from "react-native";
import { plusJakartaSansFonts, designColors } from "@presentation/theme";

export function profileContentContainerStyle(
  topInset: number,
  bottomInset: number,
  isMobileWeb = false,
): ViewStyle {
  return {
    paddingTop: topInset + (isMobileWeb ? 72 : 96),
    paddingHorizontal: 16,
    paddingBottom: bottomInset + (isMobileWeb ? 24 : 120),
  };
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: designColors.ground },
  heading: {
    color: designColors.ink,
    fontFamily: plusJakartaSansFonts.extraBold,
    fontSize: 32,
    textTransform: "uppercase",
  },
  mobileWebHeading: { fontSize: 28, lineHeight: 34 },
});
