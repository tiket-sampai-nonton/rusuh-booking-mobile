import { Pressable, Text, View } from "react-native";

import { DetailBackground, Header } from "../../DetailChrome";
import { designDetailStyles as styles } from "../../../style";
import { apiErrorMessage } from "@presentation/utils/api-error-message";

import { detailErrorStyles } from "./style";

export interface DetailErrorProps {
  readonly error?: unknown;
  readonly onBack: () => void;
  readonly onRetry: () => void;
  readonly isRetrying?: boolean;
}

export function DetailError({
  error,
  onBack,
  onRetry,
  isRetrying = false,
}: DetailErrorProps) {
  return (
    <DetailBackground testID="detail-error">
      <Header onBack={onBack} />
      <View style={styles.errorContainer} accessibilityLiveRegion="polite">
        <Text style={styles.errorText} accessibilityRole="header">
          Gagal memuat event
        </Text>
        <Text style={[styles.description, detailErrorStyles.description]}>
          {apiErrorMessage(error)}
        </Text>
        <Pressable
          style={styles.floatingCtaBtn}
          onPress={onRetry}
          accessibilityRole="button"
          accessibilityLabel="Coba muat event lagi"
          accessibilityState={{ disabled: isRetrying }}
          disabled={isRetrying}
          testID="event-detail-retry"
        >
          <Text style={styles.floatingCtaBtnText}>
            {isRetrying ? "Memuat…" : "Coba Lagi"}
          </Text>
        </Pressable>
        <Pressable
          style={styles.floatingCtaBtn}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke beranda"
        >
          <Text style={styles.floatingCtaBtnText}>Kembali</Text>
        </Pressable>
      </View>
    </DetailBackground>
  );
}
