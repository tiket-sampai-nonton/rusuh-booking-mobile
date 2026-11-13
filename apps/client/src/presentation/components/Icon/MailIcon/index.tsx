import { Path, Rect } from "react-native-svg";

import { IconFrame } from "../IconFrame";
import type { IconProps } from "../types";

export function MailIcon({ color, size = 16 }: IconProps) {
  return (
    <IconFrame color={color} size={size}>
      <Rect x={3} y={5} width={18} height={14} rx={2} />
      <Path d="m3 7 9 6 9-6" />
    </IconFrame>
  );
}
