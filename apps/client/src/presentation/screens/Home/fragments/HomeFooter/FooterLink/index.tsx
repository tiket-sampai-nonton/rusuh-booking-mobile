import { useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { useToast } from "@presentation/components";
import { designDuration, designEasing } from "@presentation/theme";
import { followLink } from "@presentation/utils/follow-link";

import { footerLinkStyles, footerUnderlineStyle } from "./style";

const EASE = Easing.bezier(...designEasing.primary);

interface FooterLinkProps {
  readonly label: string;
  readonly href: string;
  readonly onNavigate: (href: string) => void;
}

export function FooterLink({ label, href, onNavigate }: FooterLinkProps) {
  const reducedMotion = useReducedMotion();
  const hovered = useSharedValue(0);
  const toast = useToast();

  const setHovered = useCallback(
    (isHovered: boolean) => {
      if (reducedMotion) {
        hovered.value = isHovered ? 1 : 0;
        return;
      }
      hovered.value = withTiming(isHovered ? 1 : 0, {
        duration: designDuration.fast,
        easing: EASE,
      });
    },
    [reducedMotion, hovered],
  );
  const underlineStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: interpolate(hovered.value, [0, 1], [0, 1]) }],
  }));
  const handlePress = useCallback(() => {
    void followLink(href, onNavigate, () =>
      toast.show("Tautan tidak dapat dibuka", "error"),
    );
  }, [href, onNavigate, toast]);

  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={label}
      onPress={handlePress}
      onHoverIn={() => setHovered(true)}
      onHoverOut={() => setHovered(false)}
      style={footerLinkStyles.container}
    >
      <View style={footerLinkStyles.content}>
        <Text style={footerLinkStyles.label}>{label}</Text>
        <Animated.View style={[footerUnderlineStyle(), underlineStyle]} />
      </View>
    </Pressable>
  );
}
