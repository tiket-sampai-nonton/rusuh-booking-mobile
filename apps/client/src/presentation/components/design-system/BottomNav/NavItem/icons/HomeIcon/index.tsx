import Svg, { Path, Polyline } from "react-native-svg";

import { designColors } from "@presentation/theme";

import type { BottomNavIconProps } from "../../../types";

export function HomeIcon({ active }: BottomNavIconProps) {
  const color = active ? designColors.ink : designColors.inkMuted;
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"
        stroke={color}
        strokeWidth={2}
      />
      <Polyline points="9 22 9 12 15 12 15 22" stroke={color} strokeWidth={2} />
    </Svg>
  );
}
