/**
 * RBT-043 — Waiting room screen (E5 Queue, FR-05/08).
 *
 * A 1:1 port of the prototype `.genesis/prototype/Final/waiting.html`, REWIRED to
 * the real merged seams:
 *   - useQueuePolling (RBT-042) — the single adaptive poller for live
 *     position / zone / status. This screen never rebuilds polling.
 *   - useAutoClaim (RBT-044) — auto-claims on ADMITTED and surfaces the
 *     TURN_MISSED / EVENT_SOLD_OUT error states. This screen never rebuilds
 *     the claim; it only routes on `claimedSessionId`.
 *   - the RBT-040 state machine (isTerminal / isAdmitted) for conditional
 *     rendering (waiting vs admitted vs terminal).
 *
 * ARCHITECTURE: presentation only — consumes application/domain via the hooks;
 * no infrastructure import, no TanStack here (it lives in the hooks). Status is
 * never color-only: every zone/state carries an icon + text label (RBT-080 a11y).
 */
import { useRouter, type Href } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

import { isAdmitted, isTerminal } from "@domain/state-machines/queue-state-machine";
import { useAutoClaim } from "@presentation/hooks/useAutoClaim";
import { useQueuePolling } from "@presentation/hooks/useQueuePolling";

import {
  claimErrorBody,
  claimErrorTitle,
  COPY,
  etaText,
  formatCount,
  peopleAhead,
  ringProgress,
  terminalBody,
  terminalTitle,
  zoneCopy,
} from "./display";
import type {
  PositionRingProps,
  ShellProps,
  StatProps,
  WaitingActiveProps,
  WaitingRoomScreenProps,
  ZoneBannerProps,
} from "./interface";
import { palette, styles, ZONE_STYLE } from "./style";

/** Dark aura shell + glass event-pill + double-frame card + footnote. */
function Shell({ children, testID }: ShellProps) {
  return (
    <View style={styles.root} testID={testID}>
      <View style={styles.shell}>
        <View style={styles.pill}>
          <View style={styles.pillDot} />
          <Text style={styles.pillLabel}>Waiting Room</Text>
        </View>
        <View style={styles.card}>
          <View style={styles.core}>
            <Text style={styles.eyebrow} accessibilityRole="header">
              {COPY.eyebrow}
            </Text>
            {children}
          </View>
        </View>
        <Text style={styles.footnote}>{COPY.footnote}</Text>
      </View>
    </View>
  );
}

/**
 * 200px ember→red progress ring with the position in the center.
 *
 * Drawn with pure RN Views (no native SVG dependency): a track ring under an
 * ember-tinted progress arc whose sweep is driven by `progress`. The rendering
 * is static (no running animation), so the reduced-motion flag simply confirms
 * there is nothing to suppress — honored by construction.
 */
function PositionRing({ progress, children }: PositionRingProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  // Tint the ring border from the track color toward ember as progress grows,
  // so it reads as "fuller" the closer to the front — a reduced-motion-safe
  // static cue (no sweep animation to disable).
  const ringColor = clamped >= 0.5 ? palette.ember : palette.red;
  return (
    <View style={styles.ringWrap} testID="waiting-ring">
      {/* reducedMotion is honored by construction: the ring is a static render
          with no running animation to suppress. */}
      {/* Track ring. */}
      <View style={[styles.ringTrack, { borderColor: palette.ringBg }]} />
      {/* Progress ring (opacity scales with progress for a static fill cue). */}
      <View
        style={[
          styles.ringProgress,
          { borderColor: ringColor, opacity: 0.35 + 0.65 * clamped },
        ]}
      />
      <View style={styles.ringCenter}>{children}</View>
    </View>
  );
}

/** Zone banner — icon + bold label + body (never color-only). */
function ZoneBanner({ zone }: ZoneBannerProps) {
  const copy = zoneCopy(zone);
  const tone = ZONE_STYLE[copy.tone];
  return (
    <View
      testID="waiting-zone"
      accessibilityLiveRegion="polite"
      style={[styles.zone, { backgroundColor: tone.bg, borderColor: tone.border }]}
    >
      <Text style={[styles.zoneText, { color: tone.text }]}>
        {copy.icon} <Text style={styles.zoneLabel}>{copy.label}</Text> {copy.body}
      </Text>
    </View>
  );
}

function Stat({ value, label, testID }: StatProps) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue} testID={testID}>
        {value}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/** Active-queue content: ring + heading + persistence sub + zone + stats. */
function WaitingActive({ entry }: WaitingActiveProps) {
  return (
    <>
      <PositionRing progress={ringProgress(entry.position)}>
        <Text
          style={styles.position}
          testID="waiting-position"
          accessibilityLabel={`${COPY.positionLabel} nomor ${entry.position}`}
        >
          {formatCount(entry.position)}
        </Text>
        <Text style={styles.positionLabel}>{COPY.positionLabel}</Text>
      </PositionRing>

      <Text style={styles.title} accessibilityRole="header">
        {COPY.title}
      </Text>
      <Text style={styles.sub}>{COPY.persistenceSub}</Text>

      <ZoneBanner zone={entry.zone ?? "GUARANTEED"} />

      <View style={styles.stats}>
        <Stat value={formatCount(peopleAhead(entry.position))} label={COPY.aheadLabel} testID="waiting-ahead" />
        <Stat value={etaText(entry.position)} label={COPY.etaLabel} testID="waiting-eta" />
      </View>
    </>
  );
}

function LeaveLink({ onPress }: { readonly onPress: () => void }) {
  return (
    <Pressable
      style={styles.leave}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={COPY.leave}
      testID="waiting-leave"
    >
      <Text style={styles.leaveText}>{COPY.leave}</Text>
    </Pressable>
  );
}

/**
 * Waiting room screen. Driven by `queueId`; renders the correct state view via
 * the RBT-040 state machine and the two merged hooks.
 */
export function WaitingRoomScreen({ queueId, eventId }: WaitingRoomScreenProps) {
  const router = useRouter();
  const reducedMotion = useReducedMotion() ?? false;

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

  // On successful claim, route to checkout. Guard: the checkout route exists on
  // develop (`/checkout/[sessionId]`); if it were missing this is E6 territory.
  useEffect(() => {
    if (claimedSessionId) {
      router.replace(`/checkout/${claimedSessionId}` as Href);
    }
  }, [claimedSessionId, router]);

  const onLeave = (): void => {
    void leave();
    router.replace("/" as Href);
  };

  // --- Guards + non-active states ---
  if (!queueId) {
    return (
      <Shell testID="waiting-noqueue">
        <Text style={styles.title} accessibilityRole="header">
          {COPY.noQueueTitle}
        </Text>
        <Text style={styles.sub}>{COPY.noQueueSub}</Text>
        <LeaveLink onPress={onLeave} />
      </Shell>
    );
  }

  if (isLoading) {
    return (
      <Shell testID="waiting-loading">
        <View style={{ marginTop: 26 }}>
          <ActivityIndicator accessibilityLabel="Memuat antrean" color={palette.white} />
        </View>
        <Text style={styles.sub}>{COPY.loadingSub}</Text>
        <LeaveLink onPress={onLeave} />
      </Shell>
    );
  }

  if (isError || !entry) {
    return (
      <Shell testID="waiting-error">
        <Text style={styles.title} accessibilityRole="header">
          {COPY.errorTitle}
        </Text>
        <Text style={styles.sub}>{error?.message ?? COPY.errorSub}</Text>
        <LeaveLink onPress={onLeave} />
      </Shell>
    );
  }

  // Terminal entry (sold-out / ended / etc.) — the poller has stopped.
  if (isTerminal(entry.status)) {
    return (
      <Shell testID="waiting-terminal">
        <Text
          style={styles.admitTitle}
          accessibilityRole="header"
          accessibilityLiveRegion="polite"
        >
          {terminalTitle(entry.status)}
        </Text>
        <View style={styles.errBox} accessibilityLiveRegion="polite">
          <Text style={styles.errBody}>{terminalBody(entry.status)}</Text>
        </View>
        <LeaveLink onPress={onLeave} />
      </Shell>
    );
  }

  // Admitted — claim is firing (RBT-044). Show the aria-live admit region, or a
  // claim-error state if the claim failed (TURN_MISSED / EVENT_SOLD_OUT).
  if (admitted) {
    return (
      <Shell testID="waiting-admitted">
        <PositionRing progress={1}>
          <Text style={styles.position} testID="waiting-position">
            0
          </Text>
          <Text style={styles.positionLabel}>Giliranmu</Text>
        </PositionRing>

        {errorState ? (
          <View style={styles.errBox} testID="waiting-claim-error" accessibilityLiveRegion="polite">
            <Text style={styles.errTitle}>{claimErrorTitle(errorState)}</Text>
            <Text style={styles.errBody}>{claimErrorBody(errorState)}</Text>
          </View>
        ) : (
          <View style={styles.admit} testID="waiting-admit" accessibilityLiveRegion="polite">
            <Text style={styles.admitTitle} accessibilityRole="header">
              {COPY.admitTitle}
            </Text>
            <View style={styles.prep}>
              {claiming ? (
                <ActivityIndicator accessibilityLabel="Menyiapkan halaman tiket" color={palette.okText} />
              ) : null}
              <Text style={styles.prepText}>{COPY.admitSub}</Text>
            </View>
          </View>
        )}

        <LeaveLink onPress={onLeave} />
      </Shell>
    );
  }

  // --- Active waiting ---
  return (
    <Shell testID="waiting-active">
      <WaitingActive entry={entry} />
      <LeaveLink onPress={onLeave} />
    </Shell>
  );
}

export default WaitingRoomScreen;
