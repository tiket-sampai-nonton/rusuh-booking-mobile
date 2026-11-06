import Svg, { Path } from "react-native-svg";

import { designColors } from "@presentation/theme";

export function ListIcon({ active }: { readonly active: boolean }) {
  const color = active ? designColors.ground : designColors.ink;
  return (
    <Svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
    >
      <Path d="M4 5h16M4 12h16M4 19h16" />
    </Svg>
  );
}
