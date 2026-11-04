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
import type { ComponentType } from "react";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Platform, Pressable, Text, View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";
import Animated, {
  cancelAnimation,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Path, type CircleProps } from "react-native-svg";
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

const ADMISSION_RATE_PER_MIN = 1400; // ~23/sec
type AnimatedCircleProps = CircleProps & {
  animatedProps?: Partial<Pick<CircleProps, "strokeDashoffset">>;
};
const AnimatedCircle = Animated.createAnimatedComponent(Circle) as unknown as ComponentType<AnimatedCircleProps>;

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
  const reducedMotion = useReducedMotion() ?? false;
  const animatedProgress = useSharedValue(clamped);
  useEffect(() => {
    animatedProgress.value = reducedMotion
      ? clamped
      : withTiming(clamped, { duration: 700 });
  }, [animatedProgress, clamped, reducedMotion]);
  const arcProps = useAnimatedProps(() => ({
    strokeDashoffset: RING_CIRCUMFERENCE * (1 - animatedProgress.value),
  }));
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
        <AnimatedCircle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke={palette.ringBg}
          strokeWidth={RING_STROKE}
        />
        {/* Progress arc */}
        <AnimatedCircle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RING_RADIUS}
          fill="none"
          stroke={strokeColor}
          strokeWidth={RING_STROKE}
          strokeDasharray={RING_CIRCUMFERENCE}
          animatedProps={arcProps}
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
        <Text style={styles.positionLabel}>Posisi Anda</Text>
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
      <QueueIcon kind={copy.icon} size={20} />
      <View style={styles.zoneTextWrap}>
        <Text style={[styles.zoneLabel, { color: tone.text }]}>{copy.label}</Text>
        <Text style={[styles.zoneBody, { color: tone.text }]}>{copy.body}</Text>
      </View>
    </View>
  );
}

function QueueIcon({ kind, size = 28 }: { readonly kind: "lock" | "warning" | "alert" | "clock" | "ticket"; readonly size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={palette.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" testID={`waiting-icon-${kind}`} accessibilityLabel={`${kind} icon`}>
      {kind === "lock" ? <Path d="M5 10h14v11H5zM8 10V7a4 4 0 0 1 8 0v3" /> : null}
      {kind === "warning" ? <Path d="M12 3 2.5 20h19L12 3ZM12 9v5m0 3h.01" /> : null}
      {kind === "alert" ? <Path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 7v6m0 4h.01" /> : null}
      {kind === "clock" ? <Path d="M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /> : null}
      {kind === "ticket" ? <Path d="M3 7h18v4a2 2 0 0 0 0 4v4H3v-4a2 2 0 0 0 0-4V7Zm6 0v12" /> : null}
    </Svg>
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
        <Text style={styles.timeLabel}>Menit</Text>
      </View>
      <View style={styles.timeBlock}>
        <Text style={styles.timeValue}>{String(seconds).padStart(2, "0")}</Text>
        <Text style={styles.timeLabel}>Detik</Text>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ADMITTED state proceeds as soon as the claim use case returns a session.
// ═══════════════════════════════════════════════════════════════════════════════

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
    <View style={[styles.modalOverlay, Platform.OS !== "web" && { justifyContent: "flex-end", paddingHorizontal: 0 }]} testID="waiting-leave-modal">
      <View style={[styles.modal, Platform.OS !== "web" && { maxWidth: "100%", borderBottomWidth: 0 }]}>
        <View style={{ alignItems: "center", marginBottom: 12 }}><QueueIcon kind="warning" /></View>
        <Text style={styles.modalTitle}>Keluar dari Antrean?</Text>
        <Text style={styles.modalText}>
          Jika Anda keluar sekarang, posisi antrean akan hilang dan Anda harus
          bergabung kembali dari belakang.
        </Text>
        <View style={styles.modalActions}>
          <Pressable style={styles.modalBtnStay} onPress={onStay}>
            <Text style={styles.modalBtnStayText}>Tetap Mengantre</Text>
          </Pressable>
          <Pressable style={styles.modalBtnLeave} onPress={onLeave}>
            <Text style={styles.modalBtnLeaveText}>Keluar dari Antrean</Text>
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
          ? "Koneksi tersambung kembali. Memperbarui antrean…"
          : "Koneksi terputus. Posisi antrean Anda tetap tersimpan…"}
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
      accessibilityLabel="Keluar dari Antrean"
      testID="waiting-leave"
    >
      <Text style={styles.leaveBtnText}>Keluar dari Antrean</Text>
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
  readonly icon: "warning" | "clock" | "ticket";
  readonly title: string;
  readonly message: string;
  readonly buttonText: string;
  readonly onPress: () => void;
  readonly testID: string;
}) {
  return (
    <View style={styles.errorState} testID={testID}>
      <View style={{ alignItems: "center", marginBottom: 12 }}><QueueIcon kind={icon} /></View>
      <Text style={styles.errorTitle}>{title}</Text>
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
      <StatusBadge variant="queue" label="Dalam Antrean" />

      <RingProgress
        progress={progress}
        position={position}
        isWarning={position <= 10}
      />

      <ZoneBanner zone={zone} />

      <EstimatedTime position={position} />

      <Text style={styles.infoText}>
        Jangan tutup halaman ini. Posisi antrean diperbarui otomatis. Jangan
        muat ulang atau tinggalkan halaman agar posisi Anda tetap terjaga.
      </Text>

      <LeaveButton onPress={onLeavePress} />
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// YOUR TURN STATE (with auto-redirect countdown)
// ═══════════════════════════════════════════════════════════════════════════════

interface YourTurnStateProps {
  readonly onLeavePress: () => void;
  readonly claiming: boolean;
}

function YourTurnState({ onLeavePress, claiming }: YourTurnStateProps) {
  return (
    <>
      <StatusBadge variant="yourTurn" label="Giliran Anda!" />

      <RingProgress progress={1} position={0} />

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

  // A successful, server-authorized claim proceeds immediately to checkout.
  useEffect(() => {
    if (claimedSessionId) router.replace(`/checkout/${claimedSessionId}` as Href);
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
  if (isError || !entry) {
    return (
      <View style={styles.root} testID="waiting-error">
        <Header />
        <View style={styles.shell}>
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
        <View style={styles.shell}>
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
          <View style={styles.shell}>
            <View style={styles.waitingContainer}>
              <StatusBadge
                variant={isSoldOut ? "soldOut" : "expired"}
                label={isSoldOut ? "Tiket Habis" : "Giliran Berakhir"}
              />
              <ErrorState
                icon={isSoldOut ? "ticket" : "clock"}
                title={claimErrorTitle(errorState)}
                message={claimErrorBody(errorState)}
                buttonText={isSoldOut ? "Jelajahi Event Lain" : "Bergabung Kembali"}
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
