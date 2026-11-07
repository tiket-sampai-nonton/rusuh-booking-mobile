import { Text, View } from "react-native";

import { etaMinutesSeconds } from "../../display";
import { styles } from "../../style";

export function EstimatedTime({
  position,
  admissionRatePerMin,
}: {
  readonly position: number;
  readonly admissionRatePerMin?: number;
}) {
  const estimate = etaMinutesSeconds(position, admissionRatePerMin);

  if (!estimate) {
    return (
      <View style={styles.estimatedTime} testID="waiting-eta-unavailable">
        <Text style={styles.etaUnavailable}>
          Estimasi waktu tunggu belum tersedia.
        </Text>
      </View>
    );
  }

  const { minutes, seconds } = estimate;

  return (
    <View style={styles.estimatedTime} testID="waiting-eta">
      <View style={styles.timeBlock}>
        <Text style={styles.timeValue}>{String(minutes).padStart(2, "0")}</Text>
        <Text style={styles.timeLabel}>Menit</Text>
      </View>
      <View style={styles.timeBlock}>
        <Text style={styles.timeValue}>{String(seconds).padStart(2, "0")}</Text>
        <Text style={styles.timeLabel}>Detik</Text>
      </View>
    </View>
  );
}
