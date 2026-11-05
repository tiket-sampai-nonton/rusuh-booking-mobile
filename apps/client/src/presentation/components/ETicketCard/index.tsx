/**
 * ETicketCard — one e-ticket with a QR (RBT-071),  Brutalist Mono.
 *
 * The QR encodes a NON-sensitive ticket reference (bookingId + index) — NEVER a
 * raw NIK / token / PII (D7.1). Rendered with react-native-svg via
 * react-native-qrcode-svg (works on web + native). The QR colors are the
 * brutalist pair (black on white) — the SVG is a non-className drawing surface.
 *
 *  look (prototype 10-success `.ticket`): white card, black top strip with
 * the ticket label, a dashed divider, the QR in a black box, and the code.
 */
import { Text, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

import { designColors } from "@presentation/theme";

import { eTicketStyles, componentStyles } from "./style";

export interface ETicketCardProps {
  readonly bookingId: string;
  readonly index: number;
  readonly total: number;
  readonly eventName?: string;
  readonly venue?: string;
  readonly startsAt?: string;
  readonly attendeeName?: string;
  readonly attendeeNikMasked?: string;
}

/** The QR payload — a safe, verifiable reference, no PII (D7.1). */
export function ticketRef(bookingId: string, index: number): string {
  return `RBT|${bookingId}|${index + 1}`;
}

export function ETicketCard({ bookingId, index, total, eventName, venue, startsAt, attendeeName, attendeeNikMasked }: ETicketCardProps) {
  const value = ticketRef(bookingId, index);
  return (
    <View
      style={componentStyles.elementBorderWidth0}
      testID={`eticket-${index}`}
      accessibilityLabel={`E-tiket ${index + 1} dari ${total}`}
    >
      {/* Black top strip (prototype `.ticket-top`). */}
      <View className="px-5 py-3.5" style={componentStyles.elementBackgroundColor1}>
        <Text className="text-sm font-extrabold uppercase text-white" style={componentStyles.elementLetterSpacing2}>
          E-Tiket {index + 1} / {total}
        </Text>
      </View>

      <View className="items-center p-6">
        <View className="w-full" style={eTicketStyles.divider} />
        <View className="mt-4 items-center justify-center p-3" style={componentStyles.elementBackgroundColor3}>
          <View accessibilityLabel="Kode QR tiket">
            <QRCode value={value} size={120} color={designColors.ground} backgroundColor={designColors.ink} />
          </View>
        </View>
        <Text className="mt-3 text-xs font-extrabold" style={componentStyles.elementColor4}>
          {value}
        </Text>
        {eventName ? (
          <View className="mt-5 w-full gap-2" style={componentStyles.elementBorderTopWidth5}>
            <Text className="text-lg font-extrabold uppercase" style={componentStyles.elementColor6}>{eventName}</Text>
            <Text className="text-xs" style={componentStyles.elementColor7}>{attendeeName ?? 'Pemegang tiket'} · {attendeeNikMasked ?? '••••'}</Text>
            <Text className="text-xs" style={componentStyles.elementColor8}>{startsAt ?? 'Tanggal menyusul'} · {venue ?? 'Lokasi menyusul'}</Text>
            <Text className="text-xs font-bold uppercase" style={componentStyles.elementColor9}>Tiket Umum · Kode tiket {value}</Text>
          </View>
        ) : null}
        <Text className="mt-1 text-2xs" style={componentStyles.elementColor10}>
          Tunjukkan QR ini di gerbang masuk.
        </Text>
      </View>
    </View>
  );
}
