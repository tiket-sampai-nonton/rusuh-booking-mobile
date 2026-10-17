import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Rusuh Booking Tiket" }} />
      <Stack.Screen name="waiting-room/[eventId]" options={{ title: "Ruang Tunggu" }} />
      <Stack.Screen name="events/[eventId]" options={{ title: "Detail Tiket" }} />
      <Stack.Screen name="pay/[bookingId]" options={{ title: "Pembayaran", gestureEnabled: false }} />
    </Stack>
  );
}
