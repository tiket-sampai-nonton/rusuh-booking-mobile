import type { ReactElement } from "react";
import { Pressable, Text } from "react-native";

import { ArrowIcon } from "@presentation/components/ArrowIcon";
import { designColors } from "@presentation/theme";

import { loginStyles } from "../style";
import type { PrimaryButtonProps } from "./types";

export function PrimaryButton({
  label,
  onPress,
  disabled,
  testID,
  variant = "default",
}: PrimaryButtonProps): ReactElement {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        loginStyles.go,
        variant === "danger" && loginStyles.dangerButton,
        disabled && loginStyles.goDisabled,
      ]}
    >
      <Text style={loginStyles.goText}>{label}</Text>
      {variant !== "danger" && <ArrowIcon color={designColors.ground} />}
    </Pressable>
  );
}
