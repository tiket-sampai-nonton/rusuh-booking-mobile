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
    // Keep the native artwork visible behind the title. The lower-opacity white
    // ramp preserves text contrast without washing out the hero image.
    return (
      <LinearGradient
        // Gradient from top to bottom (CSS "to top" reversed for RN)
        colors={[
          withAlpha(designColors.ground, 0.04),
          withAlpha(designColors.ground, 0.12),
          withAlpha(designColors.ground, 0.24),
          withAlpha(designColors.ground, 0.42),
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
