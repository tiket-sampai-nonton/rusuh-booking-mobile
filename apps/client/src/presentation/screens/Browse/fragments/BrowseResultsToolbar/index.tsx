import { Pressable, Text, View, Platform } from "react-native";

import {
  browseCountText,
  browseCountValue,
  browseFilterButton,
  browseFilterButtonCompactStyle,
  browseHeader,
  browseHeaderCompactStyle,
  browseNativeHeader,
  browseNativeViewButton,
  browseSortControl,
  browseSortSelect,
  browseSortSelectCompactStyle,
  browseSortControlCompactStyle,
  browseToolbarActions,
  browseToolbarActionsCompactStyle,
  browseViewBtn,
  browseViewBtnActive,
  browseViewDivider,
  browseViewToggle,
} from "../../style";
import { FilterIcon } from "./icons/FilterIcon";
import { GridIcon } from "./icons/GridIcon";
import { ListIcon } from "./icons/ListIcon";

const SORT_OPTIONS = [
  { key: "closest", label: "Terdekat" },
  { key: "furthest", label: "Terjauh" },
] as const;

interface BrowseResultsToolbarProps {
  readonly count: number;
  readonly isNative: boolean;
  readonly isMobileWeb?: boolean;
  readonly sortBy: string;
  readonly viewMode: "grid" | "list";
  readonly onFilterPress: () => void;
  readonly onSortChange: (sort: string) => void;
  readonly onViewModeChange: (mode: "grid" | "list") => void;
}

export function BrowseResultsToolbar({
  count,
  isNative,
  isMobileWeb = false,
  sortBy,
  viewMode,
  onFilterPress,
  onSortChange,
  onViewModeChange,
}: BrowseResultsToolbarProps) {
  return (
    <View
      style={[
        browseHeader,
        isNative && browseNativeHeader,
        isMobileWeb && browseHeaderCompactStyle,
      ]}
    >
      <Text style={browseCountText} testID="browse-count">
        Menampilkan <Text style={browseCountValue}>{count}</Text> event
      </Text>
      <View
        style={[
          browseToolbarActions,
          isMobileWeb && browseToolbarActionsCompactStyle,
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Saring event"
          onPress={onFilterPress}
          style={[
            browseFilterButton,
            isMobileWeb && browseFilterButtonCompactStyle,
          ]}
          testID="browse-filter"
        >
          <FilterIcon />
        </Pressable>
        {Platform.OS === "web" && isMobileWeb ? (
          <View
            style={[
              browseSortSelect,
              isMobileWeb && browseSortSelectCompactStyle,
            ]}
          >
            <select
              aria-label="Urutkan event"
              value={sortBy}
              onChange={(event) => onSortChange(event.target.value)}
              style={{
                ...browseSortControl,
                ...browseSortControlCompactStyle,
              }}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </View>
        ) : null}
        {!isMobileWeb && (
          <View style={browseViewToggle}>
            <Pressable
              style={[
                viewMode === "grid" ? browseViewBtnActive : browseViewBtn,
                isNative && browseNativeViewButton,
              ]}
              onPress={() => onViewModeChange("grid")}
              testID="view-grid"
            >
              <GridIcon active={viewMode === "grid"} />
            </Pressable>
            <View style={browseViewDivider} />
            <Pressable
              style={[
                viewMode === "list" ? browseViewBtnActive : browseViewBtn,
                isNative && browseNativeViewButton,
              ]}
              onPress={() => onViewModeChange("list")}
              testID="view-list"
            >
              <ListIcon active={viewMode === "list"} />
            </Pressable>
          </View>
        )}
      </View>
    </View>
  );
}
