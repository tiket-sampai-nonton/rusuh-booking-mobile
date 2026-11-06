import { StyleSheet } from "react-native";
import {
  designColors,
  designBorders,
  plusJakartaSansFonts,
} from "@presentation/theme";

export const styles = StyleSheet.create({
  container: {
    width: "100%",
    minWidth: 0,
    flexShrink: 1,
    paddingVertical: 56,
    paddingHorizontal: 20,
    alignItems: "center",
    borderWidth: designBorders.standard,
    borderStyle: "dashed",
    borderColor: designColors.ink,
  },
  title: {
    maxWidth: "100%",
    color: designColors.ink,
    fontFamily: plusJakartaSansFonts.extraBold,
    fontSize: 20,
    textTransform: "uppercase",
    textAlign: "center",
  },
  description: {
    maxWidth: "100%",
    marginTop: 10,
    color: designColors.inkMuted,
    fontFamily: plusJakartaSansFonts.regular,
    fontSize: 13,
    textAlign: "center",
  },
  browseButton: {
    marginTop: 20,
    minHeight: 44,
    paddingHorizontal: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designColors.ink,
  },
  browseLabel: {
    color: designColors.ground,
    fontFamily: plusJakartaSansFonts.bold,
    fontSize: 12,
    textTransform: "uppercase",
  },
});
