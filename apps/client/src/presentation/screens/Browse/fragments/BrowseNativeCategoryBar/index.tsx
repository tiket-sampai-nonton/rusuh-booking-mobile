import { Pressable, ScrollView, Text, View } from "react-native";

import { BROWSE_CATEGORIES, type BrowseCategoryKey } from "../categories";
import {
  browseNativeCategoryBar,
  browseNativeCategoryBarPosition,
  browseNativeCategoryButton,
  browseNativeCategoryLabel,
  browseNativeCategoryScrollContent,
} from "../../style";

interface BrowseNativeCategoryBarProps {
  readonly top: number;
  readonly activeCategory: BrowseCategoryKey | null;
  readonly onSelect: (category: BrowseCategoryKey) => void;
}

export function BrowseNativeCategoryBar({
  top,
  activeCategory,
  onSelect,
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
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={browseNativeCategoryScrollContent}
      >
        {visibleCategories.map((category) => {
          const active = activeCategory === category.key;
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
    </View>
  );
}
