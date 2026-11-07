import type { ReactElement } from "react";
import { Pressable, Text } from "react-native";

import { loginStyles } from "../style";

interface GhostButtonProps {
  readonly label: string;
  readonly onPress: () => void;
  readonly testID?: string;
}

export function GhostButton({
  label,
  onPress,
  testID,
}: GhostButtonProps): ReactElement {
  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityState={{ disabled: false }}
      onPress={onPress}
      style={loginStyles.ghost}
    >
      <Text style={loginStyles.ghostText}>{label}</Text>
    </Pressable>
  );
}
