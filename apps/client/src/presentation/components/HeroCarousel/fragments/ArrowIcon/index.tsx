import Svg, { Path } from "react-native-svg";

import { designColors } from "@presentation/theme";

export function ArrowIcon({
  color = designColors.ground,
}: {
  readonly color?: string;
}) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path d="M5 12h14M12 5l7 7-7 7" stroke={color} strokeWidth={2.5} />
    </Svg>
  );
}
