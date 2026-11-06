import { StyleSheet } from "react-native";
import {
  designColors,
  designBorders,
  plusJakartaSansFonts,
} from "@presentation/theme";

import type { DynamicStyle } from "@presentation/utils/style";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 32,
  },
  modal: {
    width: "100%",
    maxWidth: 400,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
    padding: 32,
  },
  title: {
    fontSize: 20,
    fontFamily: plusJakartaSansFonts.extraBold,
    textTransform: "uppercase",
    letterSpacing: -0.4,
    color: designColors.ink,
    textAlign: "center",
    marginBottom: 16,
  },
  body: {
    fontSize: 14,
    fontFamily: plusJakartaSansFonts.regular,
    lineHeight: 22,
    color: designColors.gray,
    textAlign: "center",
    marginBottom: 32,
  },
  actions: {
    flexDirection: "row",
    gap: 16,
  },
  stayButton: {
    flex: 1,
    paddingVertical: 16,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: designColors.ink,
    alignItems: "center",
  },
  stayButtonText: {
    fontSize: 12,
    fontFamily: plusJakartaSansFonts.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: designColors.ground,
  },
  leaveButton: {
    flex: 1,
    paddingVertical: 16,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
    alignItems: "center",
  },
  leaveButtonText: {
    fontSize: 12,
    fontFamily: plusJakartaSansFonts.bold,
    textTransform: "uppercase",
    letterSpacing: 1,
    color: designColors.ink,
  },
});

export function styleForLeaveConfirmPressable0(): DynamicStyle {
  return { justifyContent: "flex-end", padding: 0 } as DynamicStyle;
}

export function styleForLeaveConfirmPressable1(): DynamicStyle {
  return { maxWidth: "100%", borderBottomWidth: 0 } as DynamicStyle;
}
