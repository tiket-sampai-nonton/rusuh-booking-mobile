/** Non-active waiting states: no-queue, loading, error, terminal. */
import { ActivityIndicator, Text, View } from "react-native";

import { terminalMessage } from "@domain/rules/queue-display";
import type { QueueStatus } from "@domain/repositories/queue.repository";

import { Eyebrow, LeaveLink, Sub } from "./common";
import { Shell } from "./Shell";

export function WaitingNoQueue({ onLeave }: { readonly onLeave: () => void }) {
  return (
    <Shell testID="waiting-noqueue" pillLabel="Waiting Room">
      <Eyebrow />
      <Text className="mt-6 text-xl font-extrabold text-white" accessibilityRole="header">
        Belum ada antrean aktif
      </Text>
      <Sub>Kamu belum masuk antrean event mana pun.</Sub>
      <LeaveLink label="Pilih event" onPress={onLeave} />
    </Shell>
  );
}

export function WaitingLoading({ onLeave }: { readonly onLeave: () => void }) {
  return (
    <Shell testID="waiting-loading" pillLabel="Waiting Room">
      <Eyebrow />
      <View className="mt-6 items-center">
        <ActivityIndicator accessibilityLabel="Memuat antrean" color="#fff" />
        <Sub>Menyambungkan…</Sub>
      </View>
      <LeaveLink label="Keluar" onPress={onLeave} />
    </Shell>
  );
}

export function WaitingError({
  message,
  onLeave,
}: {
  readonly message?: string;
  readonly onLeave: () => void;
}) {
  return (
    <Shell testID="waiting-error" pillLabel="Waiting Room">
      <Eyebrow />
      <Text className="mt-6 text-xl font-extrabold text-white" accessibilityRole="header">
        Gagal memuat antrean
      </Text>
      <Sub>{message || "Terjadi kesalahan. Coba lagi."}</Sub>
      <LeaveLink label="Keluar" onPress={onLeave} />
    </Shell>
  );
}

export function WaitingTerminal({
  status,
  onLeave,
}: {
  readonly status: QueueStatus;
  readonly onLeave: () => void;
}) {
  return (
    <Shell testID="waiting-terminal" pillLabel="Waiting Room">
      <Eyebrow />
      <Text
        className="mt-6 text-2xl font-extrabold text-white"
        accessibilityRole="header"
        accessibilityLiveRegion="polite"
      >
        {status === "SOLD_OUT" ? "Tiket Habis" : "Antrean Berakhir"}
      </Text>
      <Sub>{terminalMessage(status)}</Sub>
      {/* Prototype error-state recovery box. */}
      <View
        className="mt-4 w-full rounded-lg border border-error-dark/30 bg-error-dark/10 p-4"
        accessibilityLiveRegion="polite"
      >
        <Text className="text-center text-xs text-error-dark">
          {status === "SOLD_OUT"
            ? "Tiket habis. Cari event lain."
            : "Antrean berakhir. Masuk antrean lagi dari halaman event."}
        </Text>
      </View>
      <LeaveLink label="Ke Beranda" onPress={onLeave} />
    </Shell>
  );
}
