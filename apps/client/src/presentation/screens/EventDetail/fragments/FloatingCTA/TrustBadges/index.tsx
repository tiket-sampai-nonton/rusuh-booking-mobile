import { Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { designColors } from "@presentation/theme/event-design-tokens";

import { designDetailStyles as styles } from "../../../style";

const TRUST_BADGES = [
  "Tiket resmi",
  "Antrean adil",
  "Tiket elektronik instan",
] as const;

export function TrustBadges() {
  return (
    <View style={styles.trustBadges}>
      {TRUST_BADGES.map((label) => (
        <View key={label} style={styles.trustBadge}>
          <Svg
            width={14}
            height={14}
            viewBox="0 0 24 24"
            fill="none"
            stroke={designColors.ink}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <Path d="m5 12 4 4L19 6" />
          </Svg>
          <Text style={styles.trustBadgeText}>{label}</Text>
        </View>
      ))}
    </View>
  );
}
