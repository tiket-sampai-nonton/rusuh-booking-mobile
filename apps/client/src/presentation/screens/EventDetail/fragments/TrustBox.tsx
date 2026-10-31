/** Prototype `.trust` — dashed box of three verification lines. */
import { Text, View } from "react-native";

import { detailStyles } from "../style";

const LINES = [
  "Tiket resmi & terverifikasi",
  "Antrean adil (FCFS)",
  "E-ticket langsung ke gate",
] as const;

export function TrustBox() {
  return (
    <View style={detailStyles.trustBox}>
      {LINES.map((t) => (
        <View key={t} style={detailStyles.trustRow}>
          <View style={detailStyles.trustCheckCircle}>
            <Text style={detailStyles.trustCheck}>✓</Text>
          </View>
          <Text style={detailStyles.trustText} className="text-white/60">{t}</Text>
        </View>
      ))}
    </View>
  );
}
