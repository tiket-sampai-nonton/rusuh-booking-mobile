import { StyleSheet } from "react-native";
import {
  plusJakartaSansFonts,
  designBorders,
  designColors,
} from "@presentation/theme";

export const styles = StyleSheet.create({
  card: {
    marginTop: 24,
    padding: 20,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
  },
  name: {
    color: designColors.ink,
    fontFamily: plusJakartaSansFonts.extraBold,
    fontSize: 20,
  },
  email: {
    marginTop: 6,
    color: designColors.inkMuted,
    fontFamily: plusJakartaSansFonts.regular,
    fontSize: 14,
  },
  maskedNik: {
    marginTop: 6,
    color: designColors.inkMuted,
    fontFamily: plusJakartaSansFonts.regular,
    fontSize: 13,
  },
  button: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: { marginTop: 20, backgroundColor: designColors.ink },
  signOutButton: {
    marginTop: 12,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
  },
  buttonText: {
    color: designColors.ground,
    fontFamily: plusJakartaSansFonts.bold,
    fontSize: 12,
    textTransform: "uppercase",
  },
  signOutText: {
    color: designColors.ink,
    fontFamily: plusJakartaSansFonts.bold,
    fontSize: 12,
    textTransform: "uppercase",
  },
});
