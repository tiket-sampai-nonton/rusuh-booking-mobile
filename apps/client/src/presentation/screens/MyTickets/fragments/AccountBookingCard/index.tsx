import { Pressable, Text, View } from "react-native";
import { minorToIDR } from "@domain/services/money";
import type { MyBookingSummary } from "@domain/repositories/ticket-history.repository";
import { styles } from "./style";

const STATUS_LABELS: Record<MyBookingSummary["status"], string> = {
  PENDING_PAYMENT: "Menunggu Pembayaran",
  VERIFYING: "Sedang Diverifikasi",
  PAID: "Lunas",
  EXPIRED: "Kedaluwarsa",
  CANCELLED: "Dibatalkan",
  REVIEW: "Dalam Peninjauan",
};

interface AccountBookingCardProps {
  readonly booking: MyBookingSummary;
  readonly onOpenQr: (booking: MyBookingSummary) => void;
}

export function AccountBookingCard({
  booking,
  onOpenQr,
}: AccountBookingCardProps) {
  const content = (
    <>
      <Text style={styles.eventName}>{booking.eventName}</Text>
      <Text style={styles.details}>
        {booking.publicRef} · {STATUS_LABELS[booking.status]}
      </Text>
      <Text style={styles.amount}>{minorToIDR(booking.amountMinor)}</Text>
      <View style={styles.qrButton}>
        <Text style={styles.qrLabel}>Lihat Detail Tiket</Text>
      </View>
    </>
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Lihat detail tiket ${booking.eventName}`}
      onPress={() => onOpenQr(booking)}
      style={styles.card}
      testID={`account-ticket-${booking.bookingId}`}
    >
      {content}
    </Pressable>
  );
}
