import { useEffect } from "react";
import { Platform, Text, View, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { pointerEventsNone } from "@presentation/utils/style";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BrandSymbol } from "@presentation/components/BrandSymbol";
import { NativeStatusBarBackdrop } from "@presentation/components/NativeStatusBarBackdrop";
import { SplashLetter } from "./SplashLetter";
import {
  componentStyles,
  styleForNativeLaunchSplashAnimatedView1,
  styleForNativeLaunchSplashAnimatedView2,
  styleForNativeLaunchSplashAnimatedView3,
} from "./style";

const FIRST_WORD_LETTERS = [
  { id: "r", letter: "R", index: 0 },
  { id: "u-first", letter: "U", index: 1 },
  { id: "s", letter: "S", index: 2 },
  { id: "u-second", letter: "U", index: 3 },
  { id: "h", letter: "H", index: 4 },
];
const SECOND_WORD_LETTERS = [
  { id: "t-first", letter: "T", index: 5 },
  { id: "i", letter: "I", index: 6 },
  { id: "k", letter: "K", index: 7 },
  { id: "e", letter: "E", index: 8 },
  { id: "t-second", letter: "T", index: 9 },
];

export function NativeLaunchSplash({
  onFinish,
  isReadyToExit = true,
  statusText = "Memuat",
  buildLabel = "0.0.0.000",
}: {
  readonly onFinish: () => void;
  readonly isReadyToExit?: boolean;
  readonly statusText?: string;
  readonly buildLabel?: string;
}) {
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const { height, width } = useWindowDimensions();
  const progress = useSharedValue(0);
  const exit = useSharedValue(0);
  const targetProgress = isReadyToExit ? 1 : 0.72;
  const progressDuration = isReadyToExit ? 300 : 1800;

  useEffect(() => {
    if (reducedMotion) {
      progress.value = 1;
      return;
    }
    progress.value = withTiming(targetProgress, {
      duration: progressDuration,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, progressDuration, reducedMotion, targetProgress]);

  useEffect(() => {
    if (!isReadyToExit) return;
    const exitTimer = setTimeout(() => {
      exit.value = withTiming(
        1,
        { duration: reducedMotion ? 1 : 600, easing: Easing.out(Easing.cubic) },
        (finished) => {
          if (finished) runOnJS(onFinish)();
        },
      );
    }, 2500);
    return () => clearTimeout(exitTimer);
  }, [exit, isReadyToExit, onFinish, reducedMotion]);

  const screenStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(exit.value, [0, 1], [0, -height]) }],
  }));
  const progressStyle = useAnimatedStyle(() => ({
    width: interpolate(progress.value, [0, 1], [0, width - 80]),
  }));
  const markStyle = useAnimatedStyle(() => ({
    opacity: reducedMotion ? 1 : progress.value,
    transform: [
      {
        translateY: reducedMotion
          ? 0
          : interpolate(progress.value, [0, 1], [20, 0]),
      },
      {
        scale: reducedMotion
          ? 1
          : interpolate(progress.value, [0, 1], [0.9, 1]),
      },
    ],
  }));

  if (Platform.OS === "web") return null;

  return (
    <Animated.View
      accessibilityLabel="Memuat Rusuh Tiket"
      accessibilityRole="progressbar"
      style={[styleForNativeLaunchSplashAnimatedView1(), screenStyle]}
      testID="native-launch-splash"
    >
      <View style={[componentStyles.elementPosition0, pointerEventsNone]} />
      <View style={[componentStyles.elementPosition1, pointerEventsNone]} />
      <View style={[componentStyles.elementPosition2, pointerEventsNone]} />
      <View style={[componentStyles.elementPosition3, pointerEventsNone]} />
      <NativeStatusBarBackdrop />
      <Text style={componentStyles.elementPosition4}>.0</Text>
      <Text
        accessibilityLabel={`Versi aplikasi ${buildLabel}`}
        style={[componentStyles.buildLabel, { top: insets.top + 14 }]}
        testID="native-launch-build-label"
      >
        {buildLabel}
      </Text>

      <View style={componentStyles.elementAlignItems5}>
        <Animated.View
          style={[styleForNativeLaunchSplashAnimatedView2(), markStyle]}
        >
          <BrandSymbol size={88} />
        </Animated.View>
        <View style={componentStyles.elementFlexDirection7}>
          <View style={componentStyles.elementFlexDirection8}>
            {FIRST_WORD_LETTERS.map(({ id, letter, index }) => (
              <SplashLetter
                key={id}
                letter={letter}
                index={index}
                reducedMotion={Boolean(reducedMotion)}
              />
            ))}
          </View>
          <View style={componentStyles.elementFlexDirection9}>
            {SECOND_WORD_LETTERS.map(({ id, letter, index }) => (
              <SplashLetter
                key={id}
                letter={letter}
                index={index}
                reducedMotion={Boolean(reducedMotion)}
              />
            ))}
          </View>
        </View>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.75}
          numberOfLines={1}
          style={componentStyles.elementColor10}
        >
          Pesan tiket tanpa ribet
        </Text>
      </View>

      <View style={componentStyles.elementPosition11}>
        <View style={componentStyles.elementWidth12}>
          <Animated.View
            style={[styleForNativeLaunchSplashAnimatedView3(), progressStyle]}
          />
        </View>
        <Text style={componentStyles.elementColor13}>{statusText}</Text>
      </View>
    </Animated.View>
  );
}
