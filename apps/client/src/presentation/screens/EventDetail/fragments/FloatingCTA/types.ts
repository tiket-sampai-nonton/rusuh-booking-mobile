import type { Animated } from "react-native";

export interface CTAButtonProps {
  readonly label: string;
  readonly disabled: boolean;
  readonly canJoin: boolean;
  readonly onJoin: () => void;
  readonly pulseAnim: Animated.Value;
  readonly isMobileWeb?: boolean;
}
