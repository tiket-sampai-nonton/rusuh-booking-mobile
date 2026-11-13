import { useState } from "react";
import { Animated, Pressable, Text } from "react-native";

import { Icon } from "@presentation/components/Icon";
import { designColors } from "@presentation/theme/event-design-tokens";

import { designDetailStyles as styles } from "../../../style";
import type { CTAButtonProps } from "../types";
import { nativeCtaButtonStyles, nativeCtaPulseStyle } from "./style";

export function NativeCTAButton({
  label,
  disabled,
  canJoin,
  onJoin,
  pulseAnim,
}: CTAButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const scale = canJoin
    ? pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.02] })
    : 1;

  return (
    <Animated.View
      style={[styles.floatingCtaBtnContainer, nativeCtaPulseStyle(scale)]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onJoin}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        testID="join-cta"
        style={[
          styles.floatingCtaBtn,
          disabled && styles.floatingCtaBtnDisabled,
          isPressed && !disabled && nativeCtaButtonStyles.pressedButton,
        ]}
      >
        <Text
          style={[
            styles.floatingCtaBtnText,
            isPressed && !disabled && nativeCtaButtonStyles.pressedLabel,
          ]}
        >
          {label}
        </Text>
        {canJoin && <Icon color={designColors.ground} />}
      </Pressable>
    </Animated.View>
  );
}
