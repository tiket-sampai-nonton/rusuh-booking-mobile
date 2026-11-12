import { StyleSheet } from "react-native";

import { designColors, designBorders } from "@presentation/theme";

export const paymentSummaryStyles = StyleSheet.create({
  holdBanner: {
    backgroundColor: designColors.ink,
  },
  container: {
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
  },
  mobileWebContainer: { borderWidth: 1 },
  heading: {
    color: designColors.gray,
    letterSpacing: 2,
    borderBottomWidth: designBorders.standard,
    borderBottomColor: designColors.ink,
  },
  bookingId: {
    color: designColors.ink,
    letterSpacing: -0.5,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: designColors.field,
  },
  total: {
    color: designColors.ink,
  },
});
