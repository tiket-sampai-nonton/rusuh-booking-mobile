import { useCallback } from "react";
import { Pressable } from "react-native";
import Animated, { Easing, interpolate, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from "react-native-reanimated";

import { useToast } from "@presentation/components/design-system";
import { designColors, designDuration, designEasing } from "@presentation/theme";

import {
  socialLinkBorderStyle,
  socialLinkContainerColor,
  socialLinkStyles,
  socialLinkTextColor,
} from "./style";

const EASE = Easing.bezier(...designEasing.primary);

interface SocialLinkProps {
  readonly label: string;
  readonly name: string;
  readonly handle: string;
}

export function SocialLink({ label, name, handle }: SocialLinkProps) {
  const toast = useToast();
  const reducedMotion = useReducedMotion();
  const hovered = useSharedValue(0);
  const groundColor = designColors.ground;
  const inkColor = designColors.ink;

  const setHovered = useCallback(
    (isHovered: boolean) => {
      if (reducedMotion) {
        hovered.value = isHovered ? 1 : 0;
        return;
      }
      hovered.value = withTiming(isHovered ? 1 : 0, { duration: designDuration.normal, easing: EASE });
    },
    [reducedMotion, hovered],
  );
  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(hovered.value, [0, 1], [0, 1.5]) }],
    borderRadius: interpolate(hovered.value, [0, 1], [20, 0]),
  }));
  const containerStyle = useAnimatedStyle(() => ({
    borderColor: socialLinkContainerColor(hovered.value, groundColor),
  }));
  const textStyle = useAnimatedStyle(() => ({
    color: socialLinkTextColor(hovered.value, inkColor, groundColor),
  }));
  const handlePress = useCallback(() => {
    toast.show(`${name}: ${handle}`, "default");
  }, [toast, name, handle]);

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${name}: ${handle}`}
      onPress={handlePress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
    >
      <Animated.View style={[socialLinkStyles.container, socialLinkBorderStyle(), containerStyle]}>
        <Animated.View style={[socialLinkStyles.fill, fillStyle]} />
        <Animated.Text style={[socialLinkStyles.label, textStyle]}>{label}</Animated.Text>
      </Animated.View>
    </Pressable>
  );
}
