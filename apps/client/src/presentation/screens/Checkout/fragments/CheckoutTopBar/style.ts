import { StyleSheet } from "react-native";
import {
  designColors,
  designBorders,
  interFonts,
  waitingRoomFont,
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
  backButton: {
    paddingVertical: 4,
  },
  backText: {
    color: designColors.ink,
    fontSize: 14,
    fontFamily: interFonts.bold,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  timerBadgeWarning: {
    borderColor: "#ff0000",
    backgroundColor: "#ff0000",
  },
  timerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: designColors.ink,
  },
  timerDotWarning: {
    backgroundColor: designColors.ground,
  },
  timerText: {
    color: designColors.ink,
    fontSize: 16,
    fontFamily: waitingRoomFont,
    fontWeight: "900",
    fontVariant: ["tabular-nums"],
  },
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
