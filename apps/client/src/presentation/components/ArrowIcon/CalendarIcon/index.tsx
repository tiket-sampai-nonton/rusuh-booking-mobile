import { Path, Rect } from "react-native-svg";

import { IconFrame } from "../IconFrame";
import type { IconProps } from "../types";

export function CalendarIcon({ color, size = 16 }: IconProps) {
  return (
    <IconFrame color={color} size={size}>
      <Rect x={3} y={5} width={18} height={16} rx={2} />
      <Path d="M16 3v4M8 3v4M3 10h18" />
    </IconFrame>
  );
}
