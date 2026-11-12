import { Pressable, ScrollView, Text, View } from "react-native";

import { BrowseChips } from "../BrowseChips";
import { BROWSE_CATEGORIES, type BrowseCategoryKey } from "../categories";
import {
  browseNativeCategoryBar,
  browseNativeCategoryBarPosition,
  browseNativeCategoryButton,
  browseNativeCategoryLabel,
  browseNativeCategoryScroll,
  browseNativeCategoryScrollContent,
  browseNativeCategorySummary,
} from "../../style";

interface BrowseNativeCategoryBarProps {
  readonly top: number;
  readonly activeCategory: BrowseCategoryKey | null;
  readonly time?: string;
  readonly sort?: string;
  readonly isFiltered?: boolean;
  readonly onSelect: (category: BrowseCategoryKey) => void;
  readonly onReset?: () => void;
}

export function BrowseNativeCategoryBar({
  top,
  activeCategory,
  time = "all",
  sort = "closest",
  isFiltered = false,
  onSelect,
  onReset,
}: BrowseNativeCategoryBarProps) {
  const visibleCategories = BROWSE_CATEGORIES.filter(
    (category) =>
      category.key === "all" || category.key === (activeCategory ?? "all"),
  );
  return (
    <View
      style={[browseNativeCategoryBar, browseNativeCategoryBarPosition(top)]}
    >
      <ScrollView
        horizontal
        style={browseNativeCategoryScroll}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={browseNativeCategoryScrollContent}
      >
        {visibleCategories.map((category) => {
          const active = (activeCategory ?? "all") === category.key;
          return (
            <Pressable
              key={category.key}
              onPress={() => onSelect(category.key)}
              style={browseNativeCategoryButton(active)}
              testID={`category-${category.key}`}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={browseNativeCategoryLabel(active)}>
                {category.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <View style={browseNativeCategorySummary}>
        <BrowseChips
          genre="Semua"
          time={time}
          sort={sort}
          isFiltered={isFiltered}
          showCategory={false}
          showRefine={false}
          showReset={false}
          onReset={onReset}
        />
      </View>
    </View>
  );
}
