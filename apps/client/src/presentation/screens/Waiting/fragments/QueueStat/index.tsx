import { Text, View } from "react-native";

import { styles } from "../../style";

interface QueueStatProps {
  readonly label: string;
  readonly value: string;
  readonly testID: string;
  readonly isDesktop: boolean;
  readonly isSecond?: boolean;
}

export function QueueStat({
  label,
  value,
  testID,
  isDesktop,
  isSecond = false,
}: QueueStatProps) {
  return (
    <View
      style={[
        styles.ledgerStat,
        isDesktop && styles.ledgerStatDesktop,
        isSecond && styles.ledgerStatSecond,
        isDesktop && isSecond && styles.ledgerStatSecondDesktop,
      ]}
      testID={testID}
      accessibilityLiveRegion="polite"
    >
      <Text
        style={[
          styles.ledgerStatLabel,
          isDesktop && styles.ledgerStatLabelDesktop,
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.ledgerStatValue,
          isDesktop && styles.ledgerStatValueDesktop,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}
