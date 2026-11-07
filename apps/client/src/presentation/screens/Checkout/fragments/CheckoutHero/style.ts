import { StyleSheet } from "react-native";
import {
  designColors,
  designBorders,
  plusJakartaSansFonts,
} from "@presentation/theme";

export const styles = StyleSheet.create({
  container: {
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
    overflow: "hidden",
  },
  compactContainer: { flexDirection: "row", alignItems: "stretch" },
  imageContainer: {
    height: 180,
    overflow: "hidden",
  },
  compactImageContainer: { width: 82, height: 80, flexShrink: 0 },
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
  compactInfo: {
    flex: 1,
    justifyContent: "center",
    padding: 12,
    borderTopWidth: 0,
  },
  title: {
    color: designColors.ink,
    fontSize: 20,
    fontFamily: plusJakartaSansFonts.extraBold,
    textTransform: "uppercase",
    letterSpacing: -0.4,
  },
  compactTitle: { fontSize: 15, letterSpacing: -0.3 },
  subtitle: {
    color: designColors.gray,
    fontSize: 14,
    fontFamily: plusJakartaSansFonts.regular,
    marginTop: 8,
    lineHeight: 22,
  },
  compactSubtitle: { fontSize: 12, lineHeight: 17, marginTop: 4 },
});
