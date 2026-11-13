import { Path, Rect } from "react-native-svg";

import { IconFrame } from "../IconFrame";
import type { IconProps } from "../types";

export function LockIcon({ color, size = 16 }: IconProps) {
  return (
    <IconFrame color={color} size={size}>
      <Rect x={4} y={10} width={16} height={11} rx={1} />
      <Path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" />
    </IconFrame>
  );
}
