import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { brandMark, neutral } from "@presentation/theme";

interface BrandSymbolProps {
  readonly size?: number;
  readonly testID?: string;
}

const ticketPath =
  "M8 6h24a3 3 0 0 1 3 3v6.8c-2.4 1.1-4 2.4-4 4.2s1.6 3.1 4 4.2V31a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-6.8c2.4-1.1 4-2.4 4-4.2s-1.6-3.1-4-4.2V9a3 3 0 0 1 3-3Z";
const ticketGradient = [
  brandMark.primary,
  brandMark.deep,
  neutral.darkBackground,
] as const;

/** Red-to-black ticket symbol used in the wordmark and splash. */
export function BrandSymbol({ size = 36, testID }: BrandSymbolProps) {
  const symbolSize = size * 0.78;

  return (
    <View
      accessibilityElementsHidden
      style={[
        styles.frame,
        { width: size, height: size, borderRadius: size * 0.25 },
      ]}
      testID={testID}
    >
      <LinearGradient
        colors={ticketGradient}
        locations={[0, 0.48, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Svg width={symbolSize} height={symbolSize} viewBox="0 0 40 40">
        <Path
          d={ticketPath}
          fill="#FFFFFF"
          stroke="#F3F0F0"
          strokeLinejoin="round"
          strokeWidth={0.7}
        />
        <Path
          d="M27 10v20"
          fill="none"
          stroke={brandMark.primary}
          strokeDasharray="1 1"
          strokeLinecap="round"
          strokeWidth={1.2}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});
