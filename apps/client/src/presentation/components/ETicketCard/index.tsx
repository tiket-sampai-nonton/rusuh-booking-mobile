import { LinearGradient } from "expo-linear-gradient";
import { Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { formatWIBDateID, formatWIBTimeID } from "@domain/services/date-format";
import { designColors } from "@presentation/theme";

import { ticketStyles as styles } from "./style";

export interface ETicketCardProps {
  readonly bookingId: string;
  readonly index: number;
  readonly total: number;
  readonly eventName?: string;
  readonly venue?: string;
  readonly startsAt?: string;
  readonly attendeeName?: string;
  readonly attendeeNikMasked?: string;
  readonly categoryCode?: string;
  readonly qrPayload?: string;
  readonly ticketCode?: string;
}

/** The QR payload is a safe ticket reference, never personal information. */
export function ticketRef(bookingId: string, index: number): string {
  return `RBT|${bookingId}|${index + 1}`;
}

interface TicketFieldProps {
  readonly label: string;
  readonly value: string;
  readonly alignRight?: boolean;
}

function TicketField({ label, value, alignRight = false }: TicketFieldProps) {
  return (
    <View style={[styles.field, alignRight && styles.fieldRight]}>
      <Text style={styles.label}>{label}</Text>
      <Text numberOfLines={2} style={styles.value}>
        {value || "—"}
      </Text>
    </View>
  );
}

export function ETicketCard({
  bookingId,
  index,
  total,
  eventName,
  venue,
  startsAt,
  attendeeName,
  attendeeNikMasked,
  categoryCode,
  qrPayload,
  ticketCode,
}: ETicketCardProps) {
  const code = ticketCode || ticketRef(bookingId, index);

  return (
    <View
      style={styles.card}
      testID={`eticket-${index}`}
      accessibilityLabel={`E-tiket ${index + 1} dari ${total} untuk pesanan ${bookingId}`}
    >
      <LinearGradient
        colors={[designColors.ember, designColors.danger]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={styles.header}
      >
        <Text numberOfLines={2} style={styles.headerTitle}>
          {eventName || "E-Tiket Rusuh Booking"}
        </Text>
        {total > 1 ? (
          <Text style={styles.headerSubtitle}>
            TIKET {index + 1} DARI {total}
          </Text>
        ) : null}
      </LinearGradient>

      <View style={styles.body}>
        <View style={styles.fieldRow}>
          <TicketField
            label="Penonton"
            value={attendeeName || "Pemegang tiket"}
          />
          <TicketField
            label="NIK"
            value={attendeeNikMasked || "••••"}
            alignRight
          />
        </View>
        <View style={styles.fieldRow}>
          <TicketField label="Kategori" value={categoryCode || "—"} />
          <TicketField
            label="Tanggal"
            value={formatWIBDateID(startsAt) || "Menyusul"}
            alignRight
          />
        </View>
        <View style={styles.fieldRow}>
          <TicketField
            label="Waktu"
            value={formatWIBTimeID(startsAt) || "Menyusul"}
          />
          <TicketField label="Venue" value={venue || "Menyusul"} alignRight />
        </View>

        <View style={styles.divider} />
        <View accessibilityLabel="Kode QR tiket" style={styles.qrBox}>
          {qrPayload ? (
            <QRCode
              value={qrPayload}
              size={124}
              color={designColors.ink}
              backgroundColor={designColors.ground}
            />
          ) : null}
        </View>
        <Text selectable style={styles.ticketCode}>
          {code}
        </Text>
        <Text style={styles.reference}>REF: {code}</Text>
      </View>
    </View>
  );
}
