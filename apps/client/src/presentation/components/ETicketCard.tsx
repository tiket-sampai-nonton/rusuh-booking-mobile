/**
 * ETicketCard — one e-ticket with a QR (RBT-071), V2 Brutalist Mono.
 *
 * The QR encodes a NON-sensitive ticket reference (bookingId + index) — NEVER a
 * raw NIK / token / PII (D7.1). Rendered with react-native-svg via
 * react-native-qrcode-svg (works on web + native). The QR colors are the
 * brutalist pair (black on white) — the SVG is a non-className drawing surface.
 *
 * V2 look (prototype 10-success `.ticket`): white card, black top strip with
 * the ticket label, a dashed divider, the QR in a black box, and the code.
 */
import { Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { v2, v2Border } from "@presentation/theme";

import { eTicketStyles } from "./ETicketCard.style";

export interface ETicketCardProps {
  readonly bookingId: string;
  readonly index: number;
  readonly total: number;
}

/** The QR payload — a safe, verifiable reference, no PII (D7.1). */
export function ticketRef(bookingId: string, index: number): string {
  return `RBT|${bookingId}|${index + 1}`;
}

export function ETicketCard({ bookingId, index, total }: ETicketCardProps) {
  const value = ticketRef(bookingId, index);
  return (
    <View
      style={{ borderWidth: v2Border.base, borderColor: v2.ink, backgroundColor: v2.ground }}
      testID={`eticket-${index}`}
      accessibilityLabel={`E-tiket ${index + 1} dari ${total}`}
    >
      {/* Black top strip (prototype `.ticket-top`). */}
      <View className="px-5 py-3.5" style={{ backgroundColor: v2.ink }}>
        <Text className="text-sm font-extrabold uppercase text-white" style={{ letterSpacing: -0.3 }}>
          E-Tiket {index + 1} / {total}
        </Text>
      </View>

      <View className="items-center p-6">
        <View className="w-full" style={eTicketStyles.divider} />
        <View className="mt-4 items-center justify-center p-3" style={{ backgroundColor: v2.ink }}>
          <View accessibilityLabel="Kode QR tiket">
            <QRCode value={value} size={120} color={v2.ground} backgroundColor={v2.ink} />
          </View>
        </View>
        <Text className="mt-3 text-xs font-extrabold" style={{ color: v2.ink, letterSpacing: 1.5 }}>
          {value}
        </Text>
        <Text className="mt-1 text-2xs" style={{ color: v2.gray }}>
          Tunjukkan QR ini di gerbang masuk.
        </Text>
      </View>
    </View>
  );
}
