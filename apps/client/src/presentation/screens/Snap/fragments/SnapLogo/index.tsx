/** Centered SNAP identity from prototype 08a-snap.html `.snap-header`. */
import { Text, View } from "react-native";
import { componentStyles } from "./style";

export function SnapLogo() {
  return (
    <View style={componentStyles.elementAlignItems0}>
      <Text accessibilityRole="header" style={componentStyles.elementColor1}>
        SNAP
      </Text>
      <Text style={componentStyles.elementColor2}>Gerbang Pembayaran Aman</Text>
    </View>
  );
}
