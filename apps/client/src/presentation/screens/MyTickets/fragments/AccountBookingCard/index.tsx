import { Pressable, Text, View } from 'react-native';
import { minorToIDR } from '@domain/services/money';
import type { MyBookingSummary } from '@domain/repositories/ticket-history.repository';
import { styles } from "./style";



const STATUS_LABELS: Record<MyBookingSummary['status'], string> = {
  PENDING_PAYMENT: 'Menunggu Pembayaran',
  VERIFYING: 'Sedang Diverifikasi',
  PAID: 'Lunas',
  EXPIRED: 'Kedaluwarsa',
  CANCELLED: 'Dibatalkan',
  REVIEW: 'Dalam Peninjauan',
};



interface AccountBookingCardProps {
  readonly booking: MyBookingSummary;
  readonly onOpenQr: (booking: MyBookingSummary) => void;
}

export function AccountBookingCard({ booking, onOpenQr }: AccountBookingCardProps) {
  return (
    <View style={styles.card} testID={`account-ticket-${booking.bookingId}`}>
      <Text style={styles.eventName}>{booking.eventName}</Text>
      <Text style={styles.details}>
        {booking.publicRef} · {STATUS_LABELS[booking.status]}
      </Text>
      <Text style={styles.amount}>{minorToIDR(booking.amountMinor)}</Text>
      {booking.status === 'PAID' ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Lihat QR ${booking.eventName}`}
          onPress={() => onOpenQr(booking)}
          style={styles.qrButton}
          testID={`account-ticket-qr-${booking.bookingId}`}
        >
          <Text style={styles.qrLabel}>Lihat QR</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
