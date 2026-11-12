import { Pressable, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { designColors } from "@presentation/theme";

import { BrowseChip } from "./BrowseChip";
import { browseChipsStyles } from "./style";
import type { BrowseChipsProps } from "../../interface";
import { SORT_LABEL, TIME_LABEL } from "../../filter";

export function BrowseChips({
  genre,
  time,
  sort,
  isFiltered,
  showCategory = true,
  showRefine = true,
  showReset = true,
  onRefine,
  onReset,
}: BrowseChipsProps) {
  const categoryValue = genre === "Semua" ? "Semua" : genre;
  return (
    <View
      className="flex-row flex-wrap items-center"
      style={browseChipsStyles.container}
    >
      {showCategory ? (
        <BrowseChip
          label="Kategori"
          value={categoryValue}
          selected={genre !== "Semua"}
        />
      ) : null}
      <BrowseChip
        label="Waktu"
        value={TIME_LABEL[time] ?? "Semua waktu"}
        selected={time !== "all"}
      />
      <BrowseChip
        label="Urutan"
        value={SORT_LABEL[sort] ?? "Terdekat"}
        selected={sort !== "closest"}
      />
      {showRefine ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Ubah Penyaringan"
          onPress={() => onRefine?.()}
          testID="browse-refine"
          style={browseChipsStyles.refineButton}
        >
          <Svg
            width={18}
            height={18}
            viewBox="0 0 24 24"
            fill="none"
            stroke={designColors.ink}
            strokeWidth={2}
          >
            <Path d="M4 6h16M7 12h10m-7 6h4" />
          </Svg>
        </Pressable>
      ) : null}
      {isFiltered && showReset ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Hapus Penyaringan"
          onPress={() => onReset?.()}
          testID="browse-reset"
          style={browseChipsStyles.resetButton}
        >
          <Text
            style={browseChipsStyles.resetText}
            className="text-2xs font-sans font-bold uppercase"
          >
            Hapus Penyaringan
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
