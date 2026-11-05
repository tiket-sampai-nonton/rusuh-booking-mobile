import { StyleSheet } from "react-native";

import { designColors, designBorder } from "@presentation/theme";

export const paymentSummaryStyles = StyleSheet.create({
  holdBanner: {
    backgroundColor: designColors.ink,
  },
  container: {
    borderWidth: designBorder.base,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
  },
  heading: {
    color: designColors.gray,
    letterSpacing: 2,
    borderBottomWidth: designBorder.base,
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
