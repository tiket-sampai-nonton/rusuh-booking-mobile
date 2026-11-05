import { Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { designColors } from "@presentation/theme";
import { styles } from "./style";


export interface RecoveryInfoProps {
  readonly text: string;
  readonly items: readonly string[];
}

export function RecoveryInfo({ text, items }: RecoveryInfoProps) {
  return (
    <View className="w-full p-4" style={styles.container}>
      <Text className="text-xs font-extrabold uppercase" style={styles.heading}>
        Apa yang terjadi?
      </Text>
      <Text className="text-xs leading-5" style={styles.body}>
        {text}
      </Text>
      <View className="mt-2 gap-1">
        {items.map((item) => (
          <View key={item} className="flex-row gap-2">
            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke={designColors.ink} strokeWidth={2} style={styles.listIcon}>
              <Path d="M4 12h15m-6-6 6 6-6 6" />
            </Svg>
            <Text className="flex-1 text-xs" style={styles.item}>
              {item}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
