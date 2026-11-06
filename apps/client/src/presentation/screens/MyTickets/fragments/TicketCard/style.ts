import { StyleSheet } from "react-native";
import { designColors, designBorders, interFonts } from "@presentation/theme";
import { hardShadowStyle } from "@presentation/utils/style";

export const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
    ...hardShadowStyle(4, 4, designColors.ink, 4),
  },
  past: { opacity: 0.58 },
  image: { width: "100%", height: 132 },
  content: { padding: 16 },
  heading: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  eventName: {
    flex: 1,
    color: designColors.ink,
    fontFamily: interFonts.black,
    fontSize: 18,
    textTransform: "uppercase",
  },
  status: {
    fontFamily: interFonts.bold,
    fontSize: 11,
    textTransform: "uppercase",
  },
  statusPast: { color: designColors.inkMuted },
  statusUpcoming: { color: designColors.success },
  dateVenue: {
    marginTop: 8,
    color: designColors.inkMuted,
    fontFamily: interFonts.medium,
    fontSize: 12,
  },
  details: {
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: designColors.ink,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  ticketLabel: {
    color: designColors.inkMuted,
    fontFamily: interFonts.regular,
    fontSize: 11,
    textTransform: "uppercase",
  },
  ticketCount: {
    color: designColors.ink,
    fontFamily: interFonts.bold,
    fontSize: 13,
  },
  amount: {
    color: designColors.ink,
    fontFamily: interFonts.bold,
    fontSize: 13,
  },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 16 },
  qrButton: {
    width: "100%",
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designColors.ink,
  },
  qrButtonDisabled: { backgroundColor: designColors.inkMuted },
  downloadButton: {
    flex: 1,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designColors.ink,
  },
  shareButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
  },
  primaryActionText: {
    color: designColors.ground,
    fontFamily: interFonts.bold,
    fontSize: 12,
    textTransform: "uppercase",
  },
  secondaryActionText: {
    color: designColors.ink,
    fontFamily: interFonts.bold,
    fontSize: 12,
    textTransform: "uppercase",
  },
});
