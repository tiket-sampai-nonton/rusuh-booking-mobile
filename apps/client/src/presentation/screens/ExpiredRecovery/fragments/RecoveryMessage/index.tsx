import { Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import type { ExpiryReason } from "@domain/rules/payment-recovery";
import { designColors } from "@presentation/theme";
import { styles } from "./style";


const REASON_ICON_PATH: Readonly<Record<ExpiryReason, string>> = {
  payment: "M3 7h18v12H3z M3 11h18 M7 15h4",
  hold: "M12 7v5l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  queue: "M8 7h13M8 12h13M8 17h13M3 7h.01M3 12h.01M3 17h.01",
  turn: "M12 3v18M3 12h18M7 7l10 10M17 7 7 17",
};

export interface RecoveryMessageProps {
  readonly reason: ExpiryReason;
  readonly title: string;
  readonly body: string;
}

export function RecoveryMessage({ reason, title, body }: RecoveryMessageProps) {
  return (
    <View className="w-full max-w-sm items-center gap-4">
      <View className="h-[100px] w-[100px] items-center justify-center rounded-full" style={styles.icon}>
        <Svg width={42} height={42} viewBox="0 0 24 24" fill="none" stroke={designColors.danger} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <Path d={REASON_ICON_PATH[reason]} />
          {reason === "hold" ? <Circle cx={12} cy={12} r={9} /> : null}
        </Svg>
      </View>
      <Text
        className="text-center text-2xl font-extrabold uppercase"
        style={styles.title}
        accessibilityRole="header"
        testID="expired-title"
      >
        {title}
      </Text>
      <Text className="text-center text-sm leading-6" style={styles.body}>
        {body}
      </Text>
    </View>
  );
}
