/**
 * SuccessScreen — confirmed-order summary (RBT-070, E8, AC1/FR-22),  Brutalist Mono.
 *
 * Reached only after the RBT-063 verify gate confirmed PAID; this screen
 * RE-VERIFIES the authoritative status (never trusts navigation alone, D10.2)
 * and shows the order summary ONLY when getStatus reports PAID. While it is
 * still verifying it shows a brief processing state; a non-PAID terminal status
 * routes to the recovery screen. The e-ticket QR + download/share is RBT-071.
 *
 * SECURITY: renders the MASKED buyer NIK only (first 2 + last 2, D7.1/D7.5) —
 * the raw NIK never reaches the FE. noindex (transactional, SECURITY §6.5).
 *
 *  look (prototype 10-success): dark ground, green success ring, white
 * success card with a dark summary, white-primary / outline-secondary actions.
 */
import { useRouter, type Href } from "expo-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { minorToIDR } from "@domain/services/money";
import { SummaryRow } from "./fragments/SummaryRow";
import { ETicketCard } from "@presentation/components/ETicketCard";
import { useServices } from "@providers/service-context";
import { Seo } from "@presentation/components/Seo";
import { useETicketDownload } from "@presentation/hooks/useETicketDownload";
import { CheckIcon, MailIcon } from "@presentation/components/ArrowIcon";
import { useVerifyPayment } from "@presentation/hooks/useVerifyPayment";
import { useEventDetail } from "@presentation/hooks/useEventDetail";
import { ArrowIcon } from "@presentation/components/ArrowIcon";
import { useSessionStore } from "@presentation/stores/session-store";
import { useResponsive } from "@presentation/hooks/useResponsive";
import { designColors, withAlpha } from "@presentation/theme";
import { successStyles, componentStyles } from "./style";
import { styleForSuccessScreenView0 } from "./style";

export interface SuccessScreenProps {
  readonly bookingId: string;
}

export function SuccessScreen({ bookingId }: SuccessScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isMobileWeb } = useResponsive();
  const attemptId = useSessionStore((s) => s.attemptId);
  const amountMinor = useSessionStore((s) => s.amountMinor);
  const buyerNikMasked = useSessionStore((s) => s.buyerNikMasked);
  const ticketCount = useSessionStore((s) => s.ticketCount);
  const eventId = useSessionStore((s) => s.eventId);
  const { data: event } = useEventDetail(eventId ?? "");

  // Re-verify authoritatively. verdict "failed" → the recovery screen; a
  // pending verdict stays on the processing state (the gate routes here on
  // PAID, so this is a safety re-check, not the primary poll).
  const { verdict, isLoading } = useVerifyPayment(attemptId, bookingId);
  const { ticketHistoryRepository } = useServices();
  const ticketsQuery = useQuery({
    queryKey: ["booking-tickets", bookingId],
    queryFn: () => ticketHistoryRepository.getBookingTickets(bookingId),
    enabled: verdict === "paid" && Boolean(bookingId),
  });
  const { downloadTickets } = useETicketDownload();
  const issuedTickets = ticketsQuery.data?.tickets ?? [];
  const count = issuedTickets.length;
  const [downloadError, setDownloadError] = useState("");

  const handleDownload = async () => {
    setDownloadError("");
    try {
      await downloadTickets(
        bookingId,
        count,
        issuedTickets.map((ticket) => ticket.qrPayload),
        event?.name,
        issuedTickets.map((ticket) => ticket.ticketCode),
      );
    } catch (error) {
      setDownloadError(
        error instanceof Error
          ? error.message
          : "E-tiket gagal disimpan. Coba lagi.",
      );
    }
  };

  useEffect(() => {
    if (verdict === "failed") {
      router.replace(
        `/expired/${bookingId}?reason=payment&bookingId=${bookingId}` as Href,
      );
    }
  }, [verdict, bookingId, router]);

  const confirmed = verdict === "paid";
  const verificationMessage = isLoading
    ? "Memverifikasi pembayaran…"
    : "Menyiapkan tiket…";

  return (
    <View
      className={
        isMobileWeb
          ? "flex-1 items-center px-4"
          : "flex-1 items-center justify-center px-6"
      }
      style={styleForSuccessScreenView0(insets, isMobileWeb)}
      testID="success-screen"
    >
      <Seo
        title="E-Tiket"
        description="Tiket Anda telah dikonfirmasi."
        path={`/success/${bookingId}`}
        noindex
      />
      {!confirmed && (
        <View
          className="items-center gap-4"
          accessibilityLiveRegion="polite"
          testID="success-verifying"
        >
          <ActivityIndicator
            size="large"
            color={isMobileWeb ? designColors.ink : designColors.ground}
            accessibilityLabel="Memverifikasi pembayaran"
          />
          <Text
            className={
              isMobileWeb
                ? "text-center text-base text-foreground"
                : "text-center text-base text-v2-ground"
            }
          >
            {verificationMessage}
          </Text>
        </View>
      )}
      {confirmed && (
        <>
          <ScrollView
            className="w-full"
            contentContainerClassName="w-full max-w-md self-center"
            contentContainerStyle={successStyles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Green success ring (prototype `.success-icon`). */}
            <View className="mb-4 items-center">
              <View
                className="h-20 w-20 items-center justify-center rounded-full"
                style={[
                  componentStyles.elementBorderWidth1,
                  isMobileWeb && componentStyles.mobileWebSuccessRing,
                ]}
              >
                <CheckIcon
                  color={
                    isMobileWeb ? designColors.success : designColors.ground
                  }
                  size={32}
                />
              </View>
            </View>

            <Text
              className="text-center text-2xs font-extrabold uppercase"
              style={componentStyles.elementColor2}
              testID="success-eyebrow"
            >
              Pembayaran berhasil
            </Text>
            <Text
              className={
                isMobileWeb
                  ? "mt-2 text-center text-2xl font-extrabold uppercase text-foreground"
                  : "mt-2 text-center text-2xl font-extrabold uppercase text-v2-ground"
              }
              style={[
                componentStyles.elementLetterSpacing3,
                isMobileWeb && componentStyles.mobileWebText,
              ]}
              accessibilityRole="header"
            >
              Tiket kamu sudah aktif
            </Text>
            <Text
              className={
                isMobileWeb
                  ? "mt-1.5 text-center text-xs leading-5 text-muted-foreground"
                  : "mt-2.5 text-center text-xs leading-5 text-v2-ground/70"
              }
            >
              Simpan e-tiket ini. Tunjukkan QR di pintu masuk.
            </Text>

            {/* Summary card — translucent on the dark ground (prototype `.summary-card`). */}
            <View
              className={isMobileWeb ? "my-4 gap-1 p-3" : "my-6 gap-1 p-5"}
              style={[
                componentStyles.elementBackgroundColor4,
                isMobileWeb && componentStyles.mobileWebSummary,
              ]}
            >
              <SummaryRow
                label="Nomor Pesanan"
                value={bookingId}
                isMobileWeb={isMobileWeb}
              />
              <SummaryRow
                label="Jumlah tiket"
                value={`${ticketsQuery.data?.ticketQuantity ?? ticketCount ?? 0} tiket`}
                isMobileWeb={isMobileWeb}
              />
              <SummaryRow
                label="Total dibayar"
                value={minorToIDR(
                  ticketsQuery.data?.amountMinor ?? amountMinor,
                )}
                isMobileWeb={isMobileWeb}
              />
              <SummaryRow
                label="NIK pembeli"
                value={
                  ticketsQuery.data?.buyerNikMasked ?? buyerNikMasked ?? "••••"
                }
                isMobileWeb={isMobileWeb}
              />
            </View>

            {/* One e-ticket card + QR per ticket (RBT-071). QR encodes a safe
              reference, never PII. */}
            <View className="gap-6" testID="eticket-list">
              {ticketsQuery.isLoading ? <Text>Memuat e-tiket…</Text> : null}
              {ticketsQuery.isError ? (
                <Text>Gagal memuat e-tiket. Silakan coba lagi.</Text>
              ) : null}
              {issuedTickets.map((ticket, i) => (
                // Static derived list (fixed length, never reordered): the
                // booking id + ticket index IS the stable identity.
                <ETicketCard
                  key={`${bookingId}-ticket-${i}`}
                  bookingId={bookingId}
                  index={i}
                  total={count}
                  eventName={event?.name}
                  venue={event?.venue}
                  startsAt={event?.startsAt}
                  attendeeNikMasked={buyerNikMasked}
                  attendeeName={ticket.attendeeName}
                  qrPayload={ticket.qrPayload}
                  ticketCode={ticket.ticketCode}
                />
              ))}
            </View>

            <View className="mt-5 flex-row gap-3">
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Unduh e-tiket"
                testID="success-download"
                disabled={issuedTickets.length === 0}
                onPress={() => void handleDownload()}
                className="flex-1 items-center py-4"
                style={componentStyles.elementBackgroundColor5}
              >
                <View className="flex-row items-center gap-2">
                  <ArrowIcon direction="download" color={designColors.ink} />
                  <Text
                    className="text-sm font-bold uppercase"
                    style={componentStyles.elementColor6}
                  >
                    Unduh E-Tiket
                  </Text>
                </View>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ke Beranda"
                testID="success-home"
                onPress={() => router.replace("/" as Href)}
                className="flex-1 items-center py-4"
                style={[
                  componentStyles.elementBorderWidth7,
                  isMobileWeb && componentStyles.mobileWebSecondaryButton,
                ]}
              >
                <Text
                  className={
                    isMobileWeb
                      ? "text-sm font-bold uppercase text-foreground"
                      : "text-sm font-bold uppercase text-v2-ground"
                  }
                  style={[
                    componentStyles.elementLetterSpacing8,
                    isMobileWeb && componentStyles.mobileWebText,
                  ]}
                >
                  Ke Beranda
                </Text>
              </Pressable>
            </View>
            {downloadError ? (
              <Text
                className="mt-3 text-center text-xs"
                style={componentStyles.elementColor9}
              >
                {downloadError}
              </Text>
            ) : null}

            {/* Email note (v2-mobile prototype 10-success.html `.email-note`) */}
            <View className="mt-4 flex-row items-center justify-center gap-2">
              <MailIcon
                color={
                  isMobileWeb
                    ? designColors.gray
                    : withAlpha(designColors.ground, 0.6)
                }
                size={16}
              />
              <Text
                style={[
                  componentStyles.elementFontSize10,
                  isMobileWeb && componentStyles.mobileWebMutedText,
                ]}
              >
                E-tiket juga dikirim ke email kamu
              </Text>
            </View>
          </ScrollView>
        </>
      )}
    </View>
  );
}
