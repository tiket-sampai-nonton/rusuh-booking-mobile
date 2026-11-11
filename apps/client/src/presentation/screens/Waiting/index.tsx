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
import { useCallback, useEffect, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  isAdmitted,
  isTerminal,
} from "@domain/state-machines/queue-state-machine";
import { useAutoClaim } from "@presentation/hooks/useAutoClaim";
import { useRestoreBookingSession } from "@presentation/hooks/useBookingSession";
import { useQueuePolling } from "@presentation/hooks/useQueuePolling";
import { useResponsive } from "@presentation/hooks/useResponsive";

import {
  claimErrorBody,
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
import { waitingRoomLeft } from "@domain/rules/notification-flows";
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
  const { isDesktop, isMobileWeb } = useResponsive();
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

  // ─────────────────────────────────────────────────────────────────────────────
  // LOADING STATE
  // ─────────────────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <View style={styles.root} testID="waiting-loading">
        <Header />
        <LoadingOverlay />
      </View>
    );
  }

  // Keep a queue with a transient network error mounted. The query retains
  // the server's last known position and continues its single adaptive poller;
  // a retry updates that same queue before admission/claim handling proceeds.
  if (isConnectionLost && !entry) {
    return (
      <View style={styles.root} testID="waiting-reconnecting">
        <Header />
        <View style={shellStyle}>
          <View style={styles.waitingContainer}>
            <ErrorState
              icon="warning"
              title="Menghubungkan Kembali"
              message="Posisi antrean tetap tersimpan. Kami akan memperbarui antrean saat koneksi pulih."
              buttonText="Coba Lagi"
              onPress={handleRetryConnection}
              testID="waiting-reconnecting-state"
            />
          </View>
        </View>
        <NetworkStatusBar isOffline isReconnected={false} />
      </View>
    );
  }

  if (isError && !isConnectionLost && !claimed) {
    return (
      <View style={styles.root} testID="waiting-error">
        <Header />
        <View style={shellStyle}>
          <View style={styles.waitingContainer}>
            <ErrorState
              icon="warning"
              title={COPY.errorTitle}
              message={apiErrorMessage(error, COPY.errorSub)}
              buttonText="Coba Lagi"
              onPress={handleRejoinQueue}
              testID="waiting-error-state"
            />
          </View>
        </View>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // NO QUEUE ID
  // ─────────────────────────────────────────────────────────────────────────────
  if (!queueId) {
    return (
      <View style={styles.root} testID="waiting-noqueue">
        <Header />
        <View style={shellStyle}>
          <View style={styles.waitingContainer}>
            <ErrorState
              icon="warning"
              title={COPY.noQueueTitle}
              message={COPY.noQueueSub}
              buttonText="Jelajahi Event"
              onPress={handleBrowseEvents}
              testID="waiting-noqueue-error"
            />
          </View>
        </View>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ERROR STATE
  // ─────────────────────────────────────────────────────────────────────────────
  if (!entry) {
    return (
      <View style={styles.root} testID="waiting-error">
        <Header />
        <View style={shellStyle}>
          <View style={styles.waitingContainer}>
            <ErrorState
              icon="warning"
              title={COPY.errorTitle}
              message={apiErrorMessage(error, COPY.errorSub)}
              buttonText="Coba Lagi"
              onPress={handleRejoinQueue}
              testID="waiting-error-state"
            />
          </View>
        </View>
      </View>
    );
  }

  // CLAIMED is a one-use state, not a waiting position. Restore the active
  // booking session and send the user back to checkout without showing the
  // stale "already used" state during claim recovery.
  if (entry.status === "CLAIMED") {
    if (claiming || claimedSessionId || restoredBooking.isLoading) {
      return (
        <View style={styles.root} testID="waiting-claim-recovering">
          <Header />
          <LoadingOverlay />
        </View>
      );
    }
    return (
      <View style={styles.root} testID="waiting-claimed-recovery">
        <Header />
        <View style={shellStyle}>
          <View style={styles.waitingContainer}>
            <StatusBadge variant="expired" label="Antrean perlu diperbarui" />
            <ErrorState
              icon="clock"
              title={
                restoredBooking.error
                  ? "Gagal memulihkan checkout"
                  : "Sesi checkout tidak tersedia"
              }
              message={
                restoredBooking.error
                  ? apiErrorMessage(
                      restoredBooking.error,
                      "Sesi checkout belum dapat dipulihkan. Periksa koneksi lalu coba lagi.",
                    )
                  : "Sesi antrean sudah diklaim, tetapi tidak ada sesi checkout aktif untuk event ini."
              }
              buttonText={
                restoredBooking.error ? "Coba Lagi" : "Kembali ke Beranda"
              }
              onPress={() => {
                if (restoredBooking.error) void restoredBooking.retry();
                else router.replace("/" as Href);
              }}
              testID="waiting-claimed-state"
            />
          </View>
        </View>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // TERMINAL STATE (sold-out, ended)
  // ─────────────────────────────────────────────────────────────────────────────
  if (isTerminal(entry.status)) {
    const isSoldOut = entry.status === "SOLD_OUT";
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
              title={terminalTitle(entry.status)}
              message={terminalBody(entry.status)}
              buttonText="Jelajahi Event Lain"
              onPress={handleBrowseEvents}
              testID={`waiting-${isSoldOut ? "soldout" : "ended"}-state`}
            />
          </View>
        </View>
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ADMITTED STATE (your turn - with auto-redirect)
  // ─────────────────────────────────────────────────────────────────────────────
  if (admitted) {
    // Check for claim error
    if (errorState) {
      const isSoldOut = errorState === "EVENT_SOLD_OUT";
      return (
        <View style={styles.root} testID="waiting-claim-error">
          <Header />
          <View style={shellStyle}>
            <View style={styles.waitingContainer}>
              <StatusBadge
                variant={isSoldOut ? "soldOut" : "expired"}
                label={
                  isSoldOut
                    ? "Tiket Habis"
                    : errorState === "UNKNOWN"
                      ? "Koneksi Bermasalah"
                      : errorState === "ADMISSION_TOKEN_INVALID"
                        ? "Sesi Antrean Berakhir"
                        : "Giliran Berakhir"
                }
              />
              <ErrorState
                icon={isSoldOut ? "ticket" : "clock"}
                title={claimErrorTitle(errorState)}
                message={claimErrorBody(errorState)}
                buttonText={
                  isSoldOut
                    ? "Jelajahi Event Lain"
                    : errorState === "UNKNOWN" ||
                        errorState === "ADMISSION_TOKEN_INVALID"
                      ? "Jelajahi Event Lain"
                      : "Bergabung Kembali"
                }
                onPress={
                  isSoldOut || errorState === "ADMISSION_TOKEN_INVALID"
                    ? handleBrowseEvents
                    : handleRejoinQueue
                }
                testID="waiting-claim-error-state"
              />
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.root} testID="waiting-admitted">
        <Header status="GILIRAN ANDA" />
        <ScrollView
          style={styles.waitingScrollView}
          contentContainerStyle={[
            styles.waitingScroll,
            isDesktop && styles.waitingScrollDesktop,
            isMobileWeb && styles.mobileWebWaitingScroll,
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.waitingPage,
              isDesktop && styles.waitingPageDesktop,
              !isDesktop && styles.waitingPageMobile,
              isMobileWeb && styles.mobileWebWaitingPage,
            ]}
          >
            <YourTurnState
              onLeavePress={handleLeavePress}
              claiming={claiming}
              eventId={eventId}
              isDesktop={isDesktop}
              isMobileWeb={isMobileWeb}
            />
          </View>
        </ScrollView>
        {!isDesktop && (
          <View
            style={[styles.mobilePinnedLeave, { bottom: insets.bottom + 12 }]}
          >
            <LeaveButton onPress={handleLeavePress} />
          </View>
        )}
        <LeaveModal
          visible={showLeaveModal}
          onStay={handleStay}
          onLeave={handleConfirmLeave}
        />
        <NetworkStatusBar
          isOffline={isConnectionLost}
          isReconnected={isReconnected}
        />
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ACTIVE WAITING STATE
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root} testID="waiting-active">
      <Header />
      <ScrollView
        style={styles.waitingScrollView}
        contentContainerStyle={[
          styles.waitingScroll,
          isDesktop && styles.waitingScrollDesktop,
          isMobileWeb && styles.mobileWebWaitingScroll,
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.waitingPage,
            isDesktop && styles.waitingPageDesktop,
            !isDesktop && styles.waitingPageMobile,
            isMobileWeb && styles.mobileWebWaitingPage,
          ]}
        >
          <WaitingActive
            position={entry.position}
            admissionRatePerMin={admissionRatePerMin}
            zone={entry.zone ?? "GUARANTEED"}
            onLeavePress={handleLeavePress}
            eventId={eventId}
            isDesktop={isDesktop}
            isMobileWeb={isMobileWeb}
          />
        </View>
      </ScrollView>
      {!isDesktop && (
        <View
          style={[styles.mobilePinnedLeave, { bottom: insets.bottom + 12 }]}
        >
          <LeaveButton onPress={handleLeavePress} />
        </View>
      )}
      <LeaveModal
        visible={showLeaveModal}
        onStay={handleStay}
        onLeave={handleConfirmLeave}
      />
      <NetworkStatusBar
        isOffline={isConnectionLost}
        isReconnected={isReconnected}
      />
    </View>
  );
}

export default WaitingRoomScreen;
