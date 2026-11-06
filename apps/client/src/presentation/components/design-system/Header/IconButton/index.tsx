import { Platform, Pressable } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { LoginIcon } from "@presentation/components/ArrowIcon";
import { designColors, designEasing } from "@presentation/theme";

import {
  headerIconButtonStyles,
  iconButtonBackgroundColor,
  iconButtonForegroundColor,
  iconButtonShadowStyle,
} from "./style";
import type { HeaderAction } from "../types";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const EASE = Easing.bezier(...designEasing.primary);

type IconButtonProps = HeaderAction;

export function IconButton({ icon, label, onPress, testID }: IconButtonProps) {
  const reducedMotion = useReducedMotion();
  const pressed = useSharedValue(0);
  const platform = Platform.OS;
  const shadowColor = designColors.ink;
  const inkColor = designColors.ink;
  const groundColor = designColors.ground;

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: pressed.value * 2 },
      { translateY: pressed.value * 2 },
    ],
  }));
  const shadowStyle = useAnimatedStyle(() =>
    iconButtonShadowStyle(pressed.value, platform, shadowColor),
  );
  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: iconButtonBackgroundColor(
      pressed.value,
      inkColor,
      groundColor,
    ),
  }));

  const setPressed = (isPressed: boolean) => {
    if (reducedMotion) {
      pressed.value = isPressed ? 1 : 0;
      return;
    }
    pressed.value = withTiming(isPressed ? 1 : 0, {
      duration: 150,
      easing: EASE,
    });
  };

  const iconColor = iconButtonForegroundColor(pressed.value);

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      onPress={onPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
      style={[
        headerIconButtonStyles.button,
        buttonStyle,
        shadowStyle,
        backgroundStyle,
      ]}
    >
      <LoginIcon color={iconColor} />
    </AnimatedPressable>
  );
}
