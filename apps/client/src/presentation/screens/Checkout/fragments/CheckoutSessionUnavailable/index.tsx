import { ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useResponsive } from "@presentation/hooks/useResponsive";
import { designColors } from "@presentation/theme";
import { RecoveryMessage } from "@presentation/screens/ExpiredRecovery/fragments/RecoveryMessage";
import { RecoveryInfo } from "@presentation/screens/ExpiredRecovery/fragments/RecoveryInfo";
import { RecoveryActions } from "@presentation/screens/ExpiredRecovery/fragments/RecoveryActions";

interface Props {
  readonly hasError: boolean;
  readonly errorMessage?: string;
  readonly onRetry: () => void;
  readonly onBrowse: () => void;
}

/** A session may have ended or failed to load; retry without guessing its state. */
export function CheckoutSessionUnavailable({
  hasError,
  errorMessage,
  onRetry,
  onBrowse,
}: Props) {
  const insets = useSafeAreaInsets();
  const { isMobileWeb } = useResponsive();
  return (
    <View style={styles.screen} testID="checkout-session-unavailable">
      <ScrollView
        contentContainerStyle={[
          styles.content,
          isMobileWeb && styles.mobileContent,
          {
            paddingTop: Math.max(insets.top, isMobileWeb ? 48 : 24),
            paddingBottom: Math.max(insets.bottom, 24),
          },
        ]}
      >
        <View style={styles.inner}>
          <RecoveryMessage
            reason="hold"
            title={hasError ? "Sesi Gagal Dimuat" : "Sesi Tidak Tersedia"}
            body={
              hasError
                ? (errorMessage ??
                  "Kami tidak dapat memuat sesi pemilihan tiket. Periksa koneksi dan coba lagi.")
                : "Sesi pemilihan tiket tidak ditemukan atau sudah berakhir."
            }
          />
          <RecoveryInfo
            text="Coba muat kembali sesi Anda. Jika tetap tidak tersedia, pilih event untuk memulai lagi."
            items={[
              "Sesi yang berakhir perlu dimulai kembali",
              "Tidak ada pembayaran yang dilakukan di halaman ini",
            ]}
          />
          <RecoveryActions
            canRetry
            primaryText="Coba Lagi"
            showHome={false}
            onRetry={onRetry}
            onRequeue={onBrowse}
            onHome={onBrowse}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: designColors.ground },
  content: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  mobileContent: { justifyContent: "flex-start" },
  inner: { width: "100%", maxWidth: 384, alignItems: "center", gap: 20 },
});
