import type { ReactNode } from 'react';
import { Platform, Pressable, ScrollView, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { designColors } from '@presentation/theme';
import { styles } from "./style";
import { ticketQrContentStyle, ticketQrBackdropStyle } from './style';

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
  readonly downloadError: string;
  readonly onDownload: () => void;
  readonly onClose: () => void;
}

export function TicketQrSheet({
  eventName,
  bookingId,
  bookingTickets,
  isLoading,
  isError,
  downloadError,
  onDownload,
  onClose,
}: TicketQrSheetProps) {
  const insets = useSafeAreaInsets();
  let ticketContent: ReactNode;
  if (!bookingTickets) {
    ticketContent = (
      <View style={styles.fallbackQr}>
        <QRCode
          value={`RBT|${bookingId || 'booking'}|1`}
          size={190}
          color={designColors.ink}
          backgroundColor={designColors.ground}
        />
      </View>
    );
  } else if (isLoading) {
    ticketContent = <Text style={styles.message}>Memuat QR…</Text>;
  } else if (isError) {
    ticketContent = <Text style={styles.error}>QR tiket gagal dimuat. Silakan coba lagi.</Text>;
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
          <Text style={styles.instruction}>Tunjukkan kode ini di pintu masuk.</Text>
          {bookingTickets && !isLoading && !isError && (
            <Pressable onPress={onDownload} style={styles.download}>
              <Text style={styles.downloadText}>Unduh E-Tiket</Text>
            </Pressable>
          )}
          {downloadError ? <Text style={styles.errorText}>{downloadError}</Text> : null}
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
