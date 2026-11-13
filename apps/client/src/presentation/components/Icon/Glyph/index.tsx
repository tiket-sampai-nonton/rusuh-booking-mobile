import { Path } from "react-native-svg";

import { IconFrame } from "../IconFrame";
import type { ArrowDirection, IconProps } from "../types";

interface DirectionalIconProps extends IconProps {
  readonly direction?: ArrowDirection;
}

const ARROW_PATH: Readonly<Record<ArrowDirection, string>> = {
  left: "M19 12H5m6 6-6-6 6-6",
  download: "M12 3v12m0 0 5-5m-5 5-5-5M5 20h14",
  right: "M5 12h14m-6-6 6 6-6 6",
};

export function Icon({
  direction = "right",
  color,
  size = 16,
}: DirectionalIconProps) {
  return (
    <IconFrame color={color} size={size}>
      <Path d={ARROW_PATH[direction]} />
    </IconFrame>
  );
}
