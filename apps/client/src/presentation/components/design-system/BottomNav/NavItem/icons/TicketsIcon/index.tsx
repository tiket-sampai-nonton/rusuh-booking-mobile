import Svg, { Path } from "react-native-svg";

import { designColors } from "@presentation/theme";

import type { BottomNavIconProps } from "../../../types";

export function TicketsIcon({ active }: BottomNavIconProps) {
  const color = active ? designColors.ink : designColors.inkMuted;
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path d="M2 9a3 3 0 0 1 0 6v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a3 3 0 0 1 0-6V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v5z" stroke={color} strokeWidth={2} />
      <Path d="M9 2v20" stroke={color} strokeWidth={2} strokeDasharray={[2, 2]} strokeLinecap="round" />
    </Svg>
  );
}
