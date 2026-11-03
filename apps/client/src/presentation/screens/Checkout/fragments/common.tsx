/**
 * V2 Brutalist Mono shared checkout atoms (RBT-092): Section heading + Field.
 *
 * Prototype 07 `.form-section` / `.form-input`: uppercase section label with a
 * short hard rule, and hard-bordered square inputs (2px, red focus/invalid).
 * Pure black/white. Same props/testID wiring — restyle only.
 */
import { Text, TextInput, View } from "react-native";

import { v2 } from "@presentation/theme";

import type { FieldProps, SectionProps } from "../interface";

export function Section({ title, children }: SectionProps) {
  return (
    <View style={{ marginTop: 24 }}>
      <Text
        style={{ color: v2.ink, letterSpacing: 1.5 }}
        className="text-2xs font-v2 font-bold uppercase"
        accessibilityRole="header"
      >
        {title}
      </Text>
      <View style={{ width: 28, height: 2, backgroundColor: v2.accent, marginTop: 8 }} />
      <View style={{ marginTop: 10 }}>{children}</View>
    </View>
  );
}

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
  return (
    <View style={{ marginTop: 14 }}>
      <Text style={{ color: v2.ink, marginBottom: 6 }} className="text-xs font-v2 font-bold uppercase">
        {label}
      </Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={v2.gray}
        keyboardType={keyboardType}
        editable={editable}
        testID={testID}
        style={{
          borderWidth: 2,
          borderColor: invalid ? v2.accent : v2.ink,
          backgroundColor: editable ? v2.ground : v2.field,
          color: v2.ink,
          paddingHorizontal: 14,
          paddingVertical: 12,
          fontFamily: "Inter",
          fontSize: 15,
        }}
      />
      {invalid ? (
        <Text style={{ color: v2.accent, marginTop: 4 }} className="text-2xs font-v2 font-bold">
          NIK harus 16 digit.
        </Text>
      ) : null}
    </View>
  );
}
