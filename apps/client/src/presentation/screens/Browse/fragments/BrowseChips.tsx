/** Active-filter chips + Ubah/Reset Filter (prototype browse.html). */
import { Pressable, Text, View } from "react-native";

import { tapSlop } from "@shared/utils/tap-target";

import type { BrowseChipProps, BrowseChipsProps } from "../interface";
import { SORT_LABEL, TIME_LABEL } from "../filter";

// RBT-090: refine/reset chips render ~33pt tall — widen the hit region to 44pt
// without changing the pixel size (WCAG 2.5.5).
const CHIP_SLOP = tapSlop(110, 33);

function Chip({ label, value }: BrowseChipProps) {
  return (
    <View className="rounded-pill border border-line bg-background px-3 py-1.5">
      <Text className="text-xs text-muted-foreground">
        {label}: <Text className="font-bold text-foreground">{value}</Text>
      </Text>
    </View>
  );
}

export function BrowseChips({ genre, time, sort, isFiltered, onRefine, onReset }: BrowseChipsProps) {
  return (
    <View className="mt-3 flex-row flex-wrap items-center gap-2">
      <Chip label="Genre" value={genre === "Semua" ? "Semua" : genre} />
      <Chip label="Waktu" value={TIME_LABEL[time] ?? "Semua waktu"} />
      <Chip label="Urut" value={SORT_LABEL[sort] ?? "Terdekat"} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ubah Filter"
        onPress={onRefine}
        testID="browse-refine"
        hitSlop={CHIP_SLOP}
        className="rounded-pill border border-line bg-card px-3.5 py-2"
      >
        <Text className="text-xs font-bold text-ink">⛃ Ubah Filter</Text>
      </Pressable>
      {isFiltered ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Reset Filter"
          onPress={onReset}
          testID="browse-reset"
          hitSlop={CHIP_SLOP}
          className="rounded-pill border border-line px-3.5 py-2"
        >
          <Text className="text-xs font-semibold text-muted-foreground">↺ Reset Filter</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
