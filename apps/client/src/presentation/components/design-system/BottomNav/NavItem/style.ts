import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";

import { designColors } from "@presentation/theme";

export const navItemStyles = StyleSheet.create({
  button: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    position: "relative",
  },
  indicator: {
    position: "absolute",
    top: 0,
    left: "50%",
    marginLeft: -16,
    width: 32,
    height: 3,
    backgroundColor: designColors.ink,
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

export function navItemLabelStyle(active: boolean): TextStyle {
  return { color: active ? designColors.ink : designColors.inkMuted };
}

export function navItemBackgroundStyle(pressed: number, fieldColor: string): ViewStyle {
  "worklet";
  return { backgroundColor: pressed > 0.5 ? fieldColor : "transparent" };
}
