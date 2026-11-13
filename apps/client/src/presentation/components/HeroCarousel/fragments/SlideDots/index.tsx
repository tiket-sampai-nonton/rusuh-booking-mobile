import { View } from "react-native";

import { componentStyles } from "../../style";
import { NavDot } from "../NavDot";

export function SlideDots({
  count,
  current,
  onSelect,
}: {
  readonly count: number;
  readonly current: number;
  readonly onSelect: (index: number) => void;
}) {
  return (
    <View style={componentStyles.elementPosition30} accessibilityRole="tablist">
      {Array.from({ length: count }, (_, i) => (
        <NavDot
          key={i}
          index={i}
          isActive={i === current}
          onPress={() => onSelect(i)}
        />
      ))}
    </View>
  );
}
