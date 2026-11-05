import { useEffect } from 'react';
import { Image, Platform, View, type ImageStyle } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { pointerEventsNone } from '@presentation/utils/style';

import { EASE, FADE_DURATION_MS } from '../../constants';
import { componentStyles, styleForHeroSlideAnimatedView0, styleForHeroSlideAnimatedView1, styleForHeroSlideImage2 } from '../../style';

export function HeroSlide({
  uri,
  active,
  isPrev,
  isGlitching,
  zoomValue,
  reduced,
}: {
  readonly uri: string;
  readonly active: boolean;
  readonly isPrev: boolean;
  readonly isGlitching: boolean;
  readonly zoomValue: Animated.SharedValue<number>;
  readonly reduced: boolean;
}) {
  const isWeb = Platform.OS === 'web';
  const opacity = useSharedValue(active || isPrev ? 1 : 0);
  const glitchX = useSharedValue(0);
  const glitchY = useSharedValue(0);

  // Opacity transition (1s)
  useEffect(() => {
    if (reduced) {
      opacity.value = active || isPrev ? 1 : 0;
      return;
    }
    opacity.value = withTiming(active || isPrev ? 1 : 0, {
      duration: FADE_DURATION_MS,
      easing: EASE,
    });
  }, [active, isPrev, reduced, opacity]);

  // Glitch effect (0.3s) on slide change
  useEffect(() => {
    if (!isGlitching || reduced) return;

    // Simulate glitch keyframes from prototype
    glitchX.value = withSequence(
      withTiming(-5, { duration: 60 }),
      withTiming(5, { duration: 60 }),
      withTiming(-3, { duration: 60 }),
      withTiming(3, { duration: 60 }),
      withTiming(0, { duration: 60 })
    );
    glitchY.value = withSequence(
      withTiming(5, { duration: 60 }),
      withTiming(-5, { duration: 60 }),
      withTiming(-3, { duration: 60 }),
      withTiming(3, { duration: 60 }),
      withTiming(0, { duration: 60 })
    );
  }, [isGlitching, reduced, glitchX, glitchY]);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    zIndex: active ? 1 : 0,
  }));

  // Ken Burns zoom (scale 1 → 1.05 → 1, 20s) + glitch transform
  const imageContainerStyle = useAnimatedStyle(() => {
    const scale = reduced ? 1 : interpolate(zoomValue.value, [0, 0.5, 1], [1, 1.05, 1]);
    return {
      transform: [{ scale }, { translateX: glitchX.value }, { translateY: glitchY.value }],
    };
  });

  // Web: CSS filter for grayscale (prototype: grayscale(100%) contrast(1.1))
  const webImageFilter = isWeb
    ? ({ filter: "grayscale(100%) contrast(1.1)" } as unknown as ImageStyle)
    : {};

  return (
    <Animated.View
      style={[
        styleForHeroSlideAnimatedView0(),
        containerStyle,
      ]}
    >
      <Animated.View style={[styleForHeroSlideAnimatedView1(), imageContainerStyle]}>
        <Image
          source={{ uri }}
          resizeMode="cover"
          style={[styleForHeroSlideImage2(), webImageFilter]}
          accessibilityIgnoresInvertColors
        />
      </Animated.View>

      {/* Native: grayscale approximation with stronger desaturation */}
      {!isWeb && (
        <>
          {/* Dark layer for contrast reduction */}
          <View style={[componentStyles.elementPosition0, pointerEventsNone]} />
          {/* Gray layer for desaturation */}
          <View style={[componentStyles.elementPosition1, pointerEventsNone]} />
        </>
      )}
    </Animated.View>
  );
}
