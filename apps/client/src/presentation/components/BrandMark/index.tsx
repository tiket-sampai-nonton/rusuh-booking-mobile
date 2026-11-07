/**
 * BrandMark — the prototype's logo: an ember→red gradient rounded square with a
 * vector play mark, next to the "Rusuh Tiket" wordmark. Matches the `.brand .mk` in every
 * prototype page's nav.
 */
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { brand, neutral } from "@presentation/theme";
import { componentStyles } from "./style";
import { styleForBrandMarkText0 } from "./style";

export interface BrandMarkProps {
  /** Wordmark color (defaults to ink for light surfaces). */
  readonly color?: string;
  readonly testID?: string;
}

export function BrandMark({ color = neutral.ink, testID }: BrandMarkProps) {
  return (
    <View className="flex-row items-center gap-2" testID={testID}>
      <LinearGradient
        colors={[brand.ember, brand.red]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={componentStyles.elementWidth0}
      >
        <Svg
          width={12}
          height={12}
          viewBox="0 0 24 24"
          accessibilityElementsHidden
        >
          <Path d="M8 5v14l11-7L8 5Z" fill={neutral.card} />
        </Svg>
      </LinearGradient>
      <Text
        className="text-md font-extrabold"
        style={styleForBrandMarkText0(color)}
      >
        Rusuh Tiket
      </Text>
    </View>
  );
}
