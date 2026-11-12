import {
  Pressable,
  ScrollView,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { BrowseChips } from "../BrowseChips";
import { BROWSE_CATEGORIES, type BrowseCategoryKey } from "../categories";
import {
  browseCategories,
  browseCategoriesCompactStyle,
  browseCategoriesInner,
  browseCategoryBtn,
  browseCategoryBtnActive,
  browseCategoryBtnCompactStyle,
  browseCategoryControls,
  browseCategoryControlsCompact,
  browseCategoryGrid,
  browseCategoryGridCompactStyle,
  browseCategoryHeading,
  browseCategoryHeadingWrap,
  browseCategoryLabel,
} from "../../style";

interface BrowseCategoriesSectionProps {
  readonly activeCategory: BrowseCategoryKey | null;
  readonly isDesktop: boolean;
  readonly isMobileWeb?: boolean;
  readonly time: string;
  readonly sort: string;
  readonly isFiltered: boolean;
  readonly onSelect: (category: BrowseCategoryKey) => void;
  readonly onReset: () => void;
}

export function BrowseCategoriesSection({
  activeCategory,
  isDesktop,
  isMobileWeb = false,
  time,
  sort,
  isFiltered,
  onSelect,
  onReset,
}: BrowseCategoriesSectionProps) {
  const visibleCategories = BROWSE_CATEGORIES.filter(
    (category) =>
      category.key === "all" || category.key === (activeCategory ?? "all"),
  );

  const categoryButtons = visibleCategories.map((category) => {
    const isActive = (activeCategory ?? "all") === category.key;
    let buttonStyle: StyleProp<ViewStyle> = browseCategoryBtn;
    if (isActive) buttonStyle = browseCategoryBtnActive;
    if (isMobileWeb) {
      const mobileButtonStyle = isActive
        ? browseCategoryBtnActive
        : browseCategoryBtn;
      buttonStyle = [mobileButtonStyle, browseCategoryBtnCompactStyle];
    }
    return (
      <Pressable
        key={category.key}
        style={buttonStyle}
        onPress={() => onSelect(category.key)}
        testID={`category-${category.key}`}
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
      >
        <Text style={browseCategoryLabel(isActive)}>{category.label}</Text>
      </Pressable>
    );
  });

  const selectedFilterChips = (
    <BrowseChips
      genre="Semua"
      time={time}
      sort={sort}
      isFiltered={isFiltered}
      showCategory={false}
      showRefine={false}
      onReset={onReset}
    />
  );

  return (
    <View
      style={[browseCategories, isMobileWeb && browseCategoriesCompactStyle]}
    >
      <View style={browseCategoriesInner(isDesktop)}>
        {!isMobileWeb && (
          <View style={browseCategoryHeadingWrap}>
            <Text style={browseCategoryHeading}>Kategori</Text>
          </View>
        )}
        {isMobileWeb ? (
          <View style={[browseCategoryControls, browseCategoryControlsCompact]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={browseCategoryGridCompactStyle}
              testID="browse-categories-scroll"
            >
              {categoryButtons}
            </ScrollView>
            {selectedFilterChips}
          </View>
        ) : (
          <View style={browseCategoryControls}>
            <View style={browseCategoryGrid}>{categoryButtons}</View>
            {selectedFilterChips}
          </View>
        )}
      </View>
    </View>
  );
}
