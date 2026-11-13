import { Pressable, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Icon } from "@presentation/components/Icon";
import { designColors } from "@presentation/theme";
import { styles } from "./style";
import {
  sectionHeaderContainerStyle,
  sectionHeaderTitleStyle,
  sectionLinkStyle,
  sectionLinkTextStyle,
} from "./style";

interface SectionHeaderProps {
  readonly title: string;
  readonly linkText?: string;
  readonly onLinkPress?: () => void;
  readonly showFilter?: boolean;
  readonly onFilterPress?: () => void;
  readonly isNative?: boolean;
  readonly isMobileWeb?: boolean;
}

export function SectionHeader({
  title,
  linkText,
  onLinkPress,
  showFilter,
  onFilterPress,
  isNative = false,
  isMobileWeb = false,
}: SectionHeaderProps) {
  return (
    <View
      style={[
        styles.container,
        sectionHeaderContainerStyle(isNative, isMobileWeb),
      ]}
    >
      <Text
        accessibilityRole="header"
        style={[styles.title, sectionHeaderTitleStyle(isNative, isMobileWeb)]}
      >
        {title}
      </Text>

      <View style={styles.actions}>
        {showFilter ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Saring Event"
            onPress={onFilterPress}
            testID="filter-btn"
            style={styles.filterButton}
          >
            <Svg
              width={16}
              height={16}
              viewBox="0 0 24 24"
              fill="none"
              stroke={designColors.ink}
              strokeWidth={2}
            >
              <Path d="M4 6h16M7 12h10m-7 6h4" />
            </Svg>
          </Pressable>
        ) : null}

        {linkText && onLinkPress ? (
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={linkText}
            onPress={onLinkPress}
            style={[styles.link, sectionLinkStyle(isNative, isMobileWeb)]}
          >
            <Text
              style={[
                styles.linkText,
                sectionLinkTextStyle(isNative, isMobileWeb),
              ]}
            >
              {linkText}
            </Text>
            <Icon
              color={sectionArrowColor(isNative)}
              size={sectionArrowSize(isNative)}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function sectionArrowColor(isNative: boolean): string {
  return isNative ? designColors.inkMuted : designColors.ink;
}

function sectionArrowSize(isNative: boolean): number {
  if (isNative) return 14;
  return 16;
}
