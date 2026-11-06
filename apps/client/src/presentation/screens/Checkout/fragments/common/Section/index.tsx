import { Text, View } from "react-native";
import { useResponsive } from "@presentation/hooks/useResponsive";

import type { SectionProps } from "../../../interface";

import { checkoutSectionStyles as styles, compactSectionStyles } from "./style";

export function Section({ title, number, children }: SectionProps) {
  const { isMobileWeb } = useResponsive();
  return (
    <View
      style={[styles.container, isMobileWeb && compactSectionStyles.container]}
    >
      <View style={[styles.header, isMobileWeb && compactSectionStyles.header]}>
        {number !== undefined ? (
          <View
            style={[
              styles.numberBadge,
              isMobileWeb && compactSectionStyles.numberBadge,
            ]}
          >
            <Text style={styles.number}>{number}</Text>
          </View>
        ) : null}
        <Text
          style={[styles.title, isMobileWeb && compactSectionStyles.title]}
          accessibilityRole="header"
        >
          {title}
        </Text>
      </View>
      <View>{children}</View>
    </View>
  );
}
