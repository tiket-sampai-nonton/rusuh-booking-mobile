/**
 * WaitingRoomScreen — virtual waiting room (RBT-043/044, E5).
 *
 * Shows position ("orang di depanmu") + ETA + zone copy with a live region so a
 * screen reader announces changes (RBT-080). Polls adaptively via
 * useWaitingRoom (one poller). On admission it auto-claims (no button) and
 * redirects to checkout; terminal statuses (SOLD_OUT/MISSED/…) show recovery.
 * Matches prototype `waiting.html`. Refresh-safe: the queueId comes from the
 * session store (persisted at join).
 */
import { useRouter, type Href } from "expo-router";
import React, { useEffect } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import {
  etaText,
  isTerminal,
  terminalMessage,
  zoneCopy,
} from "@domain/rules/queue-display";
import { AuraBackground } from "@presentation/components/AuraBackground";
import { BrandMark } from "@presentation/components/BrandMark";
import { ProgressRing } from "@presentation/components/ProgressRing";
import { useWaitingRoom } from "@presentation/hooks/useWaitingRoom";
import { useSessionStore } from "@presentation/stores/session-store";

export interface WaitingRoomScreenProps {
  readonly eventId: string;
}

// Dark-surface zone tones (prototype waiting.html dark palette).
const ZONE_TONE: Record<"ok" | "warn" | "error", string> = {
  ok: "text-ok-dark",
  warn: "text-warn-dark",
  error: "text-error-dark",
};

export function WaitingRoomScreen({ eventId }: WaitingRoomScreenProps) {
  const router = useRouter();
  const queueId = useSessionStore((s) => s.queueId) ?? "";
  const { entry, isLoading, isError, error, claimedSessionId, claiming, leave } =
    useWaitingRoom(queueId, eventId);

  // Auto-advance to checkout once admission is claimed (FR-08).
  useEffect(() => {
    if (claimedSessionId) {
      router.replace(`/checkout/${claimedSessionId}` as Href);
    }
  }, [claimedSessionId, router]);

  const onLeave = (): void => {
    leave();
    router.replace("/" as Href);
  };

  if (!queueId) {
    return (
      <Shell testID="waiting-noqueue">
        <Text className="text-xl font-extrabold text-white" accessibilityRole="header">
          Belum ada antrean aktif
        </Text>
        <Text className="mt-1 text-center text-sm text-white/60">
          Mulai dari halaman event untuk masuk antrean.
        </Text>
        <LeaveButton label="Ke Beranda" onPress={onLeave} />
      </Shell>
    );
  }

  if (isLoading) {
    return (
      <Shell testID="waiting-loading">
        <ActivityIndicator accessibilityLabel="Memuat antrean" color="#fff" />
        <Text className="mt-2 text-sm text-white/60">Menyambungkan…</Text>
      </Shell>
    );
  }

  if (isError || !entry) {
    return (
      <Shell testID="waiting-error">
        <Text className="text-xl font-extrabold text-white" accessibilityRole="header">
          Gagal memuat antrean
        </Text>
        <Text className="mt-1 text-center text-sm text-white/60">
          {error?.message || "Terjadi kesalahan. Coba lagi."}
        </Text>
        <LeaveButton label="Keluar" onPress={onLeave} />
      </Shell>
    );
  }

  if (isTerminal(entry.status)) {
    return (
      <Shell testID="waiting-terminal">
        <Text
          className="text-2xl font-extrabold text-white"
          accessibilityRole="header"
          accessibilityLiveRegion="polite"
        >
          {entry.status === "SOLD_OUT" ? "Tiket Habis" : "Antrean Berakhir"}
        </Text>
        <Text className="mt-2 text-center text-sm text-white/60">
          {terminalMessage(entry.status)}
        </Text>
        <LeaveButton label="Ke Beranda" onPress={onLeave} />
      </Shell>
    );
  }

  const zone = zoneCopy(entry.zone);
  // Ring progress: full at the front (position 0), emptier further back.
  const progress = entry.position <= 0 ? 1 : 1 / (1 + entry.position / 5);

  return (
    <Shell testID="waiting-active">
      <Text className="text-2xs font-bold uppercase tracking-tag text-white/60" accessibilityRole="header">
        Virtual Waiting Room
      </Text>

      {claiming ? (
        <View className="mt-6 items-center" testID="waiting-claiming" accessibilityLiveRegion="polite">
          <ActivityIndicator accessibilityLabel="Menyiapkan halaman tiket" color="#fff" />
          <Text className="mt-3 text-base font-bold text-white">
            Giliranmu tiba! Menyiapkan halaman tiket…
          </Text>
        </View>
      ) : (
        <>
          <View className="mt-5">
            <ProgressRing progress={progress}>
              <Text
                className="text-display font-extrabold text-white"
                accessibilityLabel={`Posisimu nomor ${entry.position}`}
                testID="waiting-position"
              >
                {entry.position}
              </Text>
              <Text className="text-2xs font-bold uppercase tracking-tag text-white/50">
                Posisimu
              </Text>
            </ProgressRing>
          </View>
          <Text className="mt-3 text-sm text-white/70">orang di depanmu</Text>

          <View className="mt-5 flex-row gap-3">
            <Stat value={String(entry.position)} label="Di depanmu" />
            <Stat value={etaText(entry.position)} label="Estimasi" />
          </View>

          {zone ? (
            <View
              className="mt-5 w-full rounded-2xl border border-white/10 bg-white/5 p-4"
              accessibilityLiveRegion="polite"
              testID="waiting-zone"
            >
              <Text className={`text-sm font-bold ${ZONE_TONE[zone.tone]}`}>
                {zone.tone === "ok" ? "🔒 " : zone.tone === "warn" ? "⚠ " : "🔴 "}
                {zone.label}
              </Text>
              <Text className="mt-1 text-xs text-white/60">{zone.body}</Text>
            </View>
          ) : null}

          <Text className="mt-4 text-center text-2xs text-white/50">
            Posisimu tersimpan di server — refresh atau tutup-buka tab tidak
            menghapus antreanmu.
          </Text>
        </>
      )}

      <LeaveButton label="Keluar dari antrean" onPress={onLeave} disabled={claiming} />
    </Shell>
  );
}

/** Dark aura shell: brand mark top-left, a centered dark card (prototype look). */
function Shell({
  children,
  testID,
}: {
  readonly children: React.ReactNode;
  readonly testID: string;
}) {
  return (
    <AuraBackground tone="brand" testID={testID}>
      <View className="absolute left-5 top-12 z-10">
        <BrandMark color="#ffffff" />
      </View>
      <View className="flex-1 items-center justify-center p-6">
        <View className="w-full max-w-md items-center rounded-5xl border border-white/10 bg-white/5 p-6">
          {children}
        </View>
      </View>
    </AuraBackground>
  );
}

function Stat({ value, label }: { readonly value: string; readonly label: string }) {
  return (
    <View className="min-w-[120px] items-center rounded-xl border border-white/10 bg-white/5 py-3">
      <Text className="text-2xl font-extrabold text-white">{value}</Text>
      <Text className="mt-0.75 text-2xs uppercase tracking-tag text-white/50">{label}</Text>
    </View>
  );
}

function LeaveButton({
  label,
  onPress,
  disabled = false,
}: {
  readonly label: string;
  readonly onPress: () => void;
  readonly disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      testID="waiting-leave"
      className={`mt-7.5 rounded-pill border border-white/20 px-6 py-3 ${disabled ? "opacity-50" : ""}`}
    >
      <Text className="text-sm font-bold text-white">{label}</Text>
    </Pressable>
  );
}
