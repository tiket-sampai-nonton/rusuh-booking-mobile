import { useRef, useState } from "react";
import { Text, TextInput, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from "react-native-reanimated";

import { NIK_LENGTH } from "@domain/auth/nik";
import { designColors } from "@presentation/theme";

import type { FieldProps } from "../../../interface";

import { checkoutFieldStyles, fieldFocusStyle, fieldInputStyle } from "./style";

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  testID,
  invalid = false,
  editable = true,
}: FieldProps) {
  const [isFocused, setIsFocused] = useState(false);
  const shakeX = useSharedValue(0);
  const prevInvalid = useRef(invalid);

  if (invalid && !prevInvalid.current) {
    shakeX.value = withSequence(
      withTiming(-5, { duration: 100 }),
      withTiming(5, { duration: 100 }),
      withTiming(-5, { duration: 100 }),
      withTiming(0, { duration: 100 }),
    );
  }
  prevInvalid.current = invalid;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  return (
    <View style={checkoutFieldStyles.container}>
      <Text style={checkoutFieldStyles.label}>{label}</Text>
      <Animated.View style={animatedStyle}>
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={designColors.gray}
          keyboardType={keyboardType}
          editable={editable}
          testID={testID}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[fieldInputStyle(invalid, editable), fieldFocusStyle(isFocused)]}
        />
      </Animated.View>
      {invalid ? (
        <Text style={checkoutFieldStyles.error}>
          NIK harus {NIK_LENGTH} digit.
        </Text>
      ) : null}
    </View>
  );
}
