import { useEffect } from 'react';
import { Platform, Text, View, useWindowDimensions } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { interFonts, v2Colors } from '@presentation/theme';

const LETTERS = ['R', 'U', 'S', 'U', 'H', 'T', 'I', 'K', 'E', 'T'];

function SplashLetter({ letter, index, reducedMotion }: { readonly letter: string; readonly index: number; readonly reducedMotion: boolean }) {
  const progress = useSharedValue(reducedMotion ? 1 : 0);

  useEffect(() => {
    progress.value = reducedMotion
      ? 1
      : withDelay(400 + index * 50, withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) }));
  }, [index, progress, reducedMotion]);

  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ translateY: interpolate(progress.value, [0, 1], [24, 0]) }],
  }));

  return (
    <Animated.Text style={[{ color: index === 0 ? '#ff0000' : v2Colors.ground, fontFamily: interFonts.black, fontSize: 34, lineHeight: 38 }, style]}>
      {letter}
    </Animated.Text>
  );
}

export function NativeLaunchSplash({ onFinish }: { readonly onFinish: () => void }) {
  const reducedMotion = useReducedMotion();
  const { height, width } = useWindowDimensions();
  const progress = useSharedValue(0);
  const exit = useSharedValue(0);

  useEffect(() => {
    progress.value = reducedMotion ? 1 : withDelay(1300, withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) }));
    const exitTimer = setTimeout(() => {
      exit.value = withTiming(1, { duration: reducedMotion ? 1 : 600, easing: Easing.out(Easing.cubic) }, (finished) => {
        if (finished) runOnJS(onFinish)();
      });
    }, 2500);
    return () => clearTimeout(exitTimer);
  }, [exit, onFinish, progress, reducedMotion]);

  const screenStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(exit.value, [0, 1], [0, -height]) }],
  }));
  const progressStyle = useAnimatedStyle(() => ({ width: interpolate(progress.value, [0, 1], [0, width - 80]) }));
  const markStyle = useAnimatedStyle(() => ({
    opacity: reducedMotion ? 1 : progress.value,
    transform: [{ translateY: reducedMotion ? 0 : interpolate(progress.value, [0, 1], [20, 0]) }, { scale: reducedMotion ? 1 : interpolate(progress.value, [0, 1], [0.9, 1]) }],
  }));

  if (Platform.OS === 'web') return null;

  return (
    <Animated.View accessibilityLabel="Memuat Rusuh Tiket" accessibilityRole="progressbar" style={[{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, zIndex: 9999, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: v2Colors.ink }, screenStyle]} testID="native-launch-splash">
      <View pointerEvents="none" style={{ position: 'absolute', top: 24, left: 24, width: 24, height: 24, borderTopWidth: 2, borderLeftWidth: 2, borderColor: '#ffffff33' }} />
      <View pointerEvents="none" style={{ position: 'absolute', top: 24, right: 24, width: 24, height: 24, borderTopWidth: 2, borderRightWidth: 2, borderColor: '#ffffff33' }} />
      <View pointerEvents="none" style={{ position: 'absolute', bottom: 24, left: 24, width: 24, height: 24, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: '#ffffff33' }} />
      <View pointerEvents="none" style={{ position: 'absolute', right: 24, bottom: 24, width: 24, height: 24, borderRightWidth: 2, borderBottomWidth: 2, borderColor: '#ffffff33' }} />
      <Text style={{ position: 'absolute', top: 28, right: 56, color: '#ffffff66', fontFamily: interFonts.bold, fontSize: 10, letterSpacing: 1 }}>V2.0</Text>

      <View style={{ alignItems: 'center', gap: 16 }}>
        <Animated.View style={[{ width: 80, height: 80, alignItems: 'center', justifyContent: 'center', backgroundColor: v2Colors.ground, borderWidth: 3, borderColor: v2Colors.ground }, markStyle]}>
          <Text style={{ color: v2Colors.ink, fontFamily: interFonts.black, fontSize: 48, lineHeight: 54 }}>R</Text>
        </Animated.View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flexDirection: 'row' }}>{LETTERS.slice(0, 5).map((letter, index) => <SplashLetter key={`rusuh-${index}`} letter={letter} index={index} reducedMotion={Boolean(reducedMotion)} />)}</View>
          <View style={{ flexDirection: 'row' }}>{LETTERS.slice(5).map((letter, index) => <SplashLetter key={`tiket-${index}`} letter={letter} index={index + 5} reducedMotion={Boolean(reducedMotion)} />)}</View>
        </View>
        <Text style={{ color: '#ffffff99', fontFamily: interFonts.medium, fontSize: 14, letterSpacing: 2 }}>Tiket Tanpa Ribet</Text>
      </View>

      <View style={{ position: 'absolute', right: 40, bottom: 70, left: 40, alignItems: 'center', gap: 10 }}>
        <View style={{ width: '100%', height: 2, overflow: 'hidden', backgroundColor: '#ffffff33' }}>
          <Animated.View style={[{ height: '100%', backgroundColor: v2Colors.ground }, progressStyle]} />
        </View>
        <Text style={{ color: '#ffffff66', fontFamily: interFonts.semiBold, fontSize: 10, letterSpacing: 2, textTransform: 'uppercase' }}>Memuat</Text>
      </View>
    </Animated.View>
  );
}
