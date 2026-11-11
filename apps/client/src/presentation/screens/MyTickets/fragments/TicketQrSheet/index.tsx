import type { ReactNode } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { designColors } from "@presentation/theme";
import { styles } from "./style";
import { ticketQrContentStyle, ticketQrBackdropStyle } from "./style";

export { ticketQrBackdropStyle } from "./style";

interface BookingTicketQr {
  readonly ticketCode: string;
  readonly qrPayload: string;
}

interface TicketQrSheetProps {
  readonly eventName: string;
  readonly bookingId: string;
  readonly bookingTickets?: readonly BookingTicketQr[];
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly errorMessage?: string;
  readonly isRetrying?: boolean;
  readonly onRetry?: () => void;
  readonly downloadError: string;
  readonly onDownload: () => void;
  readonly onClose: () => void;
}

export function TicketQrSheet({
  eventName,
  bookingTickets,
  isLoading,
  isError,
  errorMessage,
  isRetrying = false,
  onRetry,
  downloadError,
  onDownload,
  onClose,
}: TicketQrSheetProps) {
  const insets = useSafeAreaInsets();
  let ticketContent: ReactNode;
  if (isLoading) {
    ticketContent = <Text style={styles.message}>Memuat QR…</Text>;
  } else if (isError) {
    ticketContent = errorContent(
      errorMessage ?? "QR tiket gagal dimuat. Silakan coba lagi.",
      isRetrying,
      onRetry,
    );
  } else if (!bookingTickets || bookingTickets.length === 0) {
    ticketContent = errorContent(
      "Data QR tiket belum tersedia. Coba muat kembali.",
      isRetrying,
      onRetry,
    );
  } else {
    ticketContent = bookingTickets.map((ticket, index) => (
      <View key={ticket.ticketCode} style={styles.ticketQr}>
        <QRCode
          value={ticket.qrPayload}
          size={190}
          color={designColors.ink}
          backgroundColor={designColors.ground}
        />
        <Text style={styles.ticketCode}>{ticket.ticketCode}</Text>
      </View>
    ));
  }

  return (
    <Pressable
      accessible={false}
      onPress={onClose}
      style={ticketQrBackdropStyle(Platform.OS)}
      testID="ticket-qr-backdrop"
    >
      <Pressable
        onPress={(event) => event?.stopPropagation?.()}
        accessible={false}
        accessibilityViewIsModal
        style={styles.sheet}
        testID="ticket-qr-sheet"
      >
        <ScrollView
          contentContainerStyle={ticketQrContentStyle(insets.bottom)}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.title}>{eventName}</Text>
          {ticketContent}
          <Text style={styles.instruction}>
            Tunjukkan kode ini di pintu masuk.
          </Text>
          {bookingTickets &&
            bookingTickets.length > 0 &&
            !isLoading &&
            !isError && (
              <Pressable onPress={onDownload} style={styles.download}>
                <Text style={styles.downloadText}>Unduh E-Tiket</Text>
              </Pressable>
            )}
          {downloadError ? (
            <Text style={styles.errorText}>{downloadError}</Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tutup QR tiket"
            onPress={onClose}
            style={styles.close}
            testID="ticket-qr-close"
          >
            <Text style={styles.closeText}>Tutup</Text>
          </Pressable>
        </ScrollView>
      </Pressable>
    </Pressable>
  );
}

function errorContent(
  message: string,
  isRetrying: boolean,
  onRetry?: () => void,
): ReactNode {
  return (
    <View style={{ alignItems: "center", gap: 12 }}>
      <Text style={styles.error} accessibilityLiveRegion="polite">
        {message}
      </Text>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Coba muat QR tiket lagi"
          accessibilityState={{ disabled: isRetrying }}
          disabled={isRetrying}
          onPress={onRetry}
          style={styles.close}
          testID="ticket-qr-retry"
        >
          <Text style={styles.closeText}>
            {isRetrying ? "Memuat…" : "Coba Lagi"}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
