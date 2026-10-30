/**
 * ETicketCard — one e-ticket with a QR (RBT-071).
 *
 * The QR encodes a NON-sensitive ticket reference (bookingId + index) — NEVER a
 * raw NIK / token / PII (D7.1). Rendered with react-native-svg via
 * react-native-qrcode-svg (works on web + native). Theme tokens drive the QR
 * colors (non-className drawing surface).
 */
import { Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { getThemeColors } from "@presentation/theme";

export interface ETicketCardProps {
  readonly bookingId: string;
  readonly index: number;
  readonly total: number;
}

/** The QR payload — a safe, verifiable reference, no PII. */
export function ticketRef(bookingId: string, index: number): string {
  return `RBT|${bookingId}|${index + 1}`;
}

export function ETicketCard({ bookingId, index, total }: ETicketCardProps) {
  const theme = getThemeColors("light");
  const value = ticketRef(bookingId, index);
  return (
    <View
      className="items-center rounded-2xl border border-line bg-card p-5"
      testID={`eticket-${index}`}
      accessibilityLabel={`E-tiket ${index + 1} dari ${total}`}
    >
      <Text className="text-2xs font-bold uppercase tracking-tag text-muted-foreground">
        E-Tiket {index + 1} / {total}
      </Text>
      <View className="mt-3" accessibilityLabel="Kode QR tiket">
        <QRCode
          value={value}
          size={160}
          color={theme.foreground}
          backgroundColor={theme.card}
        />
      </View>
      <Text className="mt-3 text-xs font-semibold text-foreground">{value}</Text>
      <Text className="mt-1 text-2xs text-muted-foreground">
        Tunjukkan QR ini di gerbang masuk.
      </Text>
    </View>
  );
}
