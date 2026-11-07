import { Pressable, Text, View } from "react-native";

import { pillGroupStyles, pillOptionStyle, pillTextStyle } from "./style";

interface PillOption {
  readonly v: string;
  readonly l: string;
}

interface PillGroupProps {
  readonly label: string;
  readonly options: readonly PillOption[];
  readonly value: string;
  readonly onPick: (value: string) => void;
  readonly testPrefix: string;
}

export function PillGroup({
  label,
  options,
  value,
  onPick,
  testPrefix,
}: PillGroupProps) {
  return (
    <View style={pillGroupStyles.group}>
      <Text
        className="mb-2 text-xs font-semibold text-muted-foreground"
        style={pillGroupStyles.label}
      >
        {label}
      </Text>
      <View style={pillGroupStyles.choices}>
        {options.map((option) => {
          const selected = option.v === value;
          return (
            <Pressable
              key={option.v}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              accessibilityLabel={`${label}: ${option.l}`}
              onPress={() => onPick(option.v)}
              testID={`${testPrefix}-${option.v}`}
              style={[pillGroupStyles.option, pillOptionStyle(selected)]}
            >
              <Text
                style={[pillGroupStyles.optionText, pillTextStyle(selected)]}
              >
                {option.l}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
