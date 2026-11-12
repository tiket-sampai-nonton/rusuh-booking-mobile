/** Compact app wordmark with the red-to-black ticket mark. */
import { Text, View, type StyleProp, type ViewStyle } from "react-native";

import { neutral } from "@presentation/theme";
import { BrandSymbol } from "../BrandSymbol";
import { styleForBrandMarkText0 } from "./style";

export interface BrandMarkProps {
  /** Wordmark color (defaults to ink for light surfaces). */
  readonly color?: string;
  readonly size?: number;
  readonly style?: StyleProp<ViewStyle>;
  readonly testID?: string;
}

export function BrandMark({
  color = neutral.ink,
  size = 36,
  style,
  testID,
}: BrandMarkProps) {
  return (
    <View className="flex-row items-center gap-2" style={style} testID={testID}>
      <BrandSymbol size={size} />
      <Text
        className="text-md font-extrabold"
        style={styleForBrandMarkText0(color)}
      >
        Rusuh Tiket
      </Text>
    </View>
  );
}
