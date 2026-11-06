import { StyleSheet } from "react-native";
import {
  designColors,
  designBorders,
  plusJakartaSansFonts,
} from "@presentation/theme";

import type { EdgeInsets } from "react-native-safe-area-context";
import type { DynamicStyle } from "@presentation/utils/style";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: designColors.ground,
    borderBottomWidth: designBorders.standard,
    borderBottomColor: designColors.ink,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  mobileWebContainer: { paddingHorizontal: 16, paddingVertical: 8 },
  backButton: {
    paddingVertical: 4,
  },
  backText: {
    color: designColors.ink,
    fontSize: 14,
    fontFamily: plusJakartaSansFonts.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  mobileWebBackText: { fontSize: 12 },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: designBorders.standard,
    borderColor: designColors.danger,
    backgroundColor: designColors.danger,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  mobileWebTimerBadge: {
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
  },
  timerBadgeWarning: {
    borderColor: designColors.danger,
    backgroundColor: designColors.danger,
  },
  timerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: designColors.ground,
  },
  timerDotWarning: {
    backgroundColor: designColors.ground,
  },
  timerText: {
    color: designColors.ground,
    fontSize: 16,
    fontFamily: plusJakartaSansFonts.regular,
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
  mobileWebTimerText: { fontSize: 13 },
  timerTextWarning: {
    color: designColors.ground,
  },
});

export const componentStyles = StyleSheet.create({
  elementFlexDirection0: { flexDirection: "row", alignItems: "center", gap: 6 },
});

export function styleForCheckoutTopBarView0(arg0: EdgeInsets): DynamicStyle {
  return { paddingTop: arg0.top } as DynamicStyle;
}
