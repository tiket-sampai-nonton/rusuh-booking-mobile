import { Pressable, ScrollView, Text, View } from "react-native";

import { BrowseChips } from "../BrowseChips";
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
  readonly genre?: string;
  readonly time?: string;
  readonly sort?: string;
  readonly isFiltered?: boolean;
  readonly onSelect: () => void;
  readonly onReset?: () => void;
}

export function BrowseNativeCategoryBar({
  top,
  genre = "Semua",
  time = "all",
  sort = "closest",
  isFiltered = false,
  onSelect,
  onReset,
}: BrowseNativeCategoryBarProps) {
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
        {[genre].map((category) => {
          const active = true;
          return (
            <Pressable
              key={category}
              onPress={onSelect}
              style={browseNativeCategoryButton(active)}
              testID={`category-${category === "Semua" ? "all" : category}`}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={browseNativeCategoryLabel(active)}>
                {category.replaceAll("_", " ")}
              </Text>
            </Pressable>
          );
        })}
        <View style={browseNativeCategorySummary}>
          <BrowseChips
            genre={genre}
            time={time}
            sort={sort}
            isFiltered={isFiltered}
            showCategory={false}
            showRefine={false}
            showReset
            onReset={onReset}
          />
        </View>
      </ScrollView>
    </View>
  );
}
