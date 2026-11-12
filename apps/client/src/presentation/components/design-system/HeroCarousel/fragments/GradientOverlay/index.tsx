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
    // Keep the upper 55% of the artwork clear, then fade gradually to the
    // white copy area near the bottom of the banner.
    return (
      <LinearGradient
        // The artwork stays clear through 55%, then fades to white.
        colors={[
          withAlpha(designColors.ground, 0),
          withAlpha(designColors.ground, 0),
          withAlpha(designColors.ground, 0.96),
        ]}
        locations={[0, 0.55, 1]}
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
