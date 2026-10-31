/** Active-queue content: ring + heading + zone banner + stat pills + claiming. */
import { ActivityIndicator, Text, View } from "react-native";

import { etaText, zoneCopy } from "@domain/rules/queue-display";
import { ProgressRing } from "@presentation/components/ProgressRing";

import type { WaitingActiveProps } from "../interface";
import { Eyebrow, Stat, Sub } from "./common";
import { waitingStyles } from "../style";

// Dark-surface zone tones (prototype waiting.html dark palette).
const ZONE_TONE: Record<"ok" | "warn" | "error", string> = {
  ok: "text-ok-dark",
  warn: "text-warn-dark",
  error: "text-error-dark",
};
const ZONE_BOX: Record<"ok" | "warn" | "error", string> = {
  ok: "border-ok-dark/30 bg-ok-dark/10",
  warn: "border-warn-dark/30 bg-warn-dark/10",
  error: "border-error-dark/30 bg-error-dark/10",
};
const ZONE_EMOJI: Record<"ok" | "warn" | "error", string> = {
  ok: "🔒 ",
  warn: "⚠️ ",
  error: "🔴 ",
};

export function WaitingActive({ entry, claiming }: WaitingActiveProps) {
  if (claiming) {
    return (
      <View className="my-6 items-center" testID="waiting-claiming" accessibilityLiveRegion="polite">
        <View className="w-full flex-row items-center justify-center gap-3 rounded-xl border border-ok-dark/30 bg-ok-dark/10 p-4">
          <ActivityIndicator accessibilityLabel="Menyiapkan halaman tiket" color="#a7f3c4" />
          <Text className="text-sm font-bold text-ok-dark">
            Giliranmu tiba! Menyiapkan halaman tiket…
          </Text>
        </View>
      </View>
    );
  }

  const zone = zoneCopy(entry.zone);
  // Ring progress: full at the front (position 0), emptier further back.
  const progress = entry.position <= 0 ? 1 : 1 / (1 + entry.position / 5);

  return (
    <>
      {/* 200px ember→red progress ring with the position in the center. */}
      <View className="mt-6">
        <ProgressRing progress={progress}>
          <Text
            className="font-extrabold text-white"
            style={waitingStyles.position}
            accessibilityLabel={`Posisimu nomor ${entry.position}`}
            testID="waiting-position"
          >
            {entry.position}
          </Text>
          <Text className="font-semibold uppercase text-white/60" style={waitingStyles.posLabel}>
            Posisimu
          </Text>
        </ProgressRing>
      </View>

      <Text className="mt-3 text-lg font-extrabold text-white" accessibilityRole="header">
        Kamu sedang mengantre
      </Text>
      <Sub>
        Posisimu tersimpan aman di server — refresh atau tutup-buka tab tidak
        akan menghapus antreanmu.
      </Sub>

      {/* Zone banner. */}
      {zone ? (
        <View
          className={`mt-5 w-full flex-row items-center justify-center gap-2.5 rounded-lg border p-3 ${ZONE_BOX[zone.tone]}`}
          accessibilityLiveRegion="polite"
          testID="waiting-zone"
        >
          <Text className={`flex-1 text-xs font-semibold leading-5 ${ZONE_TONE[zone.tone]}`}>
            {ZONE_EMOJI[zone.tone]}
            <Text className="font-extrabold">{zone.label} </Text>
            {zone.body}
          </Text>
        </View>
      ) : null}

      {/* Stat pills. */}
      <View className="mt-5 w-full flex-row gap-2.5">
        <Stat value={String(entry.position)} label="Di depanmu" />
        <Stat value={etaText(entry.position)} label="Estimasi" />
      </View>
    </>
  );
}

// Re-export Eyebrow so the PageScreen's active branch composes from one place.
export { Eyebrow };
