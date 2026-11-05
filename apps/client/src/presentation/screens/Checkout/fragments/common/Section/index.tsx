import { Text, View } from "react-native";

import type { SectionProps } from "../../../interface";

import { checkoutSectionStyles as styles } from "./style";

export function Section({ title, number, children }: SectionProps) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {number !== undefined ? (
          <View style={styles.numberBadge}>
            <Text style={styles.number}>{number}</Text>
          </View>
        ) : null}
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
      </View>
      <View>{children}</View>
    </View>
  );
}
