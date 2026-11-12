import { Animated, Platform, Pressable, Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ArrowIcon } from "@presentation/components/ArrowIcon";
import { BrandMark } from "@presentation/components/BrandMark";
import {
  designBorders,
  designColors,
} from "@presentation/theme/event-design-tokens";

import { designDetailStyles as styles } from "../../../style";
import {
  detailHeaderIconColor,
  detailHeaderPressedStyle,
  detailHeaderStyles,
} from "./style";

export interface HeaderProps {
  readonly onBack: () => void;
  readonly onShare?: () => void;
  readonly isScrolled?: boolean;
  readonly isMobileWeb?: boolean;
}

export function Header({
  onBack,
  onShare,
  isScrolled = false,
  isMobileWeb = false,
}: HeaderProps) {
  const isNative = Platform.OS !== "web";
  const insets = useSafeAreaInsets();
  const headerStyle = isNative
    ? [
        styles.header,
        { paddingTop: insets.top + 8 },
        isScrolled && {
          backgroundColor: designColors.ground,
          borderBottomWidth: designBorders.standard,
          borderBottomColor: designColors.ink,
        },
      ]
    : [styles.header, isMobileWeb && styles.mobileWebDetailHeader];

  return (
    <Animated.View style={headerStyle}>
      {isNative ? (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kembali"
            onPress={onBack}
            style={({ pressed }) => [
              styles.backBtn,
              detailHeaderStyles.iconButton,
              detailHeaderPressedStyle(pressed),
            ]}
          >
            {({ pressed }) => (
              <Svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke={detailHeaderIconColor(pressed)}
                strokeWidth={2}
              >
                <Path d="m15 18-6-6 6-6" />
              </Svg>
            )}
          </Pressable>

          <View style={styles.headerActions}>
            {onShare && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Bagikan"
                onPress={onShare}
                testID="event-detail-share"
                style={({ pressed }) => [
                  styles.iconBtn,
                  detailHeaderStyles.iconButton,
                  detailHeaderPressedStyle(pressed),
                ]}
              >
                {({ pressed }) => (
                  <ShareIcon color={detailHeaderIconColor(pressed)} />
                )}
              </Pressable>
            )}
          </View>
        </>
      ) : (
        <>
          <View style={styles.headerLeft}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Kembali"
              onPress={onBack}
              style={styles.backBtn}
            >
              <View style={detailHeaderStyles.webBackContent}>
                <ArrowIcon direction="left" color={designColors.ink} />
                {!isMobileWeb && (
                  <Text style={detailHeaderStyles.webBackLabel}>Kembali</Text>
                )}
              </View>
            </Pressable>
            <BrandMark size={28} color={designColors.ink} />
          </View>

          <View style={styles.headerActions}>
            {onShare && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Bagikan"
                onPress={onShare}
                style={styles.iconBtn}
                testID="event-detail-share"
              >
                <ShareIcon color={designColors.ink} />
              </Pressable>
            )}
          </View>
        </>
      )}
    </Animated.View>
  );
}

function ShareIcon({ color }: { readonly color: string }) {
  return (
    <Svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="m8.7 10.7 6.6-3.4M8.7 13.3l6.6 3.4" />
      <Circle cx={6} cy={12} r={3} />
      <Circle cx={18} cy={5} r={3} />
      <Circle cx={18} cy={19} r={3} />
    </Svg>
  );
}
