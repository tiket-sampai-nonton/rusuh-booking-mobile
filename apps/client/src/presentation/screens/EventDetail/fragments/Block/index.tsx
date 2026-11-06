/**
 *  Brutalist Mono Section Block
 *
 * MATCHES: `.oil-ui/v2/02-event-detail.html` .section
 *
 * Features:
 * - Uppercase title with 2px bottom border
 * - Scroll-triggered reveal animation (opacity + translateY)
 * - No rounded corners (Brutalist)
 */
import { useEffect, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";
import { useResponsive } from "@presentation/hooks/useResponsive";

import type { BlockProps } from "../../interface";
import { designDetailStyles as styles } from "../../style";
import { nativeDriverSupported } from "@presentation/utils/style";
import { styleForBlockAnimatedView0 } from "./style";

export function Block({ label, heading, children }: BlockProps) {
  const { isMobileWeb } = useResponsive();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(30)).current;
  const [isVisible, setIsVisible] = useState(false);

  // Trigger animation when block becomes visible
  useEffect(() => {
    if (isVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: nativeDriverSupported(),
        }),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: nativeDriverSupported(),
        }),
      ]).start();
    }
  }, [isVisible, fadeAnim, translateAnim]);

  // Simple visibility detection (always visible for now)
  // In production, use IntersectionObserver on web or onLayout checks
  useEffect(() => {
    // Trigger animation after a short delay based on position
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View
      style={[
        styles.section,
        isMobileWeb && styles.mobileWebSection,
        styleForBlockAnimatedView0(fadeAnim, translateAnim),
      ]}
    >
      {/* Section Title (label as title for ) */}
      <Text
        style={[
          styles.sectionTitle,
          isMobileWeb && styles.mobileWebSectionTitle,
        ]}
        accessibilityRole="header"
      >
        {label}
      </Text>

      {/* Content */}
      <View>{children}</View>
    </Animated.View>
  );
}
