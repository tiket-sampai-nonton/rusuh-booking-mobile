import { useEffect, type ComponentType } from "react";
import { Pressable, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";

import { designColors } from "@presentation/theme";

import {
  navItemBackgroundStyle,
  navItemLabelStyle,
  navItemStyles,
} from "./style";
import type { BottomNavIconProps } from "../types";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface NavItemProps {
  readonly label: string;
  readonly Icon: ComponentType<BottomNavIconProps>;
  readonly active: boolean;
  readonly onPress: () => void;
  readonly testID?: string;
}

export function NavItem({
  label,
  Icon,
  active,
  onPress,
  testID,
}: NavItemProps) {
  const reducedMotion = useReducedMotion();
  const pressed = useSharedValue(0);
  const indicatorScale = useSharedValue(active ? 1 : 0);
  const pressedBackgroundColor = designColors.field;

  useEffect(() => {
    if (reducedMotion) {
      indicatorScale.value = active ? 1 : 0;
      return;
    }
    indicatorScale.value = withSpring(active ? 1 : 0, {
      damping: 15,
      stiffness: 200,
    });
  }, [active, reducedMotion, indicatorScale]);

  const iconAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - pressed.value * 0.1 }],
  }));
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: indicatorScale.value }],
  }));
  const backgroundStyle = useAnimatedStyle(() =>
    navItemBackgroundStyle(pressed.value, pressedBackgroundColor),
  );

  return (
    <AnimatedPressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      accessibilityLabel={label}
      testID={testID}
      onPressIn={() => {
        pressed.value = reducedMotion ? 1 : withTiming(1, { duration: 100 });
      }}
      onPressOut={() => {
        pressed.value = reducedMotion ? 0 : withTiming(0, { duration: 150 });
      }}
      onPress={onPress}
      style={[navItemStyles.button, backgroundStyle]}
    >
      <Animated.View style={[navItemStyles.indicator, indicatorStyle]} />
      <Animated.View style={iconAnimStyle}>
        <Icon active={active} />
      </Animated.View>
      <Text style={[navItemStyles.label, navItemLabelStyle(active)]}>
        {label}
      </Text>
    </AnimatedPressable>
  );
}
