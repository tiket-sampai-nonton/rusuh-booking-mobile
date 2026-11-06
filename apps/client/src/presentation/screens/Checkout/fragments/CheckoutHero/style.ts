import { StyleSheet } from "react-native";
import { designColors, designBorders, interFonts } from "@presentation/theme";

export const styles = StyleSheet.create({
  container: {
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
    overflow: "hidden",
  },
  imageContainer: {
    height: 180,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
    // Note: grayscale filter is web-only; RN needs react-native-image-filter-kit
  },
  info: {
    padding: 24,
    borderTopWidth: designBorders.standard,
    borderTopColor: designColors.ink,
  },
  title: {
    color: designColors.ink,
    fontSize: 20,
    fontFamily: interFonts.black,
    textTransform: "uppercase",
    letterSpacing: -0.4,
  },
  subtitle: {
    color: designColors.gray,
    fontSize: 14,
    fontFamily: interFonts.regular,
    marginTop: 8,
    lineHeight: 22,
  },
});
