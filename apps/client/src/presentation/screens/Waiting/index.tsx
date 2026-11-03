/**
 * RBT-043 — Waiting room screen (E5 Queue, FR-05/08).
 *
 * V2 "Brutalist Mono" implementation matching `06-waiting.html`:
 * - WHITE background, BLACK text/borders
 * - JetBrains Mono font throughout
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
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { isAdmitted, isTerminal } from "@domain/state-machines/queue-state-machine";
import { useAutoClaim } from "@presentation/hooks/useAutoClaim";
import { useQueuePolling } from "@presentation/hooks/useQueuePolling";

import {
  claimErrorBody,
  claimErrorTitle,
  COPY,
  formatCount,
  ringProgress,
  terminalBody,
  terminalTitle,
  zoneCopy,
} from "./display";
import type {
  WaitingRoomScreenProps,
} from "./interface";
import {
  palette,
  styles,
  ZONE_STYLE,
  RING_SIZE,
  RING_RADIUS,
  RING_STROKE,
  RING_CIRCUMFERENCE,
} from "./style";

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const REDIRECT_COUNTDOWN_SECONDS = 5;
const ADMISSION_RATE_PER_MIN = 1400; // ~23/sec

// ═══════════════════════════════════════════════════════════════════════════════
// HEADER
// ═══════════════════════════════════════════════════════════════════════════════

function Header() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <Pressable onPress={() => router.push("/" as Href)}>
        <Text style={styles.logo}>
          Rusuh<Text style={styles.logoAccent}>Tiket</Text>
        </Text>
      </Pressable>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATUS BADGE (with pulse animation matching prototype)
// ═══════════════════════════════════════════════════════════════════════════════

type BadgeVariant = "queue" | "yourTurn" | "soldOut" | "expired" | "offline" | "paused";

function StatusBadge({
  variant,
  label,
}: {
  readonly variant: BadgeVariant;
  readonly label: string;
}) {
  const reducedMotion = useReducedMotion() ?? false;
  const opacity = useSharedValue(1);

  // Pulse animation for "queue" variant (prototype: animation: pulse 2s infinite)
  useEffect(() => {
    if (variant === "queue" && !reducedMotion) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1, // infinite
        false
      );
    } else {
      opacity.value = 1;
    }
    return () => {
      cancelAnimation(opacity);
    };
  }, [variant, reducedMotion, opacity]);

  // Blink animation for "offline" variant (prototype: animation: blink 1s infinite)
  useEffect(() => {
    if (variant === "offline" && !reducedMotion) {
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.3, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        false
      );
    }
  }, [variant, reducedMotion, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const badgeStyle = [
    styles.statusBadge,
    variant === "yourTurn" && styles.statusBadgeYourTurn,
    (variant === "soldOut" || variant === "expired") && styles.statusBadgeSoldOut,
    (variant === "offline" || variant === "paused") && styles.statusBadgeOffline,
  ];

  return (
    <Animated.View style={[badgeStyle, animatedStyle]} testID="waiting-status-badge">
      <Text style={styles.statusBadgeText}>{label}</Text>
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SVG RING PROGRESS
// ═══════════════════════════════════════════════════════════════════════════════

interface RingProgressProps {
  readonly progress: number; // 0..1
  readonly position: number;
  readonly isWarning?: boolean;
}

function RingProgress({ progress, position, isWarning = false }: RingProgressProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  // strokeDashoffset: full circumference = 0% progress, 0 = 100% progress
  const offset = RING_CIRCUMFERENCE * (1 - clamped);
  const strokeColor = isWarning || position <= 10 ? palette.red : palette.ink;

  return (
    <View style={styles.ringWrap} testID="waiting-ring">
      <Svg
        width={RING_SIZE}
        height={RING_SIZE}
        viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
        style={{ transform: [{ rotate: "-90deg" }] }}
      >
        {/* Background track */}
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke={palette.ringBg}
          strokeWidth={RING_STROKE}
        />
        {/* Progress arc */}
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke={strokeColor}
          strokeWidth={RING_STROKE}
          strokeDasharray={RING_CIRCUMFERENCE}
          strokeDashoffset={offset}
          strokeLinecap="square"
        />
      </Svg>
      <View style={styles.ringCenter}>
        <Text
          style={styles.position}
          testID="waiting-position"
          accessibilityLabel={`Posisi nomor ${position}`}
        >
          {formatCount(position)}
        </Text>
        <Text style={styles.positionLabel}>Your Position</Text>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ZONE BANNER
// ═══════════════════════════════════════════════════════════════════════════════

function ZoneBanner({ zone }: { readonly zone: string }) {
  const copy = zoneCopy(zone as "GUARANTEED" | "POSSIBLE" | "NOT_ENOUGH");
  const tone = ZONE_STYLE[copy.tone];

  return (
    <View
      testID="waiting-zone"
      accessibilityLiveRegion="polite"
      style={[styles.zone, { backgroundColor: tone.bg, borderColor: tone.border }]}
    >
      <Text style={styles.zoneIcon}>{copy.icon}</Text>
      <View style={styles.zoneTextWrap}>
        <Text style={[styles.zoneLabel, { color: tone.text }]}>{copy.label}</Text>
        <Text style={[styles.zoneBody, { color: tone.text }]}>{copy.body}</Text>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ESTIMATED TIME
// ═══════════════════════════════════════════════════════════════════════════════

function EstimatedTime({ position }: { readonly position: number }) {
  const totalSeconds = Math.ceil((position / ADMISSION_RATE_PER_MIN) * 60);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return (
    <View style={styles.estimatedTime} testID="waiting-eta">
      <View style={styles.timeBlock}>
        <Text style={styles.timeValue}>{String(minutes).padStart(2, "0")}</Text>
        <Text style={styles.timeLabel}>Minutes</Text>
      </View>
      <View style={styles.timeBlock}>
        <Text style={styles.timeValue}>{String(seconds).padStart(2, "0")}</Text>
        <Text style={styles.timeLabel}>Seconds</Text>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// REDIRECT COUNTDOWN (with pulsing background animation)
// ═══════════════════════════════════════════════════════════════════════════════

function RedirectCountdown({
  seconds,
  onComplete,
}: {
  readonly seconds: number;
  readonly onComplete: () => void;
}) {
  const [countdown, setCountdown] = useState(seconds);
  const reducedMotion = useReducedMotion() ?? false;
  const bgOpacity = useSharedValue(1);

  // Pulse background animation (prototype: @keyframes pulseBackground)
  useEffect(() => {
    if (!reducedMotion) {
      bgOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        false
      );
    }
    return () => {
      cancelAnimation(bgOpacity);
    };
  }, [reducedMotion, bgOpacity]);

  useEffect(() => {
    if (countdown <= 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, onComplete]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  return (
    <Animated.View style={[styles.redirectCountdown, animatedStyle]} testID="waiting-redirect">
      <Text style={styles.redirectTitle}>🎉 It's Your Turn!</Text>
      <Text style={styles.redirectNumber}>{countdown}</Text>
      <Text style={styles.redirectText}>Redirecting to ticket selection...</Text>
    </Animated.View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEAVE CONFIRMATION MODAL
// ═══════════════════════════════════════════════════════════════════════════════

function LeaveModal({
  visible,
  onStay,
  onLeave,
}: {
  readonly visible: boolean;
  readonly onStay: () => void;
  readonly onLeave: () => void;
}) {
  if (!visible) return null;

  return (
    <View style={styles.modalOverlay} testID="waiting-leave-modal">
      <View style={styles.modal}>
        <Text style={styles.modalTitle}>⚠️ Leave Queue?</Text>
        <Text style={styles.modalText}>
          If you leave now, you will lose your position in the queue and will
          need to rejoin from the back.
        </Text>
        <View style={styles.modalActions}>
          <Pressable style={styles.modalBtnStay} onPress={onStay}>
            <Text style={styles.modalBtnStayText}>Stay in Queue</Text>
          </Pressable>
          <Pressable style={styles.modalBtnLeave} onPress={onLeave}>
            <Text style={styles.modalBtnLeaveText}>Leave Queue</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// NETWORK STATUS BAR
// ═══════════════════════════════════════════════════════════════════════════════

function NetworkStatusBar({
  isOffline,
  isReconnected,
}: {
  readonly isOffline: boolean;
  readonly isReconnected: boolean;
}) {
  if (!isOffline && !isReconnected) return null;

  return (
    <View
      style={[
        styles.networkStatus,
        isReconnected && styles.networkStatusReconnected,
      ]}
      testID="waiting-network-status"
    >
      <Text style={styles.networkStatusText}>
        {isReconnected
          ? "Reconnected! Resuming queue..."
          : "Connection lost. Your position is being held..."}
      </Text>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOADING OVERLAY
// ═══════════════════════════════════════════════════════════════════════════════

function LoadingOverlay() {
  return (
    <View style={styles.loadingOverlay} testID="waiting-loading-overlay">
      <ActivityIndicator size="large" color={palette.ink} />
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEAVE BUTTON
// ═══════════════════════════════════════════════════════════════════════════════

function LeaveButton({ onPress }: { readonly onPress: () => void }) {
  return (
    <Pressable
      style={styles.leaveBtn}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Leave Queue"
      testID="waiting-leave"
    >
      <Text style={styles.leaveBtnText}>Leave Queue</Text>
    </Pressable>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ERROR STATES
// ═══════════════════════════════════════════════════════════════════════════════

function ErrorState({
  icon,
  title,
  message,
  buttonText,
  onPress,
  testID,
}: {
  readonly icon: string;
  readonly title: string;
  readonly message: string;
  readonly buttonText: string;
  readonly onPress: () => void;
  readonly testID: string;
}) {
  return (
    <View style={styles.errorState} testID={testID}>
      <Text style={styles.errorTitle}>
        {icon} {title}
      </Text>
      <Text style={styles.errorText}>{message}</Text>
      <Pressable style={styles.errorBtn} onPress={onPress}>
        <Text style={styles.errorBtnText}>{buttonText}</Text>
      </Pressable>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ACTIVE WAITING STATE
// ═══════════════════════════════════════════════════════════════════════════════

interface WaitingActiveProps {
  readonly position: number;
  readonly zone: string;
  readonly onLeavePress: () => void;
}

function WaitingActive({ position, zone, onLeavePress }: WaitingActiveProps) {
  const progress = ringProgress(position);

  return (
    <>
      <StatusBadge variant="queue" label="In Queue" />

      <RingProgress
        progress={progress}
        position={position}
        isWarning={position <= 10}
      />

      <ZoneBanner zone={zone} />

      <EstimatedTime position={position} />

      <Text style={styles.infoText}>
        Please keep this page open. Your position is automatically updated. Do
        not refresh or leave this page, or you will lose your spot.
      </Text>

      <LeaveButton onPress={onLeavePress} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// YOUR TURN STATE (with auto-redirect countdown)
// ═══════════════════════════════════════════════════════════════════════════════

interface YourTurnStateProps {
  readonly onRedirect: () => void;
  readonly onLeavePress: () => void;
  readonly claiming: boolean;
}

function YourTurnState({ onRedirect, onLeavePress, claiming }: YourTurnStateProps) {
  return (
    <>
      <StatusBadge variant="yourTurn" label="It's Your Turn!" />

      <RingProgress progress={1} position={0} />

      <RedirectCountdown
        seconds={REDIRECT_COUNTDOWN_SECONDS}
        onComplete={onRedirect}
      />

      {claiming && (
        <View style={styles.prep}>
          <ActivityIndicator color={palette.green} />
          <Text style={styles.prepText}>{COPY.admitSub}</Text>
        </View>
      )}

      <LeaveButton onPress={onLeavePress} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN SCREEN
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Waiting room screen. Driven by `queueId`; renders the correct state view via
 * the RBT-040 state machine and the two merged hooks.
 */
export function WaitingRoomScreen({ queueId, eventId }: WaitingRoomScreenProps) {
  const router = useRouter();
  const reducedMotion = useReducedMotion() ?? false;

  // Modal state
  const [showLeaveModal, setShowLeaveModal] = useState(false);

  // Network state (simplified - could be enhanced with real network detection)
  const [isOffline] = useState(false);
  const [isReconnected] = useState(false);

  const { entry, isLoading, isError, error, leave } = useQueuePolling(
    queueId,
    reducedMotion,
  );

  // Only ADMITTED authorizes the claim (RBT-040). The hook fires it once.
  const admitted = entry !== undefined && isAdmitted(entry.status);
  const { claiming, claimedSessionId, errorState } = useAutoClaim({
    eventId,
    status: admitted ? entry.status : undefined,
  });

  // Redirect to checkout on successful claim
  const handleRedirect = useCallback(() => {
    if (claimedSessionId) {
      router.replace(`/checkout/${claimedSessionId}` as Href);
    }
  }, [claimedSessionId, router]);

  useEffect(() => {
    if (claimedSessionId) {
      // Auto-redirect handled by RedirectCountdown component
    }
  }, [claimedSessionId]);

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

  // ─────────────────────────────────────────────────────────────────────────────
  // NO QUEUE ID
  // ─────────────────────────────────────────────────────────────────────────────
  if (!queueId) {
    return (
      <View style={styles.root} testID="waiting-noqueue">
        <Header />
        <View style={styles.shell}>
          <View style={styles.waitingContainer}>
            <ErrorState
              icon="❓"
              title={COPY.noQueueTitle}
              message={COPY.noQueueSub}
              buttonText="Browse Events"
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
  if (isError || !entry) {
    return (
      <View style={styles.root} testID="waiting-error">
        <Header />
        <View style={styles.shell}>
          <View style={styles.waitingContainer}>
            <ErrorState
              icon="⚠️"
              title={COPY.errorTitle}
              message={error?.message ?? COPY.errorSub}
              buttonText="Try Again"
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
        <View style={styles.shell}>
          <View style={styles.waitingContainer}>
            <StatusBadge
              variant={isSoldOut ? "soldOut" : "expired"}
              label={isSoldOut ? "Sold Out" : "Sale Ended"}
            />
            <ErrorState
              icon={isSoldOut ? "😔" : "⏰"}
              title={terminalTitle(entry.status)}
              message={terminalBody(entry.status)}
              buttonText="Browse Other Events"
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
          <View style={styles.shell}>
            <View style={styles.waitingContainer}>
              <StatusBadge
                variant={isSoldOut ? "soldOut" : "expired"}
                label={isSoldOut ? "Sold Out" : "Turn Expired"}
              />
              <ErrorState
                icon={isSoldOut ? "😔" : "⏱️"}
                title={claimErrorTitle(errorState)}
                message={claimErrorBody(errorState)}
                buttonText={isSoldOut ? "Browse Other Events" : "Rejoin Queue"}
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
        <Header />
        <View style={styles.shell}>
          <View style={styles.waitingContainer}>
            <YourTurnState
              onRedirect={handleRedirect}
              onLeavePress={handleLeavePress}
              claiming={claiming}
            />
          </View>
        </View>
        <LeaveModal
          visible={showLeaveModal}
          onStay={handleStay}
          onLeave={handleConfirmLeave}
        />
        <NetworkStatusBar isOffline={isOffline} isReconnected={isReconnected} />
      </View>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ACTIVE WAITING STATE
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <View style={styles.root} testID="waiting-active">
      <Header />
      <View style={styles.shell}>
        <View style={styles.waitingContainer}>
          <WaitingActive
            position={entry.position}
            zone={entry.zone ?? "GUARANTEED"}
            onLeavePress={handleLeavePress}
          />
        </View>
      </View>
      <LeaveModal
        visible={showLeaveModal}
        onStay={handleStay}
        onLeave={handleConfirmLeave}
      />
      <NetworkStatusBar isOffline={isOffline} isReconnected={isReconnected} />
    </View>
  );
}

export default WaitingRoomScreen;
