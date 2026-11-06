import { StyleSheet } from "react-native";
import {
  designBorders,
  designColors,
  plusJakartaSansFonts,
} from "@presentation/theme";

export const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
  },
  eventName: {
    color: designColors.ink,
    fontFamily: plusJakartaSansFonts.extraBold,
    fontSize: 17,
    textTransform: "uppercase",
  },
  details: {
    marginTop: 8,
    color: designColors.inkMuted,
    fontFamily: plusJakartaSansFonts.medium,
    fontSize: 12,
  },
  amount: {
    marginTop: 8,
    color: designColors.ink,
    fontFamily: plusJakartaSansFonts.bold,
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
    fontFamily: plusJakartaSansFonts.bold,
    fontSize: 12,
    textTransform: "uppercase",
  },
});
