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
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
} from "react-native";

import {
  etaText,
  isTerminal,
  terminalMessage,
  zoneCopy,
} from "@domain/rules/queue-display";
import { useWaitingRoom } from "@presentation/hooks/useWaitingRoom";
import { useSessionStore } from "@presentation/stores/session-store";

export interface WaitingRoomScreenProps {
  readonly eventId: string;
}

const ZONE_TONE: Record<"ok" | "warn" | "error", string> = {
  ok: "text-ok",
  warn: "text-warn",
  error: "text-error",
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
      <Centered testID="waiting-noqueue">
        <Text className="text-base font-bold text-foreground" accessibilityRole="header">
          Belum ada antrean aktif
        </Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          Mulai dari halaman event untuk masuk antrean.
        </Text>
        <LeaveButton label="Ke Beranda" onPress={onLeave} />
      </Centered>
    );
  }

  if (isLoading) {
    return (
      <Centered testID="waiting-loading">
        <ActivityIndicator accessibilityLabel="Memuat antrean" />
        <Text className="mt-2 text-sm text-muted-foreground">Menyambungkan…</Text>
      </Centered>
    );
  }

  if (isError || !entry) {
    return (
      <Centered testID="waiting-error">
        <Text className="text-base font-bold text-error" accessibilityRole="header">
          Gagal memuat antrean
        </Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          {error?.message || "Terjadi kesalahan. Coba lagi."}
        </Text>
        <LeaveButton label="Keluar" onPress={onLeave} />
      </Centered>
    );
  }

  if (isTerminal(entry.status)) {
    return (
      <Centered testID="waiting-terminal">
        <Text
          className="text-xl font-extrabold text-foreground"
          accessibilityRole="header"
          accessibilityLiveRegion="polite"
        >
          {entry.status === "SOLD_OUT" ? "Tiket Habis" : "Antrean Berakhir"}
        </Text>
        <Text className="mt-2 text-center text-sm text-muted-foreground">
          {terminalMessage(entry.status)}
        </Text>
        <LeaveButton label="Ke Beranda" onPress={onLeave} />
      </Centered>
    );
  }

  const zone = zoneCopy(entry.zone);

  return (
    <Centered testID="waiting-active">
      <Text
        className="text-2xs font-bold uppercase tracking-tag text-muted-foreground"
        accessibilityRole="header"
      >
        Virtual Waiting Room
      </Text>

      {claiming ? (
        <View className="mt-4 items-center" testID="waiting-claiming" accessibilityLiveRegion="polite">
          <ActivityIndicator accessibilityLabel="Menyiapkan halaman tiket" />
          <Text className="mt-2 text-base font-bold text-foreground">
            Giliranmu tiba! Menyiapkan halaman tiket…
          </Text>
        </View>
      ) : (
        <>
          <Text
            className="mt-4 text-hero font-extrabold text-brand"
            accessibilityLabel={`Posisimu nomor ${entry.position}`}
            testID="waiting-position"
          >
            {entry.position}
          </Text>
          <Text className="text-sm text-muted-foreground">orang di depanmu</Text>

          <View className="mt-4 flex-row gap-7.5">
            <Stat value={String(entry.position)} label="Di depanmu" />
            <Stat value={etaText(entry.position)} label="Estimasi" />
          </View>

          {zone ? (
            <View
              className="mt-5 rounded-2xl border border-line p-4"
              accessibilityLiveRegion="polite"
              testID="waiting-zone"
            >
              <Text className={`text-sm font-bold ${ZONE_TONE[zone.tone]}`}>
                {zone.tone === "ok" ? "🔒 " : zone.tone === "warn" ? "⚠ " : "🔴 "}
                {zone.label}
              </Text>
              <Text className="mt-1 text-xs text-muted-foreground">{zone.body}</Text>
            </View>
          ) : null}

          <Text className="mt-4 text-center text-2xs text-muted-foreground">
            Posisimu tersimpan di server — refresh atau tutup-buka tab tidak
            menghapus antreanmu.
          </Text>
        </>
      )}

      <LeaveButton label="Keluar dari antrean" onPress={onLeave} disabled={claiming} />
    </Centered>
  );
}

function Centered({
  children,
  testID,
}: {
  readonly children: React.ReactNode;
  readonly testID: string;
}) {
  return (
    <View
      className="flex-1 items-center justify-center bg-background p-6"
      testID={testID}
    >
      {children}
    </View>
  );
}

function Stat({ value, label }: { readonly value: string; readonly label: string }) {
  return (
    <View className="items-center">
      <Text className="text-2xl font-extrabold text-foreground">{value}</Text>
      <Text className="text-2xs text-muted-foreground">{label}</Text>
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
      className={`mt-7.5 rounded-pill border border-line px-6 py-3 ${disabled ? "opacity-50" : ""}`}
    >
      <Text className="text-sm font-bold text-foreground">{label}</Text>
    </Pressable>
  );
}
