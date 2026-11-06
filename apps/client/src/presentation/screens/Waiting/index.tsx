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
import { useRouter, type Href } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

import {
  isAdmitted,
  isTerminal,
} from "@domain/state-machines/queue-state-machine";
import { useAutoClaim } from "@presentation/hooks/useAutoClaim";
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
  const reducedMotion = useReducedMotion() ?? false;
  const { isDesktop, isMobileWeb } = useResponsive();
  const shellStyle = [styles.shell, isMobileWeb && styles.mobileWebShell];

  // Modal state
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  const {
    entry,
    admissionRatePerMin,
    isLoading,
    isError,
    isConnectionLost,
    isReconnected,
    error,
    leave,
    refetch,
  } = useQueuePolling(queueId, reducedMotion, eventId);

  // Only ADMITTED authorizes the claim (RBT-040). The hook fires it once.
  const admitted = entry !== undefined && isAdmitted(entry.status);
  const { claiming, claimedSessionId, errorState } = useAutoClaim({
    eventId,
    status: admitted ? entry.status : undefined,
  });

  // A successful, server-authorized claim proceeds immediately to checkout.
  useEffect(() => {
    if (claimedSessionId)
      router.replace(`/checkout/${claimedSessionId}` as Href);
  }, [claimedSessionId, router]);

  const handleLeavePress = useCallback(() => {
    setShowLeaveModal(true);
  }, []);

  const handleStay = useCallback(() => {
    setShowLeaveModal(false);
  }, []);

  const handleConfirmLeave = useCallback(() => {
    setShowLeaveModal(false);
    void leave();
    router.replace("/" as Href);
  }, [leave, router]);

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

  if (isError && !isConnectionLost) {
    return (
      <View style={styles.root} testID="waiting-error">
        <Header />
        <View style={shellStyle}>
          <View style={styles.waitingContainer}>
            <ErrorState
              icon="warning"
              title={COPY.errorTitle}
              message={error?.message ?? COPY.errorSub}
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
              message={error?.message ?? COPY.errorSub}
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
                label={isSoldOut ? "Tiket Habis" : "Giliran Berakhir"}
              />
              <ErrorState
                icon={isSoldOut ? "ticket" : "clock"}
                title={claimErrorTitle(errorState)}
                message={claimErrorBody(errorState)}
                buttonText={
                  isSoldOut ? "Jelajahi Event Lain" : "Bergabung Kembali"
                }
                onPress={isSoldOut ? handleBrowseEvents : handleRejoinQueue}
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
