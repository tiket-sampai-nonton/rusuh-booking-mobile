import { useState } from "react";
import { Pressable, type StyleProp, type ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

import { designColors } from "@presentation/theme/event-design-tokens";
import { getNavButtonStyles } from "./style";
import type { LightboxNavButtonKind } from "./style";
export type { LightboxNavButtonKind } from "./style";

interface NavButtonProps {
  readonly kind: LightboxNavButtonKind;
  readonly onPress: () => void;
  readonly style?: StyleProp<ViewStyle>;
  readonly accessibilityLabel: string;
}

export { getNavButtonStyles };

const ICON_PATHS: Readonly<Record<LightboxNavButtonKind, string>> = {
  close: "m18 6-12 12M6 6l12 12",
  previous: "m15 18-6-6 6-6",
  next: "m9 18 6-6-6-6",
};

export function NavButton({
  kind,
  onPress,
  style,
  accessibilityLabel,
}: NavButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);

  return (
    <Pressable
      style={getNavButtonStyles({ kind, style, hovered, pressed })}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Svg
        width={22}
        height={22}
        viewBox="0 0 24 24"
        fill="none"
        stroke={hovered ? designColors.ink : designColors.ground}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Path d={ICON_PATHS[kind]} />
      </Svg>
    </Pressable>
  );
}
