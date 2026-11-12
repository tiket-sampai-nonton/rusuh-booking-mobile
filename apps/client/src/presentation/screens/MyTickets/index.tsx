import { useRouter, type Href } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  BackHandler,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { TicketCard } from "./fragments/TicketCard";
import { AccountBookingCard } from "./fragments/AccountBookingCard";
import { EmptyTicketsState } from "./fragments/EmptyTicketsState";
import { TicketQrSheet } from "./fragments/TicketQrSheet";
import { TicketTabs, type TicketTab } from "./fragments/TicketTabs";
import { ticketsScrollContent, screenStyles } from "./style";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  BottomNav,
  Header,
  navigateBottomTab,
} from "@presentation/components/design-system";
import { createPrimaryNavLinks } from "@presentation/components/design-system/primary-navigation";
import { LoginModal } from "@presentation/components/auth/LoginModal";
import { ScreenFade } from "@presentation/components/ScreenFade";
import { useEvents } from "@presentation/hooks/useEvents";
import { useMyTicketsData } from "@presentation/hooks/useMyTicketsData";
import { useETicketShare } from "@presentation/hooks/useETicketShare";
import { useETicketDownload } from "@presentation/hooks/useETicketDownload";
import { useSessionStore } from "@presentation/stores/session-store";
import { useAccountStore } from "@presentation/stores/account-store";
import { useServices } from "@providers/service-context";
import type { MyBookingSummary } from "@domain/repositories/ticket-history.repository";
import { useResponsive } from "@presentation/hooks/useResponsive";
import { apiErrorMessage } from "@presentation/utils/api-error-message";

import { historyContainerStyle, accountBookingColumnStyle } from "./style";
import { TICKET_HISTORY_PAGE_SIZE } from "./constants";

export function MyTicketsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isWeb, isMobileWeb, width } = useResponsive();
  const { data } = useEvents();
  const bookingId = useSessionStore((s) => s.bookingId);
  const eventId = useSessionStore((s) => s.eventId);
  const amountMinor = useSessionStore((s) => s.amountMinor) ?? 0;
  const ticketCount = useSessionStore((s) => s.ticketCount) ?? 1;
  const profile = useAccountStore((s) => s.profile);
  const { serverClock } = useServices();
  const activeEvent = useMemo(
    () => (data?.upcoming ?? []).find((event) => event.id === eventId),
    [data?.upcoming, eventId],
  );
  const { shareTickets } = useETicketShare();
  const { downloadTickets } = useETicketDownload();
  const [tab, setTab] = useState<TicketTab>("upcoming");
  const [qrOpen, setQrOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] =
    useState<MyBookingSummary | null>(null);
  const [downloadError, setDownloadError] = useState("");
  const navLinks = createPrimaryNavLinks({
    onHome: () => router.navigate("/" as Href),
    onBrowse: () => router.navigate("/browse" as Href),
    onTickets: () => undefined,
    onProfile: () => router.navigate("/profile" as Href),
    isLoggedIn: Boolean(profile),
  });
  const {
    paymentStatus,
    localTickets,
    history: historyQuery,
    selectedTickets: selectedTicketsQuery,
  } = useMyTicketsData({
    bookingId: bookingId ?? undefined,
    isSignedIn: Boolean(profile),
    profileEmailMasked: profile?.emailMasked,
    selectedBookingId: selectedBooking?.bookingId,
    selectedBookingStatus: selectedBooking?.status,
    historyPageSize: TICKET_HISTORY_PAGE_SIZE,
  });
  const {
    data: history,
    isLoading: historyLoading,
    isError: historyError,
    error: historyFailure,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isFetching: isFetchingBookings,
    refetch: retryBookings,
  } = historyQuery;
  const {
    data: selectedTickets,
    isLoading: ticketsLoading,
    isError: ticketsError,
    error: ticketsFailure,
    isFetching: isFetchingSelectedTickets,
    refetch: retrySelectedTickets,
  } = selectedTicketsQuery;
  const localTicketCategoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const ticket of localTickets.data?.tickets ?? []) {
      const code = ticket.categoryCode || "—";
      counts.set(code, (counts.get(code) ?? 0) + 1);
    }
    return Array.from(counts, ([categoryCode, count]) => ({
      categoryCode,
      count,
    }));
  }, [localTickets.data?.tickets]);
  const showTicket = Boolean(
    bookingId && activeEvent && localTickets.data && tab === "upcoming",
  );
  const allAccountBookings = profile
    ? (history?.pages.flatMap((page) => page.bookings) ?? [])
    : [];
  const knownEvents = [...(data?.upcoming ?? []), ...(data?.history ?? [])];
  const isPastBooking = (booking: MyBookingSummary) => {
    const event = knownEvents.find((item) => item.name === booking.eventName);
    const eventHasPassed = event?.startsAt
      ? Date.parse(event.startsAt) < serverClock.serverNow()
      : undefined;
    return (
      booking.status === "EXPIRED" ||
      booking.status === "CANCELLED" ||
      eventHasPassed === true
    );
  };
  const accountBookings = allAccountBookings.filter(
    (booking) => (tab === "past") === isPastBooking(booking),
  );
  const upcomingCount =
    allAccountBookings.filter((booking) => !isPastBooking(booking)).length +
    (showTicket && allAccountBookings.length === 0 ? 1 : 0);
  const pastCount = allAccountBookings.filter(isPastBooking).length;
  const handleDownload = async () => {
    if (!bookingId || !activeEvent) return;
    setDownloadError("");
    try {
      const tickets = localTickets.data?.tickets ?? [];
      if (!tickets.length) throw new Error("Tiket belum tersedia.");
      const qrPayloads = tickets.map((ticket) => ticket.qrPayload);
      await downloadTickets(
        bookingId,
        tickets.length,
        qrPayloads,
        activeEvent.name,
        tickets.map((ticket) => ticket.ticketCode),
      );
    } catch (error) {
      setDownloadError(
        error instanceof Error
          ? error.message
          : "E-tiket gagal disimpan. Coba lagi.",
      );
    }
  };

  const downloadSelectedBooking = async () => {
    if (!selectedBooking || !selectedTickets) return;
    setDownloadError("");
    try {
      const qrPayloads = selectedTickets.tickets.map(
        (ticket) => ticket.qrPayload,
      );
      await downloadTickets(
        selectedBooking.bookingId,
        qrPayloads.length,
        qrPayloads,
        selectedBooking.eventName,
        selectedTickets.tickets.map((ticket) => ticket.ticketCode),
      );
    } catch (error) {
      setDownloadError(
        error instanceof Error
          ? error.message
          : "E-tiket gagal disimpan. Coba lagi.",
      );
    }
  };

  const closeQr = useCallback(() => {
    setQrOpen(false);
    setSelectedBooking(null);
  }, []);

  useEffect(() => {
    if (!qrOpen || Platform.OS !== "android") return;
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        closeQr();
        return true;
      },
    );
    return () => subscription.remove();
  }, [closeQr, qrOpen]);

  const qrSheet = (
    <TicketQrSheet
      eventName={selectedBooking?.eventName ?? "QR Tiket Anda"}
      bookingId={selectedBooking?.bookingId ?? bookingId ?? "booking"}
      bookingSummary={selectedBooking ?? undefined}
      bookingTickets={
        selectedBooking
          ? (selectedTickets?.tickets ?? [])
          : (localTickets.data?.tickets ?? [])
      }
      isLoading={Boolean(selectedBooking && ticketsLoading)}
      isError={Boolean(selectedBooking && ticketsError)}
      errorMessage={
        selectedBooking && ticketsError
          ? apiErrorMessage(ticketsFailure)
          : localTickets.isError
            ? apiErrorMessage(localTickets.error)
            : undefined
      }
      isRetrying={
        selectedBooking ? isFetchingSelectedTickets : localTickets.isFetching
      }
      onRetry={() =>
        void (selectedBooking ? retrySelectedTickets() : localTickets.refetch())
      }
      downloadError={downloadError}
      onDownload={() =>
        void (selectedBooking ? downloadSelectedBooking() : handleDownload())
      }
      onClose={closeQr}
    />
  );

  let ticketListState: ReactNode = null;
  if (showTicket && activeEvent && accountBookings.length === 0) {
    ticketListState = (
      <TicketCard
        event={activeEvent}
        bookingId={bookingId ?? "booking"}
        amountMinor={localTickets.data?.amountMinor ?? amountMinor}
        ticketCount={localTickets.data?.tickets.length ?? ticketCount}
        categoryCounts={localTicketCategoryCounts}
        onOpenQr={() => setQrOpen(true)}
        onDownload={() => void handleDownload()}
        onShare={() =>
          void shareTickets(
            bookingId ?? "booking",
            localTickets.data?.tickets.length ?? 0,
            localTickets.data?.tickets.map((ticket) => ticket.ticketCode),
          )
        }
      />
    );
  } else if (!historyLoading && accountBookings.length === 0 && !showTicket) {
    ticketListState = (
      <EmptyTicketsState
        activeTab={tab}
        onBrowse={() => router.navigate("/browse" as Href)}
      />
    );
  } else if (historyLoading && !showTicket) {
    ticketListState = <Text style={screenStyles.loading}>Memuat tiket…</Text>;
  }

  let qrModal: ReactNode = null;
  if (qrOpen && Platform.OS === "web") {
    qrModal = (
      <Modal visible transparent animationType="fade" onRequestClose={closeQr}>
        {qrSheet}
      </Modal>
    );
  } else if (qrOpen) {
    qrModal = (
      <View style={[StyleSheet.absoluteFillObject, screenStyles.qrOverlay]}>
        {qrSheet}
      </View>
    );
  }

  return (
    <ScreenFade>
      <View style={screenStyles.root} testID="my-tickets-screen">
        <Header
          topInset={insets.top}
          showLinks={isWeb && width > 768}
          isLoggedIn={Boolean(profile)}
          links={navLinks}
          mobileMenuLinks={navLinks}
          onLogoPress={() => router.navigate("/" as Href)}
          onCtaPress={() => setLoginOpen(true)}
          actions={[]}
        />
        <ScrollView
          contentContainerStyle={ticketsScrollContent(
            insets.top,
            insets.bottom,
            isMobileWeb,
          )}
        >
          <Text
            accessibilityRole="header"
            style={[
              screenStyles.title,
              isMobileWeb && screenStyles.mobileWebTitle,
            ]}
          >
            Tiket Saya
          </Text>
          <Text style={screenStyles.description}>
            Daftar tiket event mendatang dan yang sudah lewat.
          </Text>

          <TicketTabs
            activeTab={tab}
            upcomingCount={upcomingCount}
            pastCount={pastCount}
            onChange={setTab}
          />

          {bookingId && (paymentStatus.isError || localTickets.isError) ? (
            <View
              className="my-3 items-center gap-2 border-2 border-black p-4"
              accessibilityLiveRegion="polite"
              testID="my-ticket-api-error"
            >
              <Text className="text-center text-sm">
                {apiErrorMessage(
                  paymentStatus.error ?? localTickets.error,
                  "Tiket belum dapat dimuat. Coba lagi.",
                )}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Coba muat tiket lagi"
                accessibilityState={{
                  disabled: paymentStatus.isFetching || localTickets.isFetching,
                }}
                disabled={paymentStatus.isFetching || localTickets.isFetching}
                onPress={() =>
                  void (paymentStatus.isError
                    ? paymentStatus.refetch()
                    : localTickets.refetch())
                }
                testID="my-ticket-api-retry"
                style={screenStyles.loadMore}
              >
                <Text style={screenStyles.loadMoreLabel}>
                  {paymentStatus.isFetching || localTickets.isFetching
                    ? "Memuat…"
                    : "Coba Lagi"}
                </Text>
              </Pressable>
            </View>
          ) : null}

          <View style={historyContainerStyle(isWeb)}>
            {historyError ? (
              <View
                accessibilityLiveRegion="polite"
                testID="booking-history-error"
              >
                <Text style={screenStyles.error}>
                  {apiErrorMessage(
                    historyFailure,
                    "Tiket gagal dimuat. Silakan coba lagi.",
                  )}
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Coba muat riwayat tiket lagi"
                  accessibilityState={{ disabled: isFetchingBookings }}
                  disabled={isFetchingBookings}
                  onPress={() => void retryBookings()}
                  testID="booking-history-retry"
                  style={screenStyles.loadMore}
                >
                  <Text style={screenStyles.loadMoreLabel}>
                    {isFetchingBookings ? "Memuat…" : "Coba Lagi"}
                  </Text>
                </Pressable>
              </View>
            ) : null}
            {accountBookings.map((booking) => (
              <View
                key={booking.bookingId}
                style={accountBookingColumnStyle(isWeb, width)}
              >
                <AccountBookingCard
                  booking={booking}
                  onOpenQr={(selected) => {
                    setSelectedBooking(selected);
                    setQrOpen(true);
                  }}
                />
              </View>
            ))}
            {hasNextPage && (
              <Pressable
                accessibilityRole="button"
                onPress={() => void fetchNextPage()}
                disabled={isFetchingNextPage}
                style={screenStyles.loadMore}
              >
                <Text style={screenStyles.loadMoreLabel}>
                  {isFetchingNextPage ? "Memuat…" : "Muat Tiket Lainnya"}
                </Text>
              </Pressable>
            )}
            {ticketListState}
            {downloadError ? (
              <Text
                accessibilityLiveRegion="polite"
                style={screenStyles.downloadError}
              >
                {downloadError}
              </Text>
            ) : null}
          </View>
        </ScrollView>

        {qrModal}
        <LoginModal
          visible={loginOpen}
          onClose={() => setLoginOpen(false)}
          onOpenPrivacy={() => router.push("/privacy" as Href)}
        />

        <BottomNav
          activeRoute="tickets"
          isLoggedIn={Boolean(profile)}
          onNavigate={(route) => navigateBottomTab(router, "tickets", route)}
        />
      </View>
    </ScreenFade>
  );
}
