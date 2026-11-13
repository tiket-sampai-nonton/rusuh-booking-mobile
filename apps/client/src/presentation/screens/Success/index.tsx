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
import { useNavigation, useRouter, type Href } from "expo-router";
import { useEffect, useState } from "react";
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
import { Seo } from "@presentation/components/Seo";
import { useETicketDownload } from "@presentation/hooks/useETicketDownload";
import { CheckIcon, MailIcon, Icon } from "@presentation/components/Icon";
import { useVerifyPayment } from "@presentation/hooks/useVerifyPayment";
import { useSuccessTickets } from "@presentation/hooks/useSuccessTickets";
import { useEventDetail } from "@presentation/hooks/useEventDetail";

import { useSessionStore } from "@presentation/stores/session-store";
import { useAccountStore } from "@presentation/stores/account-store";
import { useResponsive } from "@presentation/hooks/useResponsive";
import { designColors, withAlpha } from "@presentation/theme";
import {
  successStyles,
  componentStyles,
  styleForSuccessScreenView0,
} from "./style";

import { apiErrorMessage } from "@presentation/utils/api-error-message";

export interface SuccessScreenProps {
  readonly bookingId: string;
  readonly eventId?: string;
}

interface VerificationPanelProps {
  readonly confirmed: boolean;
  readonly hasError: boolean;
  readonly isMobileWeb: boolean;
  readonly isRetrying: boolean;
  readonly message: string;
  readonly error: unknown;
  readonly onRetry: () => void;
}

function VerificationPanel({
  confirmed,
  hasError,
  isMobileWeb,
  isRetrying,
  message,
  error,
  onRetry,
}: VerificationPanelProps) {
  const titleClass = isMobileWeb
    ? "text-center text-base font-bold text-foreground"
    : "text-center text-base font-bold text-v2-ground";
  const detailClass = isMobileWeb
    ? "text-center text-sm text-muted-foreground"
    : "text-center text-sm text-v2-ground/70";
  const loadingClass = isMobileWeb
    ? "text-center text-base text-foreground"
    : "text-center text-base text-v2-ground";
  const loadingColor = isMobileWeb ? designColors.ink : designColors.ground;
  const retryLabel = isRetrying ? "MEMERIKSA…" : "COBA LAGI";

  if (confirmed) return null;
  if (hasError) {
    return (
      <View
        className="w-full max-w-sm items-center gap-4"
        accessibilityLiveRegion="polite"
        testID="success-verification-error"
      >
        <Text className={titleClass}>Pembayaran belum dapat diverifikasi.</Text>
        <Text className={detailClass}>{apiErrorMessage(error)}</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Coba verifikasi pembayaran lagi"
          accessibilityState={{ disabled: isRetrying }}
          disabled={isRetrying}
          onPress={onRetry}
          testID="success-verification-retry"
          className="border-2 border-card px-6 py-3"
        >
          <Text className="font-bold text-card">{retryLabel}</Text>
        </Pressable>
      </View>
    );
  }
  return (
    <View
      className="items-center gap-4"
      accessibilityLiveRegion="polite"
      testID="success-verifying"
    >
      <ActivityIndicator
        size="large"
        color={loadingColor}
        accessibilityLabel="Memverifikasi pembayaran"
      />
      <Text className={loadingClass}>{message}</Text>
    </View>
  );
}

export function SuccessScreen({
  bookingId,
  eventId: routeEventId,
}: SuccessScreenProps) {
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { isMobileWeb } = useResponsive();
  const profile = useAccountStore((state) => state.profile);
  const attemptId = useSessionStore((s) => s.attemptId);
  const amountMinor = useSessionStore((s) => s.amountMinor);
  const buyerNikMasked = useSessionStore((s) => s.buyerNikMasked);
  const ticketCount = useSessionStore((s) => s.ticketCount);
  const sessionEventId = useSessionStore((s) => s.eventId);
  const eventId = routeEventId ?? sessionEventId;
  const { data: event } = useEventDetail(eventId ?? "");

  // Re-verify authoritatively. verdict "failed" → the recovery screen; a
  // pending verdict stays on the processing state (the gate routes here on
  // PAID, so this is a safety re-check, not the primary poll).
  const {
    verdict,
    isLoading,
    isError: verificationError,
    error: verificationFailure,
    refetch: retryVerification,
    isFetching: isRetryingVerification,
  } = useVerifyPayment(attemptId, bookingId);
  const ticketsQuery = useSuccessTickets(bookingId, verdict === "paid");
  const { downloadTickets } = useETicketDownload();
  const issuedTickets = ticketsQuery.data?.tickets ?? [];
  const count = issuedTickets.length;
  const [downloadError, setDownloadError] = useState("");

  useEffect(() => {
    return navigation.addListener("beforeRemove", (event) => {
      const actionType = event.data.action.type;
      if (
        actionType === "GO_BACK" ||
        actionType === "POP" ||
        actionType === "POP_TO_TOP"
      ) {
        event.preventDefault();
        router.replace("/" as Href);
      }
    });
  }, [navigation, profile, router]);

  const handleDownload = async () => {
    setDownloadError("");
    try {
      await downloadTickets(
        bookingId,
        issuedTickets.map((ticket, index) => ({
          bookingId,
          eventName: event?.name ?? "E-Tiket Rusuh Booking",
          venue: event?.venue,
          startsAt: event?.startsAt,
          attendeeName: ticket.attendeeName,
          attendeeNikMasked: ticket.attendeeNikMasked,
          categoryCode: ticket.categoryCode,
          qrPayload: ticket.qrPayload,
          ticketCode: ticket.ticketCode,
          index,
          total: count,
        })),
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
        `/failed/${bookingId}?reason=payment&bookingId=${bookingId}` as Href,
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
      <VerificationPanel
        confirmed={confirmed}
        hasError={Boolean(verificationError)}
        isMobileWeb={isMobileWeb}
        isRetrying={isRetryingVerification}
        message={verificationMessage}
        error={verificationFailure}
        onRetry={() => void retryVerification()}
      />
      {confirmed ? (
        <SuccessReceipt
          bookingId={bookingId}
          isMobileWeb={isMobileWeb}
          isLoggedIn={Boolean(profile)}
          ticketsQuery={ticketsQuery}
          ticketCount={ticketCount}
          amountMinor={amountMinor}
          buyerNikMasked={buyerNikMasked}
          event={event}
          onDownload={handleDownload}
          onHome={() => router.replace((profile ? "/my-tickets" : "/") as Href)}
          downloadError={downloadError}
        />
      ) : null}
    </View>
  );
}

type SuccessTicketQuery = ReturnType<typeof useSuccessTickets>;
type SuccessEvent = ReturnType<typeof useEventDetail>["data"];

interface SuccessReceiptProps {
  readonly bookingId: string;
  readonly isMobileWeb: boolean;
  readonly isLoggedIn: boolean;
  readonly ticketsQuery: SuccessTicketQuery;
  readonly ticketCount?: number;
  readonly amountMinor?: number;
  readonly buyerNikMasked?: string;
  readonly event?: SuccessEvent;
  readonly onDownload: () => Promise<void>;
  readonly onHome: () => void;
  readonly downloadError: string;
}

function SuccessReceipt({
  bookingId,
  isMobileWeb,
  isLoggedIn,
  ticketsQuery,
  ticketCount,
  amountMinor,
  buyerNikMasked,
  event,
  onDownload,
  onHome,
  downloadError,
}: SuccessReceiptProps) {
  const issuedTickets = ticketsQuery.data?.tickets ?? [];
  const count = issuedTickets.length;
  return (
    <ScrollView
      className="w-full"
      contentContainerClassName="w-full max-w-md self-center"
      contentContainerStyle={successStyles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <SuccessHeading isMobileWeb={isMobileWeb} />
      <SuccessSummary
        bookingId={bookingId}
        ticketsQuery={ticketsQuery}
        ticketCount={ticketCount}
        amountMinor={amountMinor}
        buyerNikMasked={buyerNikMasked}
        isMobileWeb={isMobileWeb}
      />
      <SuccessTicketList
        bookingId={bookingId}
        ticketsQuery={ticketsQuery}
        issuedTickets={issuedTickets}
        count={count}
        event={event}
      />
      <SuccessReceiptActions
        isLoggedIn={isLoggedIn}
        isMobileWeb={isMobileWeb}
        hasTickets={issuedTickets.length > 0}
        onDownload={onDownload}
        onHome={onHome}
        downloadError={downloadError}
      />
      <SuccessEmailNote isMobileWeb={isMobileWeb} />
    </ScrollView>
  );
}

interface SuccessHeadingProps {
  readonly isMobileWeb: boolean;
}

function SuccessHeading({ isMobileWeb }: SuccessHeadingProps) {
  return (
    <>
      <View className="mb-4 items-center">
        <View
          className="h-20 w-20 items-center justify-center rounded-full"
          style={[
            componentStyles.elementBorderWidth1,
            isMobileWeb && componentStyles.mobileWebSuccessRing,
          ]}
        >
          <CheckIcon
            color={isMobileWeb ? designColors.success : designColors.ground}
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
    </>
  );
}

interface SuccessSummaryProps {
  readonly bookingId: string;
  readonly ticketsQuery: SuccessTicketQuery;
  readonly ticketCount?: number;
  readonly amountMinor?: number;
  readonly buyerNikMasked?: string;
  readonly isMobileWeb: boolean;
}

function SuccessSummary({
  bookingId,
  ticketsQuery,
  ticketCount,
  amountMinor,
  buyerNikMasked,
  isMobileWeb,
}: SuccessSummaryProps) {
  return (
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
        value={minorToIDR(ticketsQuery.data?.amountMinor ?? amountMinor)}
        isMobileWeb={isMobileWeb}
      />
      <SummaryRow
        label="NIK pembeli"
        value={ticketsQuery.data?.buyerNikMasked ?? buyerNikMasked ?? "••••"}
        isMobileWeb={isMobileWeb}
      />
    </View>
  );
}

interface SuccessTicketListProps {
  readonly bookingId: string;
  readonly ticketsQuery: SuccessTicketQuery;
  readonly issuedTickets: NonNullable<SuccessTicketQuery["data"]>["tickets"];
  readonly count: number;
  readonly event?: SuccessEvent;
}

function SuccessTicketList({
  bookingId,
  ticketsQuery,
  issuedTickets,
  count,
  event,
}: SuccessTicketListProps) {
  const retryLabel = ticketsQuery.isFetching ? "Memuat…" : "Coba Lagi";
  return (
    <View className="gap-6" testID="eticket-list">
      {ticketsQuery.isLoading ? <Text>Memuat e-tiket…</Text> : null}
      {ticketsQuery.isError ? (
        <View
          className="items-center gap-2"
          accessibilityLiveRegion="polite"
          testID="success-tickets-error"
        >
          <Text className="text-center">
            {apiErrorMessage(
              ticketsQuery.error,
              "Gagal memuat e-tiket. Silakan coba lagi.",
            )}
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Coba muat e-tiket lagi"
            accessibilityState={{ disabled: ticketsQuery.isFetching }}
            disabled={ticketsQuery.isFetching}
            onPress={() => void ticketsQuery.refetch()}
            testID="success-tickets-retry"
          >
            <Text className="font-bold">{retryLabel}</Text>
          </Pressable>
        </View>
      ) : null}
      {issuedTickets.map((ticket, index) => (
        <ETicketCard
          key={`${bookingId}-ticket-${index}`}
          bookingId={bookingId}
          index={index}
          total={count}
          eventName={event?.name}
          venue={event?.venue}
          startsAt={event?.startsAt}
          attendeeNikMasked={ticket.attendeeNikMasked}
          attendeeName={ticket.attendeeName}
          categoryCode={ticket.categoryCode}
          qrPayload={ticket.qrPayload}
          ticketCode={ticket.ticketCode}
        />
      ))}
    </View>
  );
}

interface SuccessReceiptActionsProps {
  readonly isLoggedIn: boolean;
  readonly isMobileWeb: boolean;
  readonly hasTickets: boolean;
  readonly onDownload: () => Promise<void>;
  readonly onHome: () => void;
  readonly downloadError: string;
}

function SuccessReceiptActions({
  isLoggedIn,
  isMobileWeb,
  hasTickets,
  onDownload,
  onHome,
  downloadError,
}: SuccessReceiptActionsProps) {
  return (
    <>
      <View className="mt-5 flex-row gap-3">
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Unduh e-tiket"
          testID="success-download"
          disabled={!hasTickets}
          onPress={() => void onDownload()}
          className="flex-1 items-center py-4"
          style={componentStyles.elementBackgroundColor5}
        >
          <View className="flex-row items-center gap-2">
            <Icon direction="download" color={designColors.ink} />
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
          accessibilityLabel={isLoggedIn ? "Tiket Saya" : "Ke Beranda"}
          testID="success-home"
          onPress={onHome}
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
            {isLoggedIn ? "Lihat Tiket" : "Ke Beranda"}
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
    </>
  );
}

function SuccessEmailNote({ isMobileWeb }: SuccessHeadingProps) {
  return (
    <View className="mt-4 flex-row items-center justify-center gap-2">
      <MailIcon
        color={
          isMobileWeb ? designColors.gray : withAlpha(designColors.ground, 0.6)
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
  );
}
