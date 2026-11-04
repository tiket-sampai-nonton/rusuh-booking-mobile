/**
 * V2 Brutalist Mono active-filter chips + Ubah/Reset (RBT-089).
 *
 * Prototype 05-browse `.filter-tag` / `.filter-controls`: hard-bordered SQUARE
 * chips (no pill), uppercase labels, pure black/white. Active value is inked.
 * Same props/testID wiring as the V5 version — restyle only.
 */
import { Pressable, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { v2 } from "@presentation/theme";

import type { BrowseChipProps, BrowseChipsProps } from "../interface";
import { SORT_LABEL, TIME_LABEL } from "../filter";

function Chip({ label, value }: BrowseChipProps) {
  return (
    <View
      style={{
        borderWidth: 2,
        borderColor: v2.ink,
        backgroundColor: v2.ground,
        paddingHorizontal: 12,
        paddingVertical: 7,
      }}
    >
      <Text style={{ color: v2.muted, letterSpacing: 0.5 }} className="text-2xs font-v2 font-bold uppercase">
        {label}: <Text style={{ color: v2.ink }} className="font-v2 font-black">{value}</Text>
      </Text>
    </View>
  );
}

export function BrowseChips({
  genre,
  time,
  sort,
  isFiltered,
  onRefine,
  onReset,
}: BrowseChipsProps) {
  return (
    <View className="mt-3 flex-row flex-wrap items-center" style={{ gap: 8 }}>
      <Chip label="Kategori" value={genre === "Semua" ? "Semua" : genre} />
      <Chip label="Waktu" value={TIME_LABEL[time] ?? "Semua waktu"} />
      <Chip label="Urutan" value={SORT_LABEL[sort] ?? "Terdekat"} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Ubah Penyaringan"
        onPress={onRefine}
        testID="browse-refine"
        style={{ width: 36, height: 36, borderWidth: 2, borderColor: v2.ink, backgroundColor: v2.ground, alignItems: "center", justifyContent: "center" }}
      >
        <Svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke={v2.ink} strokeWidth={2}>
          <Path d="M4 6h16M7 12h10m-7 6h4" />
        </Svg>
      </Pressable>
      {isFiltered ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Hapus Penyaringan"
          onPress={onReset}
          testID="browse-reset"
          style={{ borderWidth: 2, borderColor: v2.ink, backgroundColor: v2.ground, paddingHorizontal: 14, paddingVertical: 8 }}
        >
          <Text style={{ color: v2.ink }} className="text-2xs font-v2 font-bold uppercase">
            Hapus Penyaringan
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
