import { Path } from "react-native-svg";

import { IconFrame } from "../IconFrame";
import type { IconProps } from "../types";

export function ExternalLinkIcon({ color, size = 16 }: IconProps) {
  return (
    <IconFrame color={color} size={size}>
      <Path d="M13 5h6v6M19 5l-9 9" />
      <Path d="M19 13v5a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h5" />
    </IconFrame>
  );
}
