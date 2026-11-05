import { StyleSheet } from "react-native";

import { designColors, designSpacingSemantic } from "@presentation/theme/event-design-tokens";

import type { StyleProp, ViewStyle } from "react-native";

export const lightboxNavButtonStyles = StyleSheet.create({
  button: {
    position: "absolute",
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: designColors.ground,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  hover: {
    backgroundColor: designColors.ground,
  },
  pressed: {
    opacity: 0.75,
  },
  close: {
    top: designSpacingSemantic.m,
    right: designSpacingSemantic.m,
  },
  closeHover: {
    transform: [{ rotate: "90deg" }],
  },
  navigation: {
    top: "50%",
    marginTop: -25,
  },
  previous: {
    left: designSpacingSemantic.m,
  },
  next: {
    right: designSpacingSemantic.m,
  },
});

export interface NavButtonStyleOptions {
  readonly kind: LightboxNavButtonKind;
  readonly style?: StyleProp<ViewStyle>;
  readonly hovered: boolean;
  readonly pressed: boolean;
}

export type LightboxNavButtonKind = "close" | "previous" | "next";

export function getNavButtonStyles({
  kind,
  style,
  hovered,
  pressed,
}: NavButtonStyleOptions): StyleProp<ViewStyle>[] {
  return [
    lightboxNavButtonStyles.button,
    style,
    hovered ? lightboxNavButtonStyles.hover : null,
    hovered && kind === "close" ? lightboxNavButtonStyles.closeHover : null,
    pressed ? lightboxNavButtonStyles.pressed : null,
  ];
}
