import type { ReactNode } from "react";
import { Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ETicketCard } from "@presentation/components/ETicketCard";
import type {
  BookingTicket,
  MyBookingSummary,
} from "@domain/repositories/ticket-history.repository";
import { minorToIDR } from "@domain/services/money";
import { styles, ticketQrContentStyle, ticketQrBackdropStyle } from "./style";

export { ticketQrBackdropStyle } from "./style";

interface TicketQrSheetProps {
  readonly eventName: string;
  readonly venue?: string;
  readonly startsAt?: string;
  readonly bookingId: string;
  readonly bookingTickets?: readonly BookingTicket[];
  readonly bookingSummary?: MyBookingSummary;
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly errorMessage?: string;
  readonly isRetrying?: boolean;
  readonly onRetry?: () => void;
  readonly downloadError: string;
  readonly onDownload: () => void;
  readonly onClose: () => void;
}

export function TicketQrSheet(props: TicketQrSheetProps) {
  const insets = useSafeAreaInsets();
  return <TicketQrSheetView {...props} bottomInset={insets.bottom} />;
}

type TicketContentProps = Pick<
  TicketQrSheetProps,
  | "bookingTickets"
  | "bookingSummary"
  | "eventName"
  | "bookingId"
  | "venue"
  | "startsAt"
  | "isLoading"
  | "isError"
  | "errorMessage"
  | "isRetrying"
  | "onRetry"
>;

function buildTicketContent({
  bookingTickets,
  bookingSummary,
  eventName,
  bookingId,
  venue,
  startsAt,
  isLoading,
  isError,
  errorMessage,
  isRetrying = false,
  onRetry,
}: TicketContentProps): ReactNode {
  if (bookingSummary && bookingSummary.status !== "PAID") {
    return unpaidBookingContent(bookingSummary);
  }
  if (isLoading) return <Text style={styles.message}>Memuat QR…</Text>;
  if (isError) {
    return errorContent(
      errorMessage ?? "QR tiket gagal dimuat. Silakan coba lagi.",
      isRetrying,
      onRetry,
    );
  }
  if (!bookingTickets || bookingTickets.length === 0) {
    return errorContent(
      "Data QR tiket belum tersedia. Coba muat kembali.",
      isRetrying,
      onRetry,
    );
  }
  return bookingTicketCards(
    bookingTickets,
    bookingId,
    eventName,
    venue,
    startsAt,
  );
}

function unpaidBookingContent(booking: MyBookingSummary): ReactNode {
  const reason = unpaidBookingReason(booking.status);
  return (
    <View style={styles.bookingSummary} testID="booking-order-summary">
      <Text style={styles.ticketDetails}>Referensi {booking.publicRef}</Text>
      <Text style={styles.ticketDetails}>
        Status {booking.status.replaceAll("_", " ")}
      </Text>
      <Text style={styles.bookingAmount}>
        {minorToIDR(booking.amountMinor)}
      </Text>
      <Text style={styles.ticketDetails}>{reason}</Text>
    </View>
  );
}

function unpaidBookingReason(status: MyBookingSummary["status"]): string {
  if (status === "EXPIRED") {
    return "Pesanan ini kedaluwarsa sebelum pembayaran selesai, jadi e-tiket tidak diterbitkan.";
  }
  if (status === "CANCELLED") {
    return "Pesanan ini dibatalkan, jadi e-tiket tidak diterbitkan.";
  }
  return "E-tiket akan tersedia setelah pembayaran berhasil dikonfirmasi.";
}

function bookingTicketCards(
  tickets: readonly BookingTicket[],
  bookingId: string,
  eventName: string,
  venue?: string,
  startsAt?: string,
): ReactNode {
  return tickets.map((ticket, index) => (
    <View
      key={ticket.ticketCode}
      pointerEvents={ticketQrCardPointerEvents(Platform.OS)}
      style={styles.ticketQr}
    >
      <ETicketCard
        bookingId={bookingId}
        index={index}
        total={tickets.length}
        eventName={eventName}
        venue={venue}
        startsAt={startsAt}
        attendeeName={ticket.attendeeName}
        attendeeNikMasked={ticket.attendeeNikMasked}
        categoryCode={ticket.categoryCode}
        qrPayload={ticket.qrPayload}
        ticketCode={ticket.ticketCode}
      />
    </View>
  ));
}

interface TicketQrSheetViewProps extends TicketQrSheetProps {
  readonly bottomInset: number;
}

function TicketQrSheetView({
  eventName,
  venue,
  startsAt,
  bookingId,
  bookingTickets,
  bookingSummary,
  isLoading,
  isError,
  errorMessage,
  isRetrying,
  onRetry,
  downloadError,
  onDownload,
  onClose,
  bottomInset,
}: TicketQrSheetViewProps) {
  const hasUnpaidSummary =
    bookingSummary !== undefined && bookingSummary.status !== "PAID";
  const hasTickets = (bookingTickets?.length ?? 0) > 0;
  const showDownload = hasTickets && !isLoading && !isError;
  const ticketContent = buildTicketContent({
    bookingTickets,
    bookingSummary,
    eventName,
    bookingId,
    venue,
    startsAt,
    isLoading,
    isError,
    errorMessage,
    isRetrying,
    onRetry,
  });

  return (
    <View style={ticketQrBackdropStyle(Platform.OS)}>
      <Pressable
        accessible={false}
        onPress={onClose}
        style={styles.backdropDismiss}
        testID="ticket-qr-backdrop"
      />
      <View
        accessibilityViewIsModal
        accessibilityLabel={`QR tiket untuk pesanan ${bookingId}`}
        style={styles.sheet}
        testID="ticket-qr-sheet"
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={ticketQrContentStyle(bottomInset)}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled
          showsVerticalScrollIndicator={false}
          testID="ticket-qr-scrollview"
        >
          {hasUnpaidSummary ? (
            <Text style={styles.sectionTitle}>Detail Tiket</Text>
          ) : null}
          {hasUnpaidSummary || !hasTickets ? (
            <Text style={styles.title}>{eventName}</Text>
          ) : null}
          {ticketContent}
          {hasTickets ? (
            <Text style={styles.instruction}>
              Tunjukkan kode ini di pintu masuk.
            </Text>
          ) : null}
          {showDownload && (
            <Pressable onPress={onDownload} style={styles.download}>
              <Text style={styles.downloadText}>Unduh E-Tiket</Text>
            </Pressable>
          )}
          {downloadError ? (
            <Text style={styles.errorText}>{downloadError}</Text>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              hasUnpaidSummary ? "Tutup detail tiket" : "Tutup QR tiket"
            }
            onPress={onClose}
            style={styles.close}
            testID="ticket-qr-close"
          >
            <Text style={styles.closeText}>Tutup</Text>
          </Pressable>
        </ScrollView>
      </View>
    </View>
  );
}

export function ticketQrCardPointerEvents(
  platform: typeof Platform.OS,
): "auto" | "none" {
  // SVG QR cells are visual-only. Let vertical gestures started on the QR or
  // its labels reach the native ScrollView instead of being claimed by SVG.
  return platform === "web" ? "auto" : "none";
}

function errorContent(
  message: string,
  isRetrying: boolean,
  onRetry?: () => void,
): ReactNode {
  const retryLabel = isRetrying ? "Memuat…" : "Coba Lagi";
  const retryButton = onRetry ? (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Coba muat QR tiket lagi"
      accessibilityState={{ disabled: isRetrying }}
      disabled={isRetrying}
      onPress={onRetry}
      style={styles.close}
      testID="ticket-qr-retry"
    >
      <Text style={styles.closeText}>{retryLabel}</Text>
    </Pressable>
  ) : null;
  return (
    <View style={{ alignItems: "center", gap: 12 }}>
      <Text style={styles.error} accessibilityLiveRegion="polite">
        {message}
      </Text>
      {retryButton}
    </View>
  );
}
