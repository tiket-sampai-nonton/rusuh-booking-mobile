import { useRouter, type Href } from "expo-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

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
import {
  ticketsScrollContent,
  screenStyles,
  historyContainerStyle,
  accountBookingColumnStyle,
} from "./style";
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
import type { EventSummary } from "@domain/repositories/event.repository";
import { useResponsive } from "@presentation/hooks/useResponsive";
import { apiErrorMessage } from "@presentation/utils/api-error-message";

import { TICKET_HISTORY_PAGE_SIZE } from "./constants";

function getTicketErrorMessage(
  hasSelectedTicketError: boolean,
  selectedTicketError: unknown,
  hasLocalTicketError: boolean,
  localTicketError: unknown,
): string | undefined {
  if (hasSelectedTicketError) return apiErrorMessage(selectedTicketError);
  if (hasLocalTicketError) return apiErrorMessage(localTicketError);
  return undefined;
}

function bookingIsPast(
  booking: MyBookingSummary,
  events: readonly EventSummary[],
  now: number,
): boolean {
  const event = events.find((item) => item.name === booking.eventName);
  const eventHasPassed = event?.startsAt
    ? Date.parse(event.startsAt) < now
    : undefined;
  return (
    booking.status === "EXPIRED" ||
    booking.status === "CANCELLED" ||
    eventHasPassed === true
  );
}

interface BookingHistoryPage {
  readonly bookings: readonly MyBookingSummary[];
}

function accountBookingHistory(
  isSignedIn: boolean,
  pages: readonly BookingHistoryPage[] | undefined,
): MyBookingSummary[] {
  return isSignedIn ? (pages?.flatMap((page) => page.bookings) ?? []) : [];
}

function shouldShowLocalTicket(
  bookingId: string | undefined,
  activeEvent: EventSummary | undefined,
  hasTicketData: boolean,
  activeTab: TicketTab,
): boolean {
  return Boolean(
    bookingId && activeEvent && hasTicketData && activeTab === "upcoming",
  );
}

function bookingsForTab(
  bookings: readonly MyBookingSummary[],
  activeTab: TicketTab,
  isPastBooking: (booking: MyBookingSummary) => boolean,
): MyBookingSummary[] {
  return bookings.filter(
    (booking) => (activeTab === "past") === isPastBooking(booking),
  );
}

function countUpcomingBookings(
  bookings: readonly MyBookingSummary[],
  isPastBooking: (booking: MyBookingSummary) => boolean,
  showLocalTicket: boolean,
): number {
  const bookingCount = bookings.filter(
    (booking) => !isPastBooking(booking),
  ).length;
  return bookingCount + (showLocalTicket && bookings.length === 0 ? 1 : 0);
}

function loadingLabel(isLoading: boolean): string {
  return isLoading ? "Memuat…" : "Coba Lagi";
}

function shouldShowTicketLoadError(
  bookingId: string | undefined,
  paymentError: boolean,
  ticketError: boolean,
): boolean {
  return Boolean(bookingId && (paymentError || ticketError));
}

function showDesktopHeaderLinks(isWeb: boolean, width: number): boolean {
  return isWeb && width > 768;
}

interface TicketListStateInput {
  readonly showTicket: boolean;
  readonly hasActiveEvent: boolean;
  readonly accountBookingCount: number;
  readonly historyLoading: boolean;
  readonly activeTab: TicketTab;
  readonly ticketCard: ReactNode;
  readonly onBrowse: () => void;
}

function ticketListStateContent(input: TicketListStateInput): ReactNode {
  if (
    input.showTicket &&
    input.hasActiveEvent &&
    input.accountBookingCount === 0
  ) {
    return input.ticketCard;
  }
  if (
    !input.historyLoading &&
    input.accountBookingCount === 0 &&
    !input.showTicket
  ) {
    return (
      <EmptyTicketsState
        activeTab={input.activeTab}
        onBrowse={input.onBrowse}
      />
    );
  }
  if (input.historyLoading && !input.showTicket) {
    return <Text style={screenStyles.loading}>Memuat tiket…</Text>;
  }
  return null;
}

function ticketQrModalContent(
  isOpen: boolean,
  platform: typeof Platform.OS,
  onClose: () => void,
  sheet: ReactNode,
): ReactNode {
  if (isOpen && platform === "web") {
    return (
      <Modal visible transparent animationType="fade" onRequestClose={onClose}>
        {sheet}
      </Modal>
    );
  }
  if (isOpen) {
    return (
      <View style={[StyleSheet.absoluteFillObject, screenStyles.qrOverlay]}>
        {sheet}
      </View>
    );
  }
  return null;
}

interface MyTicketApiErrorPanelProps {
  readonly visible: boolean;
  readonly error: unknown;
  readonly isRetrying: boolean;
  readonly retryLabel: string;
  readonly onRetry: () => void;
}

function MyTicketApiErrorPanel({
  visible,
  error,
  isRetrying,
  retryLabel,
  onRetry,
}: MyTicketApiErrorPanelProps) {
  if (!visible) return null;
  return (
    <View
      className="my-3 items-center gap-2 border-2 border-ink p-4"
      accessibilityLiveRegion="polite"
      testID="my-ticket-api-error"
    >
      <Text className="text-center text-sm">
        {apiErrorMessage(error, "Tiket belum dapat dimuat. Coba lagi.")}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Coba muat tiket lagi"
        accessibilityState={{ disabled: isRetrying }}
        disabled={isRetrying}
        onPress={onRetry}
        testID="my-ticket-api-retry"
        style={screenStyles.loadMore}
      >
        <Text style={screenStyles.loadMoreLabel}>{retryLabel}</Text>
      </Pressable>
    </View>
  );
}

interface MyTicketsHistoryProps {
  readonly isWeb: boolean;
  readonly width: number;
  readonly historyError: boolean;
  readonly historyFailure: unknown;
  readonly isFetchingBookings: boolean;
  readonly historyRetryLabel: string;
  readonly retryBookings: () => unknown;
  readonly accountBookings: readonly MyBookingSummary[];
  readonly onOpenBooking: (booking: MyBookingSummary) => void;
  readonly hasNextPage: boolean;
  readonly isFetchingNextPage: boolean;
  readonly fetchNextPage: () => unknown;
  readonly ticketListState: ReactNode;
  readonly downloadError: string;
}

function MyTicketsHistory({
  isWeb,
  width,
  historyError,
  historyFailure,
  isFetchingBookings,
  historyRetryLabel,
  retryBookings,
  accountBookings,
  onOpenBooking,
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  ticketListState,
  downloadError,
}: MyTicketsHistoryProps) {
  return (
    <View style={historyContainerStyle(isWeb)}>
      {historyError ? (
        <View accessibilityLiveRegion="polite" testID="booking-history-error">
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
            <Text style={screenStyles.loadMoreLabel}>{historyRetryLabel}</Text>
          </Pressable>
        </View>
      ) : null}
      {accountBookings.map((booking) => (
        <View
          key={booking.bookingId}
          style={accountBookingColumnStyle(isWeb, width)}
        >
          <AccountBookingCard booking={booking} onOpenQr={onOpenBooking} />
        </View>
      ))}
      {hasNextPage ? (
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
      ) : null}
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
  );
}

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
  const showTicket = shouldShowLocalTicket(
    bookingId,
    activeEvent,
    Boolean(localTickets.data),
    tab,
  );
  const allAccountBookings = accountBookingHistory(
    Boolean(profile),
    history?.pages,
  );
  const knownEvents = [...(data?.upcoming ?? []), ...(data?.history ?? [])];
  const now = serverClock.serverNow();
  const isPastBooking = (booking: MyBookingSummary) =>
    bookingIsPast(booking, knownEvents, now);
  const accountBookings = bookingsForTab(
    allAccountBookings,
    tab,
    isPastBooking,
  );
  const upcomingCount = countUpcomingBookings(
    allAccountBookings,
    isPastBooking,
    showTicket,
  );
  const pastCount = allAccountBookings.filter(isPastBooking).length;
  const isTicketRetrying = paymentStatus.isFetching || localTickets.isFetching;
  const ticketRetryLabel = loadingLabel(isTicketRetrying);
  const retryTicketLoad = paymentStatus.isError
    ? paymentStatus.refetch
    : localTickets.refetch;
  const historyRetryLabel = loadingLabel(isFetchingBookings);
  const showTicketLoadError = shouldShowTicketLoadError(
    bookingId,
    paymentStatus.isError,
    localTickets.isError,
  );
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
  const handleOpenBooking = useCallback((booking: MyBookingSummary) => {
    setSelectedBooking(booking);
    setQrOpen(true);
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
      errorMessage={getTicketErrorMessage(
        Boolean(selectedBooking && ticketsError),
        ticketsFailure,
        localTickets.isError,
        localTickets.error,
      )}
      isRetrying={
        selectedBooking ? isFetchingSelectedTickets : localTickets.isFetching
      }
      onRetry={() =>
        selectedBooking ? retrySelectedTickets() : localTickets.refetch()
      }
      downloadError={downloadError}
      onDownload={() =>
        selectedBooking ? downloadSelectedBooking() : handleDownload()
      }
      onClose={closeQr}
    />
  );

  const ticketCard = activeEvent ? (
    <TicketCard
      event={activeEvent}
      bookingId={bookingId ?? "booking"}
      amountMinor={localTickets.data?.amountMinor ?? amountMinor}
      ticketCount={localTickets.data?.tickets.length ?? ticketCount}
      categoryCounts={localTicketCategoryCounts}
      onOpenQr={() => setQrOpen(true)}
      onDownload={() => handleDownload()}
      onShare={() =>
        shareTickets(
          bookingId ?? "booking",
          localTickets.data?.tickets.length ?? 0,
          localTickets.data?.tickets.map((ticket) => ticket.ticketCode),
        )
      }
    />
  ) : null;
  const ticketListState = ticketListStateContent({
    showTicket,
    hasActiveEvent: Boolean(activeEvent),
    accountBookingCount: accountBookings.length,
    historyLoading,
    activeTab: tab,
    ticketCard,
    onBrowse: () => router.navigate("/browse" as Href),
  });
  const qrModal = ticketQrModalContent(qrOpen, Platform.OS, closeQr, qrSheet);

  return (
    <ScreenFade>
      <View style={screenStyles.root} testID="my-tickets-screen">
        <Header
          topInset={insets.top}
          showLinks={showDesktopHeaderLinks(isWeb, width)}
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

          <MyTicketApiErrorPanel
            visible={showTicketLoadError}
            error={paymentStatus.error ?? localTickets.error}
            isRetrying={isTicketRetrying}
            retryLabel={ticketRetryLabel}
            onRetry={() => void retryTicketLoad()}
          />

          <MyTicketsHistory
            isWeb={isWeb}
            width={width}
            historyError={historyError}
            historyFailure={historyFailure}
            isFetchingBookings={isFetchingBookings}
            historyRetryLabel={historyRetryLabel}
            retryBookings={retryBookings}
            accountBookings={accountBookings}
            onOpenBooking={handleOpenBooking}
            hasNextPage={hasNextPage}
            isFetchingNextPage={isFetchingNextPage}
            fetchNextPage={fetchNextPage}
            ticketListState={ticketListState}
            downloadError={downloadError}
          />
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
