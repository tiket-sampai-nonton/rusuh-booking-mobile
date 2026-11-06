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
import {
  BackHandler,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CloseIcon } from "@presentation/components/ArrowIcon";
import { designColors } from "@presentation/theme";
import { PillGroup } from "./PillGroup";
import { componentStyles } from "./style";
import {
  styleForFilterModalPressable0,
  styleForFilterModalView1,
} from "./style";

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

const GENRES = [
  "Semua",
  "Festival",
  "Jazz",
  "Rock",
  "Elektronik",
  "Folk",
  "Orkestra",
];
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
    const subscription = BackHandler.addEventListener(
      "hardwareBackPress",
      () => {
        onClose();
        return true;
      },
    );
    return () => subscription.remove();
  }, [onClose, visible]);

  const sheetContent = (
    <View style={componentStyles.elementFlex0}>
      <Pressable
        accessibilityLabel="Tutup penyaringan"
        onPress={onClose}
        style={StyleSheet.absoluteFillObject}
        testID="filter-backdrop"
      />
      <Pressable
        onPress={(e) => e.stopPropagation()}
        accessibilityViewIsModal
        style={styleForFilterModalPressable0(insets)}
        testID="filter-modal"
      >
        <View style={componentStyles.elementFlexDirection1}>
          <View style={componentStyles.elementFlex2}>
            <Text
              accessibilityRole="header"
              style={componentStyles.elementColor3}
            >
              Saring Event
            </Text>
            <Text style={componentStyles.elementMarginTop4}>
              Pilih kategori, waktu, dan urutan event.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tutup penyaringan"
            onPress={onClose}
            style={componentStyles.elementWidth5}
            testID="filter-close"
          >
            <CloseIcon color={designColors.ink} />
          </Pressable>
        </View>

        <ScrollView
          style={componentStyles.elementMaxHeight6}
          keyboardShouldPersistTaps="handled"
        >
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

        <View style={componentStyles.elementMarginTop7}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Batal"
            onPress={onClose}
            testID="filter-cancel"
            style={componentStyles.elementMinHeight8}
          >
            <Text style={componentStyles.elementColor9}>Batal</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Terapkan Saringan"
            onPress={apply}
            testID="filter-apply"
            style={componentStyles.elementMinHeight10}
          >
            <Text style={componentStyles.elementColor11}>
              Terapkan Saringan
            </Text>
          </Pressable>
        </View>
      </Pressable>
    </View>
  );

  if (Platform.OS !== "web") {
    if (!visible) return null;
    return (
      <View style={[StyleSheet.absoluteFillObject, styleForFilterModalView1()]}>
        {sheetContent}
      </View>
    );
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {sheetContent}
    </Modal>
  );
}
