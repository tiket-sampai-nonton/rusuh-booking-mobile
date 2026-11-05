import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';

import { designColors } from '@presentation/theme';

import { LOADER_EASE, LOADER_PROGRESS_DURATION_MS } from '../constants';
import { loaderStyles } from '../style';

interface ProgressBarProps {
  readonly reducedMotion: boolean;
  readonly visible: boolean;
}

export function ProgressBar({ reducedMotion, visible }: ProgressBarProps) {
  const sweep = useSharedValue(0);

  useEffect(() => {
    if (!visible || reducedMotion) {
      cancelAnimation(sweep);
      sweep.value = reducedMotion ? 1 : 0;
      return;
    }

    sweep.value = 0;
    sweep.value = withRepeat(
      withTiming(1, {
        duration: LOADER_PROGRESS_DURATION_MS,
        easing: LOADER_EASE,
      }),
      -1,
      false,
    );

    return () => cancelAnimation(sweep);
  }, [visible, reducedMotion, sweep]);

  const barStyle = useAnimatedStyle(() => ({
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '40%',
    backgroundColor: designColors.ground,
    transform: [{ translateX: `${-40 + sweep.value * 250}%` as `${number}%` }],
  }));

  if (reducedMotion) {
    return <View style={loaderStyles.reducedProgress} />;
  }

  return <Animated.View style={barStyle} />;
}
