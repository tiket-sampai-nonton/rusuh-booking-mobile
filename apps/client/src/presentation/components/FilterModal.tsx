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
import { useEffect, useState } from "react";
import { BackHandler, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CloseIcon } from "@presentation/components/ArrowIcon";
import { interFonts, v2Borders, v2Colors } from "@presentation/theme";

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
  const insets = useSafeAreaInsets();
  const [genre, setGenre] = useState("Semua");
  const [time, setTime] = useState("all");
  const [sort, setSort] = useState("closest");

  const apply = (): void => {
    onApply({ genre, time, sort });
  };

  useEffect(() => {
    if (!visible || Platform.OS !== "android") return;
    const subscription = BackHandler.addEventListener("hardwareBackPress", () => {
      onClose();
      return true;
    });
    return () => subscription.remove();
  }, [onClose, visible]);

  const sheetContent = (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: Platform.OS === "web" ? "center" : "flex-end",
        padding: Platform.OS === "web" ? 24 : 0,
        backgroundColor: "rgba(0,0,0,0.72)",
      }}
    >
      <Pressable
        accessibilityLabel="Tutup penyaringan"
        onPress={onClose}
        style={StyleSheet.absoluteFillObject}
        testID="filter-backdrop"
      />
        <Pressable
          onPress={(e) => e.stopPropagation()}
          accessibilityViewIsModal
          style={{
            width: "100%",
            maxWidth: 480,
            maxHeight: "90%",
            padding: 24,
            paddingBottom: Platform.OS === "web" ? 24 : Math.max(24, insets.bottom + 16),
            borderWidth: v2Borders.standard,
            borderColor: v2Colors.ink,
            backgroundColor: v2Colors.ground,
            shadowColor: v2Colors.ink,
            shadowOffset: { width: 4, height: 4 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 5,
          }}
          testID="filter-modal"
        >
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
            <View style={{ flex: 1 }}>
              <Text accessibilityRole="header" style={{ color: v2Colors.ink, fontFamily: interFonts.black, fontSize: 20, textTransform: "uppercase" }}>
                Saring Event
              </Text>
              <Text style={{ marginTop: 6, color: v2Colors.inkMuted, fontFamily: interFonts.regular, fontSize: 13 }}>
                Pilih kategori, waktu, dan urutan event.
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Tutup penyaringan"
              onPress={onClose}
              style={{ width: 40, height: 40, alignItems: "center", justifyContent: "center", borderWidth: v2Borders.standard, borderColor: v2Colors.ink }}
              testID="filter-close"
            >
              <CloseIcon color={v2Colors.ink} />
            </Pressable>
          </View>

          <ScrollView style={{ maxHeight: 340, marginTop: 12 }} keyboardShouldPersistTaps="handled">
            <PillGroup
              label="Kategori Musik"
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

          <View style={{ marginTop: 20, flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Batal"
              onPress={onClose}
              testID="filter-cancel"
              style={{ minHeight: 44, paddingHorizontal: 20, alignItems: "center", justifyContent: "center", borderWidth: v2Borders.standard, borderColor: v2Colors.ink, backgroundColor: v2Colors.ground }}
            >
              <Text style={{ color: v2Colors.ink, fontFamily: interFonts.bold, fontSize: 13, textTransform: "uppercase" }}>Batal</Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Terapkan Saringan"
              onPress={apply}
              testID="filter-apply"
              style={{ minHeight: 44, paddingHorizontal: 20, alignItems: "center", justifyContent: "center", borderWidth: v2Borders.standard, borderColor: v2Colors.ink, backgroundColor: v2Colors.ink }}
            >
              <Text style={{ color: v2Colors.ground, fontFamily: interFonts.bold, fontSize: 13, textTransform: "uppercase" }}>Terapkan Saringan</Text>
            </Pressable>
          </View>
        </Pressable>
    </View>
  );

  if (Platform.OS !== "web") {
    if (!visible) return null;
    return (
      <View
        pointerEvents="auto"
        style={[StyleSheet.absoluteFillObject, { zIndex: 10000, elevation: 10000 }]}
      >
        {sheetContent}
      </View>
    );
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      {sheetContent}
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
              style={{ minHeight: 40, justifyContent: "center", paddingHorizontal: 14, paddingVertical: 8, borderWidth: v2Borders.standard, borderColor: v2Colors.ink, backgroundColor: on ? v2Colors.ink : v2Colors.ground }}
            >
              <Text style={{ color: on ? v2Colors.ground : v2Colors.ink, fontFamily: interFonts.semiBold, fontSize: 12 }}>
                {o.l}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
