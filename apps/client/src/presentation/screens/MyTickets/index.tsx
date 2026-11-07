import { useRouter, type Href } from "expo-router";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
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

import { BottomNav, Header } from "@presentation/components/design-system";
import { createPrimaryNavLinks } from "@presentation/components/design-system/primary-navigation";
import { LoginModal } from "@presentation/components/auth/LoginModal";
import { ScreenFade } from "@presentation/components/ScreenFade";
import { useEvents } from "@presentation/hooks/useEvents";
import { useETicketShare } from "@presentation/hooks/useETicketShare";
import { useETicketDownload } from "@presentation/hooks/useETicketDownload";
import { useSessionStore } from "@presentation/stores/session-store";
import { useAccountStore } from "@presentation/stores/account-store";
import { useServices } from "@providers/service-context";
import type { MyBookingSummary } from "@domain/repositories/ticket-history.repository";
import { useResponsive } from "@presentation/hooks/useResponsive";

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
  const { ticketHistoryRepository, paymentRepository, serverClock } =
    useServices();
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
    onHome: () => router.push("/" as Href),
    onBrowse: () => router.push("/browse" as Href),
    onTickets: () => undefined,
    onProfile: () => router.push("/profile" as Href),
    isLoggedIn: Boolean(profile),
  });
  const paymentStatus = useQuery({
    queryKey: ["my-ticket-payment-status", bookingId],
    queryFn: () => paymentRepository.getStatus(bookingId!, bookingId!),
    enabled: Boolean(bookingId),
  });
  const localTickets = useQuery({
    queryKey: ["booking-tickets", bookingId],
    queryFn: () => ticketHistoryRepository.getBookingTickets(bookingId!),
    enabled: Boolean(bookingId && paymentStatus.data?.status === "PAID"),
  });
  const showTicket = Boolean(
    bookingId && activeEvent && localTickets.data && tab === "upcoming",
  );
  const {
    data: history,
    isLoading: historyLoading,
    isError: historyError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["my-bookings", profile?.emailMasked],
    initialPageParam: undefined as string | undefined,
    queryFn: ({ pageParam }) =>
      ticketHistoryRepository.listMyBookings(
        pageParam,
        TICKET_HISTORY_PAGE_SIZE,
      ),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    enabled: Boolean(profile),
  });
  const {
    data: selectedTickets,
    isLoading: ticketsLoading,
    isError: ticketsError,
  } = useQuery({
    queryKey: ["my-booking-tickets", selectedBooking?.bookingId],
    queryFn: () =>
      ticketHistoryRepository.getBookingTickets(selectedBooking!.bookingId),
    enabled: Boolean(selectedBooking),
    retry: 1,
  });

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
      bookingId={bookingId ?? "booking"}
      bookingTickets={
        selectedBooking
          ? (selectedTickets?.tickets ?? [])
          : (localTickets.data?.tickets ?? [])
      }
      isLoading={Boolean(selectedBooking && ticketsLoading)}
      isError={Boolean(selectedBooking && ticketsError)}
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
        onBrowse={() => router.push("/browse" as Href)}
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
          onLogoPress={() => router.push("/" as Href)}
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

          <View style={historyContainerStyle(isWeb)}>
            {historyError ? (
              <Text accessibilityLiveRegion="polite" style={screenStyles.error}>
                Tiket gagal dimuat. Silakan coba lagi.
              </Text>
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
        <LoginModal visible={loginOpen} onClose={() => setLoginOpen(false)} />

        <BottomNav
          activeRoute="tickets"
          isLoggedIn={Boolean(profile)}
          onNavigate={(route) => {
            if (route === "home") router.push("/" as Href);
            if (route === "browse") router.push("/browse" as Href);
            if (route === "profile") router.push("/profile" as Href);
          }}
        />
      </View>
    </ScreenFade>
  );
}
