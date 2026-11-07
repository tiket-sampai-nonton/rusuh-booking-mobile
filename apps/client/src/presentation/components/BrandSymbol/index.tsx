import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { brand, neutral } from "@presentation/theme";

interface BrandSymbolProps {
  readonly size?: number;
  readonly testID?: string;
}

const ticketPath =
  "M8 6h24a3 3 0 0 1 3 3v6.8c-2.4 1.1-4 2.4-4 4.2s1.6 3.1 4 4.2V31a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3v-6.8c2.4-1.1 4-2.4 4-4.2s-1.6-3.1-4-4.2V9a3 3 0 0 1 3-3Z";
const boltPath = "m20.7 9.2-5.9 11.6h4.4l-1.3 10 8.7-13.1h-4.9l1.9-8.5z";

/** The app's ticket-and-lightning symbol, used in the wordmark and splash. */
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
        colors={[brand.deep, brand.primary, brand.ember]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <Svg width={symbolSize} height={symbolSize} viewBox="0 0 40 40">
        <Path
          d={ticketPath}
          fill={neutral.paper}
          stroke={brand.ember}
          strokeLinejoin="round"
          strokeWidth={0.7}
        />
        <Path
          d="M27 10v20"
          fill="none"
          stroke={brand.deep}
          strokeDasharray="1 1"
          strokeLinecap="round"
          strokeWidth={1.2}
        />
        <Path
          d={boltPath}
          fill={brand.ember}
          stroke={brand.deep}
          strokeWidth={0.35}
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
