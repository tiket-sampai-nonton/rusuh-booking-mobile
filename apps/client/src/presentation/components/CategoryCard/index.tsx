/**
 * RBT-096 — CategoryCard
 *
 * MASTER-SPEC + 01-home.html .category-card:
 * - aspect-ratio: 1:1
 * - Image: grayscale(100%) brightness(0.5) → grayscale(0%) brightness(0.6) on hover
 * - Image: scale(1.1) → scale(1) on hover
 * - Content overlay at bottom
 * - Category name: translateY(20px) → translateY(0) on hover
 * - Count: opacity 0 → 0.8, translateY(10px) → translateY(0) on hover (delayed 0.1s)
 * - Animated border on hover: inset border fades in + scales to 1
 */
import { useCallback, useState } from "react";
import { Platform, Pressable, View } from "react-native";
import { CachedImage } from "@presentation/components/CachedImage";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { designEasing, designDuration } from "@presentation/theme";
import { pointerEventsNone } from "@presentation/utils/style";
import {
  componentStyles,
  getCategoryImageStyle,
  styleForCategoryCardAnimatedView0,
  styleForCategoryCardAnimatedView1,
  styleForCategoryCardAnimatedView2,
  styleForCategoryCardAnimatedView3,
  styleForCategoryCardAnimatedText4,
  styleForCategoryCardAnimatedText5,
} from "./style";

const EASE = Easing.bezier(...designEasing.primary);
const isWeb = Platform.OS === "web";

export interface CategoryCardProps {
  readonly name: string;
  readonly count: string;
  readonly imageUri: string;
  readonly onPress: () => void;
  readonly testID?: string;
}

export function CategoryCard({
  name,
  count,
  imageUri,
  onPress,
  testID,
}: CategoryCardProps) {
  const reducedMotion = useReducedMotion();
  const hovered = useSharedValue(0);
  const [isHovered, setIsHovered] = useState(false); // For web CSS filter

  const setHovered = useCallback(
    (v: boolean) => {
      setIsHovered(v); // For web CSS
      if (reducedMotion) {
        hovered.value = v ? 1 : 0;
        return;
      }
      hovered.value = withTiming(v ? 1 : 0, {
        duration: designDuration.slow + 100, // 0.6s per prototype
        easing: EASE,
      });
    },
    [reducedMotion, hovered],
  );

  // Image: scale 1.1 → 1
  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(hovered.value, [0, 1], [1.1, 1]),
      },
    ],
  }));

  // Dark overlay for brightness (on top of grayscale)
  const darkOverlayStyle = useAnimatedStyle(() => ({
    opacity: interpolate(hovered.value, [0, 1], [0.5, 0.4]),
  }));

  // Native only: grayscale overlay fades out on hover
  const nativeGrayscaleStyle = useAnimatedStyle(() => ({
    opacity: interpolate(hovered.value, [0, 1], [0.6, 0]),
  }));

  // Name: translateY 20 → 0
  const nameStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(hovered.value, [0, 1], [20, 0]),
      },
    ],
  }));

  // Count: opacity 0 → 0.8, translateY 10 → 0 (delayed)
  const countStyle = useAnimatedStyle(() => {
    // Delay the count animation by 0.1s (100ms)
    const delayedProgress = Math.max(0, (hovered.value - 0.1) / 0.9);
    return {
      opacity: interpolate(delayedProgress, [0, 1], [0, 0.8]),
      transform: [
        {
          translateY: interpolate(delayedProgress, [0, 1], [10, 0]),
        },
      ],
    };
  });

  // Border: opacity 0 → 1, scale 1.1 → 1
  const borderStyle = useAnimatedStyle(() => ({
    opacity: hovered.value,
    transform: [
      {
        scale: interpolate(hovered.value, [0, 1], [1.1, 1]),
      },
    ],
  }));

  // Web: use CSS filter for proper grayscale transition
  const webImageStyle = getCategoryImageStyle(isWeb, isHovered);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Kategori ${name}, ${count}`}
      testID={testID}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      onPressIn={() => setHovered(true)}
      onPressOut={() => setHovered(false)}
      style={componentStyles.container}
    >
      {/* Background image with grayscale + zoom */}
      <Animated.View style={[styleForCategoryCardAnimatedView0(), imageStyle]}>
        <CachedImage
          source={{ uri: imageUri }}
          resizeMode="cover"
          style={webImageStyle}
          accessibilityIgnoresInvertColors
        />
      </Animated.View>

      {/* Native only: grayscale overlay (fades out on hover to reveal color) */}
      {!isWeb && (
        <Animated.View
          style={[
            styleForCategoryCardAnimatedView1(),
            nativeGrayscaleStyle,
            pointerEventsNone,
          ]}
        />
      )}

      {/* Dark overlay for brightness effect (both web and native) */}
      {!isWeb && (
        <Animated.View
          style={[
            styleForCategoryCardAnimatedView2(),
            darkOverlayStyle,
            pointerEventsNone,
          ]}
        />
      )}

      {/* Animated border on hover */}
      <Animated.View
        style={[
          styleForCategoryCardAnimatedView3(),
          borderStyle,
          pointerEventsNone,
        ]}
      />

      {/* Content overlay */}
      <View style={componentStyles.elementPosition0}>
        {/* Category name */}
        <Animated.Text style={[styleForCategoryCardAnimatedText4(), nameStyle]}>
          {name}
        </Animated.Text>

        {/* Event count */}
        <Animated.Text
          style={[styleForCategoryCardAnimatedText5(), countStyle]}
        >
          {count}
        </Animated.Text>
      </View>
    </Pressable>
  );
}

export default CategoryCard;
