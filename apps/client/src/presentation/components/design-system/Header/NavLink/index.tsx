import { Pressable, Text } from "react-native";
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";

import { designDuration, designEasing } from "@presentation/theme";

import { navLinkStyles } from "./style";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const EASE = Easing.bezier(...designEasing.primary);

interface NavLinkProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly testID?: string;
}

export function getUnderlineTransformOrigin(progress: number): "left" | "right" {
  "worklet";
  return progress > 0.5 ? "left" : "right";
}

export function NavLink({ label, onPress, testID }: NavLinkProps) {
  const reducedMotion = useReducedMotion();
  const hovered = useSharedValue(0);

  const underlineStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: hovered.value }],
    transformOrigin: getUnderlineTransformOrigin(hovered.value),
  }));

  const setHovered = (isHovered: boolean) => {
    if (reducedMotion) {
      hovered.value = isHovered ? 1 : 0;
      return;
    }
    hovered.value = withTiming(isHovered ? 1 : 0, { duration: designDuration.slow, easing: EASE });
  };

  return (
    <AnimatedPressable
      accessibilityRole="button"
      accessibilityLabel={`${label} event`}
      testID={testID}
      onPress={onPress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={navLinkStyles.container}
    >
      <Text style={navLinkStyles.label}>{label}</Text>
      <Animated.View style={[navLinkStyles.underline, underlineStyle]} />
    </AnimatedPressable>
  );
}
