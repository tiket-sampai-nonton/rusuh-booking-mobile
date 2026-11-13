import { Path } from "react-native-svg";

import { IconFrame } from "../IconFrame";
import type { IconProps } from "../types";

export function WarningIcon({ color, size = 18 }: IconProps) {
  return (
    <IconFrame color={color} size={size}>
      <Path d="M12 3 2.5 20h19L12 3ZM12 9v5m0 3h.01" />
    </IconFrame>
  );
}
