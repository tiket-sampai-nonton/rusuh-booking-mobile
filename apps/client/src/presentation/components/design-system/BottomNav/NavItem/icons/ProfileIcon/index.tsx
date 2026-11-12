import Svg, { Circle, Path } from "react-native-svg";

import { designColors } from "@presentation/theme";

import type { BottomNavIconProps } from "../../../types";

export function ProfileIcon({ active }: BottomNavIconProps) {
  const color = active ? designColors.accent : designColors.inkMuted;
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
        stroke={color}
        strokeWidth={2}
      />
      <Circle cx={12} cy={7} r={4} stroke={color} strokeWidth={2} />
    </Svg>
  );
}
