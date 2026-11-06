import { Animated, Pressable, Text, type ViewStyle } from "react-native";

import { ArrowIcon } from "@presentation/components/ArrowIcon";

import { designDetailStyles as styles } from "../../../style";
import type { CTAButtonProps } from "../types";
import { webCtaPulseStyle } from "./style";

export function WebCTAButton({
  label,
  disabled,
  canJoin,
  onJoin,
  pulseAnim,
}: CTAButtonProps) {
  return (
    <Animated.View
      style={
        canJoin
          ? (webCtaPulseStyle(pulseAnim) as unknown as ViewStyle)
          : undefined
      }
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
        disabled={disabled}
        onPress={onJoin}
        testID="join-cta"
        style={[
          styles.floatingCtaBtn,
          disabled && styles.floatingCtaBtnDisabled,
        ]}
      >
        <Text style={styles.floatingCtaBtnText}>{label}</Text>
        {canJoin && (
          <ArrowIcon color={styles.floatingCtaArrow.color as string} />
        )}
      </Pressable>
    </Animated.View>
  );
}
