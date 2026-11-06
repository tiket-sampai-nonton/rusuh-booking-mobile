import { Pressable, Text, View } from "react-native";

import { BROWSE_CATEGORIES, type BrowseCategoryKey } from "../categories";
import {
  browseCategories,
  browseCategoriesInner,
  browseCategoryBtn,
  browseCategoryBtnActive,
  browseCategoryGrid,
  browseCategoryHeading,
  browseCategoryHeadingWrap,
  browseCategoryLabel,
} from "../../style";

interface BrowseCategoriesSectionProps {
  readonly activeCategory: BrowseCategoryKey;
  readonly isDesktop: boolean;
  readonly onSelect: (category: BrowseCategoryKey) => void;
}

export function BrowseCategoriesSection({
  activeCategory,
  isDesktop,
  onSelect,
}: BrowseCategoriesSectionProps) {
  return (
    <View style={browseCategories}>
      <View style={browseCategoriesInner(isDesktop)}>
        <View style={browseCategoryHeadingWrap}>
          <Text style={browseCategoryHeading}>Kategori</Text>
        </View>
        <View style={browseCategoryGrid}>
          {BROWSE_CATEGORIES.map((category) => {
            const isActive = activeCategory === category.key;
            return (
              <Pressable
                key={category.key}
                style={isActive ? browseCategoryBtnActive : browseCategoryBtn}
                onPress={() => onSelect(category.key)}
                testID={`category-${category.key}`}
              >
                <Text style={browseCategoryLabel(isActive)}>
                  {category.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
