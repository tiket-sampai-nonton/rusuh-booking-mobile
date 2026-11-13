import { Circle, Path } from "react-native-svg";

import { IconFrame } from "../IconFrame";
import type { IconProps } from "../types";

export function ClockIcon({ color, size = 16 }: IconProps) {
  return (
    <IconFrame color={color} size={size}>
      <Circle cx={12} cy={12} r={9} />
      <Path d="M12 7v5l3 2" />
    </IconFrame>
  );
}
