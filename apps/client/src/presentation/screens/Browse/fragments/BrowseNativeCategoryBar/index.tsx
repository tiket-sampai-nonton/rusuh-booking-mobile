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
  readonly activeCategory: BrowseCategoryKey;
  readonly onSelect: (category: BrowseCategoryKey) => void;
}

export function BrowseNativeCategoryBar({
  top,
  activeCategory,
  onSelect,
}: BrowseNativeCategoryBarProps) {
  return (
    <View
      style={[browseNativeCategoryBar, browseNativeCategoryBarPosition(top)]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={browseNativeCategoryScrollContent}
      >
        {BROWSE_CATEGORIES.map((category) => {
          const active = activeCategory === category.key;
          return (
            <Pressable
              key={category.key}
              onPress={() => onSelect(category.key)}
              style={browseNativeCategoryButton(active)}
              testID={`category-${category.key}`}
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
