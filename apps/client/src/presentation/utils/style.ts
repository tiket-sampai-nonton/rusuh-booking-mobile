import {
  Platform,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from "react-native";

/** Style object accepted by React Native text, view, and image surfaces. */
export type DynamicStyle = ViewStyle & TextStyle & ImageStyle;

/** Cross-platform hard shadow: CSS on web, native shadow props on iOS/Android. */
export function hardShadowStyle(
  offsetX: number,
  offsetY: number,
  color: string,
  elevation = Math.max(offsetX, offsetY),
  platform: typeof Platform.OS = Platform.OS,
): ViewStyle {
  if (platform === "web") {
    return {
      boxShadow: `${offsetX}px ${offsetY}px 0 ${color}`,
    } as unknown as ViewStyle;
  }

  return {
    shadowColor: color,
    shadowOffset: { width: offsetX, height: offsetY },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation,
  };
}

/** Native Animated does not support useNativeDriver on the web platform. */
export function nativeDriverSupported(
  platform: typeof Platform.OS = Platform.OS,
): boolean {
  return platform !== "web";
}

export const pointerEventsNone: ViewStyle = { pointerEvents: "none" };
export const pointerEventsBoxNone: ViewStyle = { pointerEvents: "box-none" };
