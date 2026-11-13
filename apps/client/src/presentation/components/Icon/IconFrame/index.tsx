import type { ReactNode } from "react";
import Svg from "react-native-svg";

import { designColors } from "@presentation/theme";

interface IconFrameProps {
  readonly children: ReactNode;
  readonly color?: string;
  readonly size?: number;
  readonly strokeWidth?: number;
}

export function IconFrame({
  children,
  color = designColors.ink,
  size = 16,
  strokeWidth = 2,
}: IconFrameProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </Svg>
  );
}
