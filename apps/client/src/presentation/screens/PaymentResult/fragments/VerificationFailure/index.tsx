import { Pressable, Text, View } from "react-native";
import { styles } from "./style";

export interface VerificationFailureProps {
  readonly missingAttemptId: boolean;
  readonly onReturn: () => void;
}

export function VerificationFailure({
  missingAttemptId,
  onReturn,
}: VerificationFailureProps) {
  return (
    <View className="items-center gap-5">
      <Text
        className="text-center text-base text-destructive"
        testID="payment-result-error"
        accessibilityRole="alert"
      >
        {missingAttemptId
          ? "ID percobaan pembayaran tidak tersedia. Kembali ke pembayaran untuk memeriksa status terbaru."
          : "Gagal memeriksa status pembayaran. Kembali ke halaman pembayaran untuk mencoba lagi."}
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={onReturn}
        style={styles.returnButton}
        testID="payment-result-return"
      >
        <Text style={styles.returnText}>Kembali ke pembayaran</Text>
      </Pressable>
    </View>
  );
}
