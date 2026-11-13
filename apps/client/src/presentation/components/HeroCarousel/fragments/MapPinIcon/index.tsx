import Svg, { Circle, Path } from "react-native-svg";

import { designColors } from "@presentation/theme";

import { ICON_SIZE } from "../../constants";

export function MapPinIcon({
  color = designColors.ink,
}: {
  readonly color?: string;
}) {
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"
        stroke={color}
        strokeWidth={2}
      />
      <Circle cx={12} cy={10} r={3} stroke={color} strokeWidth={2} />
    </Svg>
  );
}
