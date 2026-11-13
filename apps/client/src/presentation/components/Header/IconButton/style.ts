import { StyleSheet, type PlatformOSType, type ViewStyle } from "react-native";

import { designBorders, designColors, designLayout } from "@presentation/theme";

export const headerIconButtonStyles = StyleSheet.create({
  button: {
    width: designLayout.tapTarget,
    height: designLayout.tapTarget,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
  },
});

export function iconButtonShadowStyle(
  pressed: number,
  platform: PlatformOSType,
  shadowColor: string,
): ViewStyle {
  "worklet";
  const offset = 2 - pressed * 2;
  if (platform === "web") {
    return {
      boxShadow: `${offset}px ${offset}px 0 ${shadowColor}`,
    } as unknown as ViewStyle;
  }
  return { elevation: pressed > 0.5 ? 0 : 2 };
}

export function iconButtonBackgroundColor(
  pressed: number,
  inkColor: string,
  groundColor: string,
): string {
  "worklet";
  return pressed > 0.5 ? inkColor : groundColor;
}

export function iconButtonForegroundColor(pressed: number): string {
  return pressed > 0.5 ? designColors.ground : designColors.ink;
}
