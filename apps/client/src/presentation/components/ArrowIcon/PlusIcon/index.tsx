import { Path } from "react-native-svg";

import { IconFrame } from "../IconFrame";
import type { IconProps } from "../types";

export function PlusIcon({ color, size = 16 }: IconProps) {
  return (
    <IconFrame color={color} size={size} strokeWidth={2}>
      <Path d="M12 5v14M5 12h14" />
    </IconFrame>
  );
}
