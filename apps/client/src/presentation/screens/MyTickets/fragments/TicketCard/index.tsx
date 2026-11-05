import { Image, Pressable, Text, View } from "react-native";

import { eventImage } from "@domain/rules/event-image";
import { formatDateID } from "@domain/services/date-format";
import { minorToIDR } from "@domain/services/money";
import { styles } from "./style";




interface TicketCardProps {
  readonly event: { id: string; name: string; venue?: string; startsAt?: string };
  readonly bookingId: string;
  readonly amountMinor: number;
  readonly ticketCount: number;
  readonly onOpenQr: () => void;
  readonly onDownload: () => void;
  readonly onShare: () => void;
  readonly past?: boolean;
}



export function TicketCard({
  event,
  bookingId,
  amountMinor,
  ticketCount,
  onOpenQr,
  onDownload,
  onShare,
  past = false,
}: TicketCardProps) {
  return (
    <View
      style={[styles.card, past && styles.past]}
      testID={`ticket-card-${bookingId}`}
    >
      <Image source={{ uri: eventImage(event.id) }} resizeMode="cover" style={styles.image} />
      <View style={styles.content}>
        <View style={styles.heading}>
          <Text style={styles.eventName}>{event.name}</Text>
          <Text style={[styles.status, past ? styles.statusPast : styles.statusUpcoming]}>
            {past ? "Terpakai" : "Terkonfirmasi"}
          </Text>
        </View>
        <Text style={styles.dateVenue}>
          {formatDateID(event.startsAt)} · {event.venue ?? "Lokasi menyusul"}
        </Text>
        <View style={styles.details}>
          <View>
            <Text style={styles.ticketLabel}>Tiket</Text>
            <Text style={styles.ticketCount}>{ticketCount} × Tiket Umum</Text>
          </View>
          <Text style={styles.amount}>{minorToIDR(amountMinor, { compact: true })}</Text>
        </View>
        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={past ? "QR tiket sudah digunakan" : "Buka QR tiket"}
            accessibilityState={{ disabled: past }}
            disabled={past}
            onPress={onOpenQr}
            style={[styles.qrButton, past && styles.qrButtonDisabled]}
            testID={`ticket-qr-${bookingId}`}
          >
            <Text style={styles.primaryActionText}>Lihat QR</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Unduh e-tiket"
            onPress={onDownload}
            style={styles.downloadButton}
            testID={`ticket-download-${bookingId}`}
          >
            <Text style={styles.primaryActionText}>Unduh</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Bagikan e-tiket"
            onPress={onShare}
            style={styles.shareButton}
            testID={`ticket-share-${bookingId}`}
          >
            <Text style={styles.secondaryActionText}>Bagikan</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
