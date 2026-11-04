/** Centered SNAP identity from prototype 08a-snap.html `.snap-header`. */
import { Text, View } from "react-native";

import { v2, v2Border } from "@presentation/theme";

export function SnapLogo() {
  return (
    <View style={{ alignItems: "center", paddingBottom: 24, borderBottomWidth: v2Border.base, borderBottomColor: v2.ink }}>
      <Text
        accessibilityRole="header"
        style={{ color: v2.ink, fontSize: 32, fontWeight: "900", letterSpacing: -0.64, marginBottom: 4 }}
      >
        SNAP
      </Text>
      <Text style={{ color: v2.gray, fontSize: 14 }}>Gerbang Pembayaran Aman</Text>
    </View>
  );
}
