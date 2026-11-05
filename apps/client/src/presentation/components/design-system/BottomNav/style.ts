import type { ViewStyle } from "react-native";
import { designLayout, designColors, designBorders } from "@presentation/theme";

export function bottomNavBarStyle(bottomInset: number): ViewStyle {
  return {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: designLayout.bottomBarHeight + bottomInset,
    paddingBottom: bottomInset,
    backgroundColor: designColors.ground,
    borderTopWidth: designBorders.standard,
    borderTopColor: designColors.ink,
    flexDirection: 'row',
    zIndex: 100,
  };
}
