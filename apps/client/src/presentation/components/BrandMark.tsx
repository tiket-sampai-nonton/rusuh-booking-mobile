/**
 * BrandMark — the prototype's logo: an ember→red gradient rounded square with a
 * ▶ glyph, next to the "Rusuh Tiket" wordmark. Matches the `.brand .mk` in every
 * prototype page's nav.
 */
import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";

import { brand } from "@presentation/theme";

export interface BrandMarkProps {
  /** Wordmark color (defaults to ink for light surfaces). */
  readonly color?: string;
  readonly testID?: string;
}

export function BrandMark({ color = "#0a0a0c", testID }: BrandMarkProps) {
  return (
    <View className="flex-row items-center gap-2" testID={testID}>
      <LinearGradient
        colors={[brand.ember, brand.red]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ width: 24, height: 24, borderRadius: 7, alignItems: "center", justifyContent: "center" }}
      >
        <Text style={{ color: "#fff", fontSize: 12 }} accessibilityElementsHidden>
          ▶
        </Text>
      </LinearGradient>
      <Text className="text-md font-extrabold" style={{ color }}>
        Rusuh Tiket
      </Text>
    </View>
  );
}
