/**
 * RBT-043 — Waiting room screen (E5 Queue, FR-05/08).
 *
 *  "Brutalist Mono" implementation matching `06-waiting.html`:
 * - WHITE background, BLACK text/borders
 * - Plus Jakarta Sans font throughout
 * - SVG ring progress indicator (220px)
 * - Status badge with pulse animation
 * - Zone banners with semantic colors
 * - Estimated time in minute/second blocks
 * - Auto-redirect countdown (5s) with pulsing red background
 * - Leave confirmation modal
 * - Network status bar
 * - Loading overlay
 *
 * ARCHITECTURE: presentation only — consumes application/domain via the hooks;
 * no infrastructure import, no TanStack here (it lives in the hooks). Status is
 * never color-only: every zone/state carries an icon + text label (RBT-080 a11y).
 */
import { useFocusEffect, useRouter, type Href } from "expo-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ScrollView, View, type StyleProp, type ViewStyle } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  isAdmitted,
  isTerminal,
} from "@domain/state-machines/queue-state-machine";
import type { QueueEntry } from "@domain/repositories/queue.repository";
import {
  useAutoClaim,
  type ClaimErrorState,
} from "@presentation/hooks/useAutoClaim";
import { useRestoreBookingSession } from "@presentation/hooks/useBookingSession";
import { useQueuePolling } from "@presentation/hooks/useQueuePolling";
import { useResponsive } from "@presentation/hooks/useResponsive";

import {
  claimErrorBody,
  claimErrorActionLabel,
  claimErrorBadgeLabel,
  claimErrorTitle,
  COPY,
  terminalBody,
  terminalTitle,
} from "./display";
import type { WaitingRoomScreenProps } from "./interface";
import { styles } from "./style";
import { ErrorState } from "./fragments/ErrorState";
import { Header } from "./fragments/Header";
import { LeaveModal } from "./fragments/LeaveModal";
import { LoadingOverlay } from "./fragments/LoadingOverlay";
import { NetworkStatusBar } from "./fragments/NetworkStatusBar";
import { StatusBadge } from "./fragments/StatusBadge";
import { WaitingActive } from "./fragments/WaitingActive";
import { YourTurnState } from "./fragments/YourTurnState";
import { LeaveButton } from "./fragments/LeaveButton";
import {
  queueTimeout,
  waitingRoomLeft,
} from "@domain/rules/notification-flows";
import { ScheduleLocalNotification } from "@application/notifications/schedule-local-notification.use-case";
import { useServices } from "@providers/service-context";
import { apiErrorMessage } from "@presentation/utils/api-error-message";

// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Waiting room screen. Driven by `queueId`; renders the correct state view via
 * the RBT-040 state machine and the two merged hooks.
 */
export function WaitingRoomScreen({
  queueId,
  eventId,
}: WaitingRoomScreenProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion() ?? false;
  const { isDesktop, isMobileWeb, isNative } = useResponsive();
  const { notification } = useServices();
  const scheduleNotification = useMemo(
    () => new ScheduleLocalNotification(notification),
    [notification],
  );
  const shellStyle = [styles.shell, isMobileWeb && styles.mobileWebShell];

  // Modal state
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isScreenFocused, setIsScreenFocused] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsScreenFocused(true);
      return () => setIsScreenFocused(false);
    }, []),
  );

  const {
    entry,
    admissionRatePerMin,
    isLoading,
    isStatusAuthoritative,
    isError,
    isConnectionLost,
    isReconnected,
    error,
    leave,
    refetch,
  } = useQueuePolling(queueId, reducedMotion, eventId, isScreenFocused);

  // Only ADMITTED authorizes the claim (RBT-040). The hook fires it once.
  const admitted = entry !== undefined && isAdmitted(entry.status);
  const { claiming, claimedSessionId, errorState } = useAutoClaim({
    eventId,
    queueId,
    status: admitted && isStatusAuthoritative ? entry.status : undefined,
  });
  useEffect(() => {
    if (
      isNative &&
      isStatusAuthoritative &&
      (entry?.status === "MISSED" || errorState === "TURN_MISSED") &&
      eventId
    ) {
      void scheduleNotification
        .execute(queueTimeout(queueId, eventId))
        .catch(() => undefined);
    }
  }, [
    entry?.status,
    eventId,
    errorState,
    isNative,
    isStatusAuthoritative,
    queueId,
    scheduleNotification,
  ]);
  const claimed = entry?.status === "CLAIMED";
  const restoredBooking = useRestoreBookingSession(
    Boolean(claimed && !claiming && !claimedSessionId),
    undefined,
    eventId,
  );

  // A successful, server-authorized claim proceeds immediately to checkout.
  useEffect(() => {
    const sessionId = claimedSessionId ?? restoredBooking.session?.sessionId;
    if (sessionId) router.replace(`/checkout/${sessionId}` as Href);
  }, [claimedSessionId, restoredBooking.session?.sessionId, router]);

  const handleLeavePress = useCallback(() => {
    setShowLeaveModal(true);
  }, []);

  const handleStay = useCallback(() => {
    setShowLeaveModal(false);
  }, []);

  const handleConfirmLeave = useCallback(() => {
    void leave()
      .then(() => {
        setShowLeaveModal(false);
        if (eventId) {
          void scheduleNotification
            .execute(waitingRoomLeft(eventId))
            .catch(() => undefined);
        }
        router.replace("/" as Href);
      })
      .catch(() => {
        setShowLeaveModal(false);
        void refetch();
      });
  }, [eventId, leave, refetch, router, scheduleNotification]);

  const handleBrowseEvents = useCallback(() => {
    router.replace("/browse" as Href);
  }, [router]);

  const handleHome = useCallback(() => {
    router.replace("/" as Href);
  }, [router]);

  const handleRejoinQueue = useCallback(() => {
    if (eventId) {
      router.replace(`/events/${eventId}` as Href);
    } else {
      router.replace("/" as Href);
    }
  }, [eventId, router]);

  const handleRetryConnection = useCallback(() => {
    void refetch();
  }, [refetch]);

  const viewState = resolveWaitingViewState({
    isLoading,
    isError,
    isConnectionLost,
    queueId,
    entry,
    claimed,
    claiming,
    claimedSessionId,
    isRestoringClaimedSession: restoredBooking.isLoading,
    admitted,
    errorState,
  });

  return (
    <WaitingStateView
      state={viewState}
      queueId={queueId}
      eventId={eventId}
      entry={entry}
      error={error}
      errorState={errorState}
      restoredBooking={restoredBooking}
      admissionRatePerMin={admissionRatePerMin}
      claiming={claiming}
      isDesktop={isDesktop}
      isMobileWeb={isMobileWeb}
      isConnectionLost={isConnectionLost}
      isReconnected={isReconnected}
      shellStyle={shellStyle}
      bottomInset={insets.bottom}
      showLeaveModal={showLeaveModal}
      onRetryConnection={handleRetryConnection}
      onBrowseEvents={handleBrowseEvents}
      onHome={handleHome}
      onRejoinQueue={handleRejoinQueue}
      onLeavePress={handleLeavePress}
      onStay={handleStay}
      onConfirmLeave={handleConfirmLeave}
    />
  );
}

type WaitingViewState =
  | "loading"
  | "reconnecting"
  | "error"
  | "no-queue"
  | "claimed-recovering"
  | "claimed-recovery"
  | "terminal"
  | "claim-error"
  | "admitted"
  | "waiting";

interface WaitingViewStateInput {
  readonly isLoading: boolean;
  readonly isError: boolean;
  readonly isConnectionLost: boolean;
  readonly queueId: string;
  readonly entry?: QueueEntry;
  readonly claimed: boolean;
  readonly claiming: boolean;
  readonly claimedSessionId?: string;
  readonly isRestoringClaimedSession: boolean;
  readonly admitted: boolean;
  readonly errorState: ClaimErrorState | null;
}

function resolveWaitingViewState(
  input: WaitingViewStateInput,
): WaitingViewState {
  if (input.isLoading) return "loading";
  return resolveQueueAvailabilityState(input);
}

function resolveQueueAvailabilityState(
  input: WaitingViewStateInput,
): WaitingViewState {
  if (input.isConnectionLost && !input.entry) return "reconnecting";
  if (input.isError && !input.isConnectionLost && !input.claimed)
    return "error";
  if (!input.queueId) return "no-queue";
  if (!input.entry) return "error";
  return resolvePresentQueueState(input, input.entry);
}

function resolvePresentQueueState(
  input: WaitingViewStateInput,
  entry: QueueEntry,
): WaitingViewState {
  if (entry.status === "CLAIMED") {
    if (
      input.claiming ||
      input.claimedSessionId ||
      input.isRestoringClaimedSession
    ) {
      return "claimed-recovering";
    }
    return "claimed-recovery";
  }
  if (isTerminal(entry.status)) return "terminal";
  if (input.admitted && input.errorState) return "claim-error";
  if (input.admitted) return "admitted";
  return "waiting";
}

interface WaitingStateViewProps {
  readonly state: WaitingViewState;
  readonly queueId: string;
  readonly eventId: string;
  readonly entry?: QueueEntry;
  readonly error: Error | null;
  readonly errorState: ClaimErrorState | null;
  readonly restoredBooking: ReturnType<typeof useRestoreBookingSession>;
  readonly admissionRatePerMin?: number;
  readonly claiming: boolean;
  readonly isDesktop: boolean;
  readonly isMobileWeb: boolean;
  readonly isConnectionLost: boolean;
  readonly isReconnected: boolean;
  readonly shellStyle: StyleProp<ViewStyle>;
  readonly bottomInset: number;
  readonly showLeaveModal: boolean;
  readonly onRetryConnection: () => void;
  readonly onBrowseEvents: () => void;
  readonly onHome: () => void;
  readonly onRejoinQueue: () => void;
  readonly onLeavePress: () => void;
  readonly onStay: () => void;
  readonly onConfirmLeave: () => void;
}

function WaitingStateView(props: WaitingStateViewProps) {
  switch (props.state) {
    case "loading":
      return (
        <View style={styles.root} testID="waiting-loading">
          <Header />
          <LoadingOverlay />
        </View>
      );
    case "reconnecting":
      return (
        <ErrorPage
          testID="waiting-reconnecting"
          shellStyle={props.shellStyle}
          title="Menghubungkan Kembali"
          message="Posisi antrean tetap tersimpan. Kami akan memperbarui antrean saat koneksi pulih."
          buttonText="Coba Lagi"
          onPress={props.onRetryConnection}
          errorTestID="waiting-reconnecting-state"
          networkStatus={<NetworkStatusBar isOffline isReconnected={false} />}
        />
      );
    case "error":
      return (
        <ErrorPage
          testID="waiting-error"
          shellStyle={props.shellStyle}
          title={COPY.errorTitle}
          message={apiErrorMessage(props.error, COPY.errorSub)}
          buttonText="Coba Lagi"
          onPress={props.onRejoinQueue}
          errorTestID="waiting-error-state"
        />
      );
    case "no-queue":
      return (
        <ErrorPage
          testID="waiting-noqueue"
          shellStyle={props.shellStyle}
          title={COPY.noQueueTitle}
          message={COPY.noQueueSub}
          buttonText="Jelajahi Event"
          onPress={props.onBrowseEvents}
          errorTestID="waiting-noqueue-error"
        />
      );
    case "claimed-recovering":
      return (
        <View style={styles.root} testID="waiting-claim-recovering">
          <Header />
          <LoadingOverlay />
        </View>
      );
    case "claimed-recovery":
      return (
        <ClaimedRecoveryPage
          shellStyle={props.shellStyle}
          restoredBooking={props.restoredBooking}
          onHome={props.onHome}
        />
      );
    case "terminal":
      return (
        <TerminalQueuePage
          shellStyle={props.shellStyle}
          entry={props.entry}
          onBrowseEvents={props.onBrowseEvents}
        />
      );
    case "claim-error":
      return (
        <ClaimErrorPage
          shellStyle={props.shellStyle}
          errorState={props.errorState ?? "UNKNOWN"}
          onBrowseEvents={props.onBrowseEvents}
          onRejoinQueue={props.onRejoinQueue}
        />
      );
    case "admitted":
    case "waiting":
      return (
        <ActiveQueuePage {...props} admitted={props.state === "admitted"} />
      );
  }
}

interface ErrorPageProps {
  readonly testID: string;
  readonly shellStyle: StyleProp<ViewStyle>;
  readonly title: string;
  readonly message: string;
  readonly buttonText: string;
  readonly onPress: () => void;
  readonly errorTestID: string;
  readonly networkStatus?: ReactNode;
}

function ErrorPage({
  testID,
  shellStyle,
  title,
  message,
  buttonText,
  onPress,
  errorTestID,
  networkStatus,
}: ErrorPageProps) {
  return (
    <View style={styles.root} testID={testID}>
      <Header />
      <View style={shellStyle}>
        <View style={styles.waitingContainer}>
          <ErrorState
            icon="warning"
            title={title}
            message={message}
            buttonText={buttonText}
            onPress={onPress}
            testID={errorTestID}
          />
        </View>
      </View>
      {networkStatus}
    </View>
  );
}

interface ClaimedRecoveryPageProps {
  readonly shellStyle: StyleProp<ViewStyle>;
  readonly restoredBooking: ReturnType<typeof useRestoreBookingSession>;
  readonly onHome: () => void;
}

function ClaimedRecoveryPage({
  shellStyle,
  restoredBooking,
  onHome,
}: ClaimedRecoveryPageProps) {
  const hasError = Boolean(restoredBooking.error);
  let message =
    "Sesi antrean sudah diklaim, tetapi tidak ada sesi checkout aktif untuk event ini.";
  if (restoredBooking.error) {
    message = apiErrorMessage(
      restoredBooking.error,
      "Sesi checkout belum dapat dipulihkan. Periksa koneksi lalu coba lagi.",
    );
  }
  const onPress = () => {
    if (restoredBooking.error) void restoredBooking.retry();
    else onHome();
  };
  return (
    <View style={styles.root} testID="waiting-claimed-recovery">
      <Header />
      <View style={shellStyle}>
        <View style={styles.waitingContainer}>
          <StatusBadge variant="expired" label="Antrean perlu diperbarui" />
          <ErrorState
            icon="clock"
            title={
              hasError
                ? "Gagal memulihkan checkout"
                : "Sesi checkout tidak tersedia"
            }
            message={message}
            buttonText={hasError ? "Coba Lagi" : "Kembali ke Beranda"}
            onPress={onPress}
            testID="waiting-claimed-state"
          />
        </View>
      </View>
    </View>
  );
}

interface TerminalQueuePageProps {
  readonly shellStyle: StyleProp<ViewStyle>;
  readonly entry?: QueueEntry;
  readonly onBrowseEvents: () => void;
}

function TerminalQueuePage({
  shellStyle,
  entry,
  onBrowseEvents,
}: TerminalQueuePageProps) {
  const isSoldOut = entry?.status === "SOLD_OUT";
  const status = entry?.status ?? "ENDED";
  return (
    <View style={styles.root} testID="waiting-terminal">
      <Header />
      <View style={shellStyle}>
        <View style={styles.waitingContainer}>
          <StatusBadge
            variant={isSoldOut ? "soldOut" : "expired"}
            label={isSoldOut ? "Tiket Habis" : "Penjualan Berakhir"}
          />
          <ErrorState
            icon={isSoldOut ? "ticket" : "clock"}
            title={terminalTitle(status)}
            message={terminalBody(status)}
            buttonText="Jelajahi Event Lain"
            onPress={onBrowseEvents}
            testID={`waiting-${isSoldOut ? "soldout" : "ended"}-state`}
          />
        </View>
      </View>
    </View>
  );
}

interface ClaimErrorPageProps {
  readonly shellStyle: StyleProp<ViewStyle>;
  readonly errorState: ClaimErrorState;
  readonly onBrowseEvents: () => void;
  readonly onRejoinQueue: () => void;
}

function ClaimErrorPage({
  shellStyle,
  errorState,
  onBrowseEvents,
  onRejoinQueue,
}: ClaimErrorPageProps) {
  const isSoldOut = errorState === "EVENT_SOLD_OUT";
  const onPress =
    isSoldOut || errorState === "ADMISSION_TOKEN_INVALID"
      ? onBrowseEvents
      : onRejoinQueue;
  return (
    <View style={styles.root} testID="waiting-claim-error">
      <Header />
      <View style={shellStyle}>
        <View style={styles.waitingContainer}>
          <StatusBadge
            variant={isSoldOut ? "soldOut" : "expired"}
            label={claimErrorBadgeLabel(errorState)}
          />
          <ErrorState
            icon={isSoldOut ? "ticket" : "clock"}
            title={claimErrorTitle(errorState)}
            message={claimErrorBody(errorState)}
            buttonText={claimErrorActionLabel(errorState)}
            onPress={onPress}
            testID="waiting-claim-error-state"
          />
        </View>
      </View>
    </View>
  );
}

interface ActiveQueuePageProps {
  readonly entry?: QueueEntry;
  readonly eventId: string;
  readonly admissionRatePerMin?: number;
  readonly claiming: boolean;
  readonly isDesktop: boolean;
  readonly isMobileWeb: boolean;
  readonly isConnectionLost: boolean;
  readonly isReconnected: boolean;
  readonly bottomInset: number;
  readonly showLeaveModal: boolean;
  readonly onLeavePress: () => void;
  readonly onStay: () => void;
  readonly onConfirmLeave: () => void;
  readonly admitted: boolean;
}

function ActiveQueuePage(props: ActiveQueuePageProps) {
  const pageStyle = [
    styles.waitingPage,
    props.isDesktop && styles.waitingPageDesktop,
    !props.isDesktop && styles.waitingPageMobile,
    props.isMobileWeb && styles.mobileWebWaitingPage,
  ];
  const scrollContentStyle = [
    styles.waitingScroll,
    props.isDesktop && styles.waitingScrollDesktop,
    props.isMobileWeb && styles.mobileWebWaitingScroll,
  ];
  const entry = props.entry;
  const content = props.admitted ? (
    <YourTurnState
      onLeavePress={props.onLeavePress}
      claiming={props.claiming}
      eventId={props.eventId}
      isDesktop={props.isDesktop}
      isMobileWeb={props.isMobileWeb}
    />
  ) : (
    <WaitingActive
      position={entry?.position ?? 0}
      admissionRatePerMin={props.admissionRatePerMin}
      zone={entry?.zone ?? "GUARANTEED"}
      onLeavePress={props.onLeavePress}
      eventId={props.eventId}
      isDesktop={props.isDesktop}
      isMobileWeb={props.isMobileWeb}
    />
  );
  return (
    <View
      style={styles.root}
      testID={props.admitted ? "waiting-admitted" : "waiting-active"}
    >
      <Header status={props.admitted ? "GILIRAN ANDA" : undefined} />
      <ScrollView
        style={styles.waitingScrollView}
        contentContainerStyle={scrollContentStyle}
        showsVerticalScrollIndicator={false}
      >
        <View style={pageStyle}>{content}</View>
      </ScrollView>
      {!props.isDesktop && (
        <View
          style={[styles.mobilePinnedLeave, { bottom: props.bottomInset + 12 }]}
        >
          <LeaveButton onPress={props.onLeavePress} />
        </View>
      )}
      <LeaveModal
        visible={props.showLeaveModal}
        onStay={props.onStay}
        onLeave={props.onConfirmLeave}
      />
      <NetworkStatusBar
        isOffline={props.isConnectionLost}
        isReconnected={props.isReconnected}
      />
    </View>
  );
}

export default WaitingRoomScreen;
