import { StyleSheet } from "react-native";
import { designBorders, designColors, interFonts } from "@presentation/theme";

export const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
  },
  eventName: {
    color: designColors.ink,
    fontFamily: interFonts.black,
    fontSize: 17,
    textTransform: "uppercase",
  },
  details: {
    marginTop: 8,
    color: designColors.inkMuted,
    fontFamily: interFonts.medium,
    fontSize: 12,
  },
  amount: {
    marginTop: 8,
    color: designColors.ink,
    fontFamily: interFonts.bold,
    fontSize: 14,
  },
  qrButton: {
    marginTop: 14,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designColors.ink,
  },
  qrLabel: {
    color: designColors.ground,
    fontFamily: interFonts.bold,
    fontSize: 12,
    textTransform: "uppercase",
  },
});
