import { StyleSheet } from "react-native";
import { interFonts, designBorders, designColors } from "@presentation/theme";

export const styles = StyleSheet.create({
  card: {
    marginTop: 24,
    padding: 20,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
  },
  name: { color: designColors.ink, fontFamily: interFonts.black, fontSize: 20 },
  email: {
    marginTop: 6,
    color: designColors.inkMuted,
    fontFamily: interFonts.regular,
    fontSize: 14,
  },
  maskedNik: {
    marginTop: 6,
    color: designColors.inkMuted,
    fontFamily: interFonts.regular,
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
    fontFamily: interFonts.bold,
    fontSize: 12,
    textTransform: "uppercase",
  },
  signOutText: {
    color: designColors.ink,
    fontFamily: interFonts.bold,
    fontSize: 12,
    textTransform: "uppercase",
  },
});
