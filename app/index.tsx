import { Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text accessibilityRole="header" style={{ fontSize: 20, fontWeight: "600" }}>
        Daftar Event
      </Text>
      <Text>Daftar event akan tampil di sini (FR-01..FR-03).</Text>
    </View>
  );
}
