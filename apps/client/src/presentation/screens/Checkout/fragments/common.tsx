/**
 * V2 Brutalist Mono shared checkout atoms (RBT-092): Section heading + Field.
 *
 * PROTOTYPE 03-checkout.html .checkout-section / .form-group EXACT COPY:
 * - Section: numbered black box + uppercase title + bottom border
 * - Field: 2px border, focus shadow effect (4px 4px 0), uppercase label
 * - Input shake animation on error
 * Same props/testID wiring — restyle only.
 */
import { useRef, useState } from "react";
import { Platform, Text, TextInput, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { v2, interFonts } from "@presentation/theme";

import type { FieldProps, SectionProps } from "../interface";

/**
 * Checkout section with numbered black box (prototype .section-header).
 * If `number` is provided, shows the black numbered badge.
 */
export function Section({ title, number, children }: SectionProps) {
  return (
    <View style={{ marginTop: 32 }}>
      {/* Section header: numbered box + title + bottom border */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
          marginBottom: 24,
          paddingBottom: 16,
          borderBottomWidth: 2,
          borderBottomColor: v2.ink,
        }}
      >
        {number !== undefined ? (
          <View
            style={{
              width: 32,
              height: 32,
              backgroundColor: v2.ink,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                color: v2.ground,
                fontSize: 14,
                fontFamily: interFonts.bold,
              }}
            >
              {number}
            </Text>
          </View>
        ) : null}
        <Text
          style={{
            color: v2.ink,
            fontSize: 20,
            fontFamily: interFonts.black,
            textTransform: "uppercase",
            letterSpacing: -0.4,
          }}
          accessibilityRole="header"
        >
          {title}
        </Text>
      </View>
      {/* Section content */}
      <View>{children}</View>
    </View>
  );
}

/**
 * Form field with 2px border, focus shadow, and shake animation on error
 * (prototype .form-group + input:focus + @keyframes shake).
 */
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

  // Trigger shake animation when invalid transitions from false to true
  if (invalid && !prevInvalid.current) {
    shakeX.value = withSequence(
      withTiming(-5, { duration: 100 }),
      withTiming(5, { duration: 100 }),
      withTiming(-5, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );
  }
  prevInvalid.current = invalid;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  // Focus shadow effect (prototype: box-shadow: 4px 4px 0 var(--black); transform: translate(-2px, -2px))
  const focusStyle = isFocused
    ? Platform.select({
        web: {
          boxShadow: "4px 4px 0 #000",
          transform: [{ translateX: -2 }, { translateY: -2 }],
        } as object,
        default: {
          // Native: simulate with border/margin shift
          marginLeft: -2,
          marginTop: -2,
          borderWidth: 3,
        },
      })
    : {};

  return (
    <View style={{ marginTop: 16 }}>
      <Text
        style={{
          color: v2.ink,
          fontSize: 12,
          fontFamily: interFonts.bold,
          textTransform: "uppercase",
          letterSpacing: 0.6,
          marginBottom: 8,
        }}
      >
        {label}
      </Text>
      <Animated.View style={animatedStyle}>
        <TextInput
          accessibilityLabel={label}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={v2.gray}
          keyboardType={keyboardType}
          editable={editable}
          testID={testID}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            {
              borderWidth: 2,
              borderColor: invalid ? "#ff0000" : v2.ink,
              backgroundColor: editable ? v2.ground : v2.field,
              color: v2.ink,
              paddingHorizontal: 16,
              paddingVertical: 16,
              fontFamily: interFonts.regular,
              fontSize: 16,
            },
            focusStyle,
          ]}
        />
      </Animated.View>
      {invalid ? (
        <Text
          style={{
            color: "#ff0000",
            fontSize: 12,
            fontFamily: interFonts.medium,
            marginTop: 4,
          }}
        >
          NIK harus 16 digit.
        </Text>
      ) : null}
    </View>
  );
}
