/**
 * RBT-096 — V2CategoryCard
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
import { useCallback, useState } from 'react';
import { Image, Platform, Pressable, View, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { v2Colors, v2Easing, v2Duration, v2SpacingSemantic, interFonts } from '@presentation/theme';

const EASE = Easing.bezier(...v2Easing.primary);
const isWeb = Platform.OS === 'web';

export interface V2CategoryCardProps {
  readonly name: string;
  readonly count: string;
  readonly imageUri: string;
  readonly onPress: () => void;
  readonly testID?: string;
}

export function V2CategoryCard({
  name,
  count,
  imageUri,
  onPress,
  testID,
}: V2CategoryCardProps) {
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
        duration: v2Duration.slow + 100, // 0.6s per prototype
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

  const containerStyle: ViewStyle = {
    aspectRatio: 1,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: v2Colors.ground,
  };

  // Web: use CSS filter for proper grayscale transition
  const webImageStyle = isWeb
    ? {
        width: '100%',
        height: '100%',
        filter: isHovered ? 'grayscale(0%) brightness(0.6)' : 'grayscale(100%) brightness(0.5)',
        transition: 'filter 0.6s cubic-bezier(0.33, 1, 0.68, 1)',
      } as any
    : {
        width: '100%',
        height: '100%',
      };

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
      style={containerStyle}
    >
      {/* Background image with grayscale + zoom */}
      <Animated.View style={[{ position: 'absolute', inset: 0 }, imageStyle]}>
        <Image
          source={{ uri: imageUri }}
          resizeMode="cover"
          style={webImageStyle}
          accessibilityIgnoresInvertColors
        />
      </Animated.View>

      {/* Native only: grayscale overlay (fades out on hover to reveal color) */}
      {!isWeb && (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#808080',
            },
            nativeGrayscaleStyle,
          ]}
        />
      )}

      {/* Dark overlay for brightness effect (both web and native) */}
      {!isWeb && (
        <Animated.View
          pointerEvents="none"
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: v2Colors.ink,
            },
            darkOverlayStyle,
          ]}
        />
      )}

      {/* Animated border on hover */}
      <Animated.View
        pointerEvents="none"
        style={[
          {
            position: 'absolute',
            top: v2SpacingSemantic.s,
            left: v2SpacingSemantic.s,
            right: v2SpacingSemantic.s,
            bottom: v2SpacingSemantic.s,
            borderWidth: 2,
            borderColor: v2Colors.ground,
          },
          borderStyle,
        ]}
      />

      {/* Content overlay */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: v2SpacingSemantic.m,
        }}
      >
        {/* Category name */}
        <Animated.Text
          style={[
            {
              color: v2Colors.ground,
              fontSize: 20,
              fontWeight: '900',
              textTransform: 'uppercase',
              letterSpacing: 0.4,
              fontFamily: interFonts.bold,
            },
            nameStyle,
          ]}
        >
          {name}
        </Animated.Text>

        {/* Event count */}
        <Animated.Text
          style={[
            {
              color: v2Colors.ground,
              fontSize: 14,
              fontFamily: interFonts.bold,
              marginTop: 4,
            },
            countStyle,
          ]}
        >
          {count}
        </Animated.Text>
      </View>
    </Pressable>
  );
}

export default V2CategoryCard;
