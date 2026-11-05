import Svg, { Path } from "react-native-svg";

import { designColors } from "@presentation/theme";

export function FilterIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={designColors.ink} strokeWidth={2}>
      <Path d="M4 6h16M7 12h10m-7 6h4" />
    </Svg>
  );
}
