import type { ViewStyle } from "react-native";
import { StyleSheet } from "react-native";
import { interFonts, designColors } from "@presentation/theme";

export function profileContentContainerStyle(
  topInset: number,
  bottomInset: number,
): ViewStyle {
  return {
    paddingTop: topInset + 96,
    paddingHorizontal: 16,
    paddingBottom: bottomInset + 120,
  };
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: designColors.ground },
  heading: {
    color: designColors.ink,
    fontFamily: interFonts.black,
    fontSize: 32,
    textTransform: "uppercase",
  },
});
