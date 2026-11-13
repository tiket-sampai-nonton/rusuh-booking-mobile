import {
  Pressable,
  ScrollView,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";

import { BrowseChips } from "../BrowseChips";
import {
  browseCategories,
  browseCategoriesCompactStyle,
  browseCategoriesInner,
  browseCategoryBtn,
  browseCategoryBtnActive,
  browseCategoryBtnCompactStyle,
  browseCategoryGridCompactStyle,
  browseCategoryHeading,
  browseCategoryHeadingWrap,
  browseCategoryLabel,
} from "../../style";

interface BrowseCategoriesSectionProps {
  readonly genre?: string;
  readonly isDesktop: boolean;
  readonly isMobileWeb?: boolean;
  readonly time: string;
  readonly sort: string;
  readonly isFiltered: boolean;
  readonly onSelect: () => void;
  readonly onReset: () => void;
}

export function BrowseCategoriesSection({
  genre = "Semua",
  isDesktop,
  isMobileWeb = false,
  time,
  sort,
  isFiltered,
  onSelect,
  onReset,
}: BrowseCategoriesSectionProps) {
  const categoryButtons = [genre].map((label) => {
    const isActive = true;
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
        key={label}
        style={buttonStyle}
        onPress={onSelect}
        testID={`category-${label === "Semua" ? "all" : label}`}
        accessibilityRole="button"
        accessibilityState={{ selected: isActive }}
      >
        <Text style={browseCategoryLabel(isActive)}>
          {label.replace(/_/g, " ")}
        </Text>
      </Pressable>
    );
  });

  const selectedFilterChips = (
    <BrowseChips
      genre={genre}
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
            <Text style={browseCategoryHeading}>Genre</Text>
          </View>
        )}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={browseCategoryGridCompactStyle}
          testID="browse-categories-scroll"
        >
          {categoryButtons}
          {selectedFilterChips}
        </ScrollView>
      </View>
    </View>
  );
}
