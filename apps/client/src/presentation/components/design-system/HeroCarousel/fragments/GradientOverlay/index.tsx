import { Platform, View, type ViewStyle } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { designColors, withAlpha } from "@presentation/theme";
import { pointerEventsNone } from "@presentation/utils/style";

import { componentStyles, styleForGradientOverlayView3 } from "../../style";

export function GradientOverlay({
  isMobile = false,
  isMobileWeb = false,
}: {
  readonly isMobile?: boolean;
  readonly isMobileWeb?: boolean;
}) {
  const isWeb = Platform.OS === "web";
  // Web: use real CSS linear-gradient (exact match to prototype)
  let webGradientStyle: ViewStyle | null = null;
  if (isWeb) {
    let background = `linear-gradient(to top, ${designColors.ground} 0%, ${withAlpha(designColors.ground, 0.7)} 30%, ${withAlpha(designColors.ground, 0.3)} 100%)`;
    if (isMobile) {
      background = `linear-gradient(to top, ${designColors.ground} 0%, ${withAlpha(designColors.ground, 0.95)} 30%, ${withAlpha(designColors.ground, 0.7)} 60%, ${withAlpha(designColors.ground, 0.3)} 100%)`;
    }
    if (isMobileWeb) {
      background = `linear-gradient(to top, ${withAlpha(designColors.overlay, 0.86)} 0%, ${withAlpha(designColors.overlay, 0.58)} 54%, ${withAlpha(designColors.overlay, 0.18)} 100%)`;
    }
    webGradientStyle = { background } as unknown as ViewStyle;
  }

  // Native: use expo-linear-gradient for smooth gradient (no more banding)
  if (!isWeb) {
    // Mobile prototype: var(--ground) 0% → 0.95 30% → 0.7 60% → 0.3 100%
    // "to top" in CSS = start from bottom, so we reverse the colors array (top → bottom)
    // and use locations from top (0) to bottom (1)
    return (
      <LinearGradient
        // Gradient from top to bottom (CSS "to top" reversed for RN)
        colors={[
          withAlpha(designColors.ground, 0.3), // top (100% in CSS)
          withAlpha(designColors.ground, 0.7), // 60% point in CSS → 0.4 from top
          withAlpha(designColors.ground, 0.95), // 30% point in CSS → 0.7 from top
          designColors.ground, // bottom (0% in CSS)
        ]}
        locations={[0, 0.4, 0.7, 1]}
        style={[componentStyles.elementPosition2, pointerEventsNone]}
      />
    );
  }

  // Web: single div with CSS gradient
  return (
    <View
      style={[
        styleForGradientOverlayView3(),
        webGradientStyle,
        pointerEventsNone,
      ]}
    />
  );
}
