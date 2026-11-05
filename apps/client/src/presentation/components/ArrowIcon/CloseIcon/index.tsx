import { Path } from "react-native-svg";

import { IconFrame } from "../IconFrame";
import type { IconProps } from "../types";

export function CloseIcon({ color, size = 18 }: IconProps) {
  return (
    <IconFrame color={color} size={size}>
      <Path d="m18 6-12 12M6 6l12 12" />
    </IconFrame>
  );
}
