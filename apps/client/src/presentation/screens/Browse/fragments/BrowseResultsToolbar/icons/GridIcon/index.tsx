import Svg, { Path } from "react-native-svg";

import { designColors } from "@presentation/theme";

export function GridIcon({ active }: { readonly active: boolean }) {
  const color = active ? designColors.ground : designColors.ink;
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2}>
      <Path d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" />
    </Svg>
  );
}
