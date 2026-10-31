/** Shared checkout atoms: Section heading wrapper + labelled Field input. */
import { Text, TextInput, View } from "react-native";

import type { FieldProps, SectionProps } from "../interface";

export function Section({ title, children }: SectionProps) {
  return (
    <View className="mt-5">
      <Text
        className="text-2xs font-bold uppercase tracking-tag text-muted-foreground"
        accessibilityRole="header"
      >
        {title}
      </Text>
      <View className="mt-2">{children}</View>
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
    <View className="mt-3">
      <Text className="mb-1 text-xs font-bold text-foreground">{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        editable={editable}
        testID={testID}
        className={`rounded-md border px-3.5 py-3 text-md text-foreground ${invalid ? "border-error" : "border-line"}`}
      />
      {invalid ? <Text className="mt-1 text-2xs text-error">NIK harus 16 digit.</Text> : null}
    </View>
  );
}
