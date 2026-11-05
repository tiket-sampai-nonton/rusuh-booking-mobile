import { Path } from "react-native-svg";

import { IconFrame } from "../IconFrame";
import type { IconProps } from "../types";

export function CheckIcon({ color, size = 16 }: IconProps) {
  return (
    <IconFrame color={color} size={size} strokeWidth={3}>
      <Path d="m5 12 4 4L19 6" />
    </IconFrame>
  );
}
