import type { ReactNode } from "react";
import { View } from "react-native";

import { designDetailStyles } from "../../../style";

export interface DetailBackgroundProps {
  readonly children: ReactNode;
  readonly testID?: string;
}

export function DetailBackground({ children, testID }: DetailBackgroundProps) {
  return (
    <View style={designDetailStyles.root} testID={testID}>
      {children}
    </View>
  );
}
