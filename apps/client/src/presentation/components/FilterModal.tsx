/**
 * FilterModal — 1:1 of the prototype index.html "Filter Event" popup.
 *
 * The "Filter Event" button opens this dialog (it does NOT navigate directly).
 * The user picks genre / waktu / urutan, then "Terapkan Filter" navigates to
 * /browse with the chosen params (prototype: submit → browse.html?<params>);
 * "Batal" (or a backdrop tap) closes it with no navigation. Filtering is
 * client-side (O4 open blocker — GET /events has no server filter param), so
 * /browse reads these params and filters the already-fetched list.
 *
 * RN has no native <select>; each field is a row of selectable pills (the
 * faithful RN equivalent of the prototype's dropdowns).
 */
import { useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

export interface FilterValue {
  readonly genre: string;
  readonly time: string;
  readonly sort: string;
}

export interface FilterModalProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  /** Apply — receives the chosen filter (the screen navigates to /browse). */
  readonly onApply: (value: FilterValue) => void;
}

const GENRES = ["Semua", "Festival", "Jazz", "Rock", "Elektronik", "Folk", "Orkestra"];
const TIMES = [
  { v: "all", l: "Semua waktu" },
  { v: "week", l: "Minggu ini" },
  { v: "month", l: "Bulan ini" },
  { v: "quarter", l: "3 bulan" },
];
const SORTS = [
  { v: "closest", l: "Terdekat" },
  { v: "furthest", l: "Terjauh" },
];

export function FilterModal({ visible, onClose, onApply }: FilterModalProps) {
  const [genre, setGenre] = useState("Semua");
  const [time, setTime] = useState("all");
  const [sort, setSort] = useState("closest");

  const apply = (): void => {
    onApply({ genre, time, sort });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable
        accessibilityLabel="Tutup filter"
        onPress={onClose}
        className="flex-1 items-center justify-center bg-ink/70 p-5"
        testID="filter-backdrop"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-3xl border border-line bg-card p-6"
          testID="filter-modal"
        >
          <Text className="text-xl font-extrabold text-foreground" accessibilityRole="header">
            Filter Event
          </Text>
          <Text className="mt-1.5 text-sm text-muted-foreground">
            Pilih genre, waktu, dan urutan. Hasil tampil di halaman baru.
          </Text>

          <ScrollView style={{ maxHeight: 340 }} className="mt-2">
            <PillGroup
              label="Genre Musik"
              options={GENRES.map((g) => ({ v: g, l: g }))}
              value={genre}
              onPick={setGenre}
              testPrefix="filter-genre"
            />
            <PillGroup
              label="Waktu"
              options={TIMES}
              value={time}
              onPick={setTime}
              testPrefix="filter-time"
            />
            <PillGroup
              label="Urutkan"
              options={SORTS}
              value={sort}
              onPick={setSort}
              testPrefix="filter-sort"
            />
          </ScrollView>

          <View className="mt-5 flex-row justify-end gap-2.5">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Batal"
              onPress={onClose}
              testID="filter-cancel"
              className="rounded-pill border border-line px-5 py-3"
            >
              <Text className="text-sm font-semibold text-foreground">Batal</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Terapkan Filter"
              onPress={apply}
              testID="filter-apply"
              className="rounded-pill bg-brand px-5 py-3"
            >
              <Text className="text-sm font-bold text-white">Terapkan Filter ↗</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function PillGroup({
  label,
  options,
  value,
  onPick,
  testPrefix,
}: {
  readonly label: string;
  readonly options: readonly { v: string; l: string }[];
  readonly value: string;
  readonly onPick: (v: string) => void;
  readonly testPrefix: string;
}) {
  return (
    <View className="mb-4">
      <Text className="mb-2 text-xs font-semibold text-muted-foreground">{label}</Text>
      <View className="flex-row flex-wrap gap-2">
        {options.map((o) => {
          const on = o.v === value;
          return (
            <Pressable
              key={o.v}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={`${label}: ${o.l}`}
              onPress={() => onPick(o.v)}
              testID={`${testPrefix}-${o.v}`}
              className={`rounded-pill border px-3.5 py-2 ${on ? "border-brand bg-brand" : "border-line bg-background"}`}
            >
              <Text className={`text-xs font-semibold ${on ? "text-white" : "text-foreground"}`}>
                {o.l}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
