/** V2 brutalist SNAP gateway logo mark + wordmark (prototype 08a-snap.html `.snap-header`). */
import { Text, View } from "react-native";

import { v2 } from "@presentation/theme";

import { snapStyles } from "../style";

export function SnapLogo() {
  return (
    <View className="flex-row items-center justify-center gap-3">
      <View style={snapStyles.logoMark} className="items-center justify-center">
        <Text style={snapStyles.logoArrow} accessibilityElementsHidden>
          ↗
        </Text>
      </View>
      <Text
        className="text-base font-bold uppercase"
        style={{ color: v2.ink, letterSpacing: 1.5 }}
      >
        SNAP Payment
      </Text>
    </View>
  );
}
