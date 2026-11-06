import { StyleSheet } from "react-native";
import {
  plusJakartaSansFonts,
  designBorders,
  designColors,
} from "@presentation/theme";

export const styles = StyleSheet.create({
  form: { marginTop: 20, gap: 12 },
  input: {
    minHeight: 48,
    paddingHorizontal: 12,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    color: designColors.ink,
    fontFamily: plusJakartaSansFonts.regular,
  },
  error: { color: "#b00020", fontSize: 13 },
  button: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designColors.ink,
  },
  disabledButton: { opacity: 0.5 },
  buttonText: {
    color: designColors.ground,
    fontFamily: plusJakartaSansFonts.bold,
    fontSize: 12,
    textTransform: "uppercase",
  },
  cancelButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
  },
  cancelText: {
    color: designColors.ink,
    fontFamily: plusJakartaSansFonts.bold,
    fontSize: 12,
    textTransform: "uppercase",
  },
});
