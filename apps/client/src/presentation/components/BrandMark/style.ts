
import { StyleSheet } from "react-native";

import type { DynamicStyle } from "@presentation/utils/style";

export const componentStyles = StyleSheet.create({
  elementWidth0: { width: 24, height: 24, borderRadius: 7, alignItems: "center", justifyContent: "center" },
});

export function styleForBrandMarkText0(arg0: string): DynamicStyle {
  return { color: arg0 } as DynamicStyle;
}
