import { ActivityIndicator, Text, View } from "react-native";

export interface VerificationProgressProps {
  readonly isPaid: boolean;
}

export function VerificationProgress({ isPaid }: VerificationProgressProps) {
  return (
    <View
      className="items-center gap-4"
      accessibilityLiveRegion="polite"
      testID="payment-result-status"
    >
      <ActivityIndicator
        size="large"
        testID="payment-result-spinner"
        accessibilityLabel="Memproses pembayaran"
      />
      <Text
        className="text-center text-base text-foreground"
        accessibilityRole="header"
      >
        {isPaid
          ? "Pembayaran berhasil — mengalihkan…"
          : "Memverifikasi pembayaran kamu…"}
      </Text>
      <Text className="text-center text-sm text-muted-foreground">
        Jangan tutup halaman ini. Status dikonfirmasi langsung dari server.
      </Text>
    </View>
  );
}
