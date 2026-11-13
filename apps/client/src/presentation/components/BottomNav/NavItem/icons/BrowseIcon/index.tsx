import Svg, { Path } from "react-native-svg";

import { designColors } from "@presentation/theme";

import type { BottomNavIconProps } from "../../../types";

export function BrowseIcon({ active }: BottomNavIconProps) {
  const color = active ? designColors.accent : designColors.inkMuted;
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </Svg>
  );
}
