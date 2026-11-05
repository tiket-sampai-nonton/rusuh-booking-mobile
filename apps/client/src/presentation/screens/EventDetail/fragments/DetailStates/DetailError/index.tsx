import { Pressable, Text, View } from "react-native";

import { DetailBackground, Header } from "../../DetailChrome";
import { designDetailStyles as styles } from "../../../style";

import { detailErrorStyles } from "./style";

export interface DetailErrorProps {
  readonly message?: string;
  readonly onBack: () => void;
}

export function DetailError({ message, onBack }: DetailErrorProps) {
  return (
    <DetailBackground testID="detail-error">
      <Header onBack={onBack} />
      <View style={styles.errorContainer} accessibilityLiveRegion="polite">
        <Text style={styles.errorText} accessibilityRole="header">
          Gagal memuat event
        </Text>
        <Text style={[styles.description, detailErrorStyles.description]}>
          {message || "Event tidak ditemukan."}
        </Text>
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
