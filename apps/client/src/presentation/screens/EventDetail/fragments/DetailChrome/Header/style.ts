import { StyleSheet, type ViewStyle } from "react-native";

import { interFonts } from "@presentation/theme/fonts";
import { designColors } from "@presentation/theme/event-design-tokens";

export const detailHeaderStyles = StyleSheet.create({
  webBackContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  webBackLabel: {
    fontFamily: interFonts.semiBold,
    fontSize: 14,
    color: designColors.ink,
  },
  iconButton: {
    minWidth: 44,
    minHeight: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  iconButtonPressed: {
    backgroundColor: designColors.ink,
  },
});

export function detailHeaderPressedStyle(
  pressed: boolean,
): ViewStyle | undefined {
  return pressed ? detailHeaderStyles.iconButtonPressed : undefined;
}

export function detailHeaderIconColor(pressed: boolean): string {
  return pressed ? designColors.ground : designColors.ink;
}
