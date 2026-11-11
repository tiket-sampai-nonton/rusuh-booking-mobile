import { Platform, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** White backing for iOS's transparent status-bar region. */
export function NativeStatusBarBackdrop() {
  const insets = useSafeAreaInsets();
  if (Platform.OS !== "ios" || insets.top <= 0) return null;

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        zIndex: 9999,
        top: 0,
        left: 0,
        right: 0,
        height: insets.top,
        backgroundColor: "#FFFFFF",
      }}
      accessibilityElementsHidden
    />
  );
}
