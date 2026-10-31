/** SNAP gateway logo mark + wordmark (prototype snap.html `.logo`). */
import { Text, View } from "react-native";

import { snapStyles } from "../style";

export function SnapLogo() {
  return (
    <View className="flex-row items-center gap-2.25">
      <View style={snapStyles.logoMark} className="items-center justify-center">
        <Text style={snapStyles.logoArrow} accessibilityElementsHidden>↗</Text>
      </View>
      <Text className="text-lg font-extrabold text-foreground">SNAP Payment</Text>
    </View>
  );
}
