import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function WaitingRoomScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>Ruang tunggu event {eventId}. Posisi dari Status Document, dihitung di klien.</Text>
    </View>
  );
}
