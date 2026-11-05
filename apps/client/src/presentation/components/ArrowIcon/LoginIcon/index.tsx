import { Path } from "react-native-svg";

import { IconFrame } from "../IconFrame";
import type { IconProps } from "../types";

export function LoginIcon({ color, size = 20 }: IconProps) {
  return (
    <IconFrame color={color} size={size}>
      <Path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <Path d="M10 17l5-5-5-5M15 12H3" />
    </IconFrame>
  );
}
