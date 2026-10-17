import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

export default function TicketDetailScreen() {
  const { eventId } = useLocalSearchParams<{ eventId: string }>();
  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text>Detail tiket event {eventId}. Kategori, NIK, countdown dari server.</Text>
    </View>
  );
}
