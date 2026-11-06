import { Animated, Platform, Pressable, Text, View } from "react-native";
import Svg, { Line, Path, Polyline } from "react-native-svg";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ArrowIcon } from "@presentation/components/ArrowIcon";
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
                style={({ pressed }) => [
                  styles.iconBtn,
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
                    <Path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <Polyline points="16,6 12,2 8,6" />
                    <Line x1="12" y1="2" x2="12" y2="15" />
                  </Svg>
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
                <Text style={detailHeaderStyles.webBackLabel}>Kembali</Text>
              </View>
            </Pressable>
            <Text style={styles.logo}>Rusuh Tiket</Text>
          </View>

          <View style={styles.headerActions}>
            {onShare && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Bagikan"
                onPress={onShare}
                style={styles.iconBtn}
              >
                <Svg
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={designColors.ink}
                  strokeWidth={2}
                >
                  <Path d="M12 16V3m0 0L7 8m5-5 5 5M5 13v7h14v-7" />
                </Svg>
              </Pressable>
            )}
          </View>
        </>
      )}
    </Animated.View>
  );
}
