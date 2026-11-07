import { Pressable, ScrollView, Text, View } from "react-native";

import { BROWSE_CATEGORIES, type BrowseCategoryKey } from "../categories";
import {
  browseCategories,
  browseCategoriesCompactStyle,
  browseCategoriesInner,
  browseCategoryBtn,
  browseCategoryBtnActive,
  browseCategoryBtnCompactStyle,
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
  readonly onSelect: (category: BrowseCategoryKey) => void;
}

export function BrowseCategoriesSection({
  activeCategory,
  isDesktop,
  isMobileWeb = false,
  onSelect,
}: BrowseCategoriesSectionProps) {
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
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={browseCategoryGridCompactStyle}
            testID="browse-categories-scroll"
          >
            {BROWSE_CATEGORIES.map((category) => {
              const isActive = activeCategory === category.key;
              return (
                <Pressable
                  key={category.key}
                  style={[
                    isActive ? browseCategoryBtnActive : browseCategoryBtn,
                    browseCategoryBtnCompactStyle,
                  ]}
                  onPress={() => onSelect(category.key)}
                  testID={`category-${category.key}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                >
                  <Text style={browseCategoryLabel(isActive)}>
                    {category.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        ) : (
          <View style={browseCategoryGrid}>
            {BROWSE_CATEGORIES.map((category) => {
              const isActive = activeCategory === category.key;
              return (
                <Pressable
                  key={category.key}
                  style={isActive ? browseCategoryBtnActive : browseCategoryBtn}
                  onPress={() => onSelect(category.key)}
                  testID={`category-${category.key}`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                >
                  <Text style={browseCategoryLabel(isActive)}>
                    {category.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}
