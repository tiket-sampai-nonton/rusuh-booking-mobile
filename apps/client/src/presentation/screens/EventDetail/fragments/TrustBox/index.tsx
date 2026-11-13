/**
 *  Brutalist Mono Trust Box
 *
 * MATCHES: `.oil-ui/v2/02-event-detail.html` (trust content moved to FloatingCTA)
 *
 * This is now a standalone trust section that can be placed in the content area
 * if needed. The inline trust badges are in FloatingCTA.
 *
 * Features:
 * - Simple bordered box with check marks
 * -  styling (no rounded corners)
 */
import { Text, View } from "react-native";

import { CheckIcon } from "@presentation/components/Icon";
import { designColors } from "@presentation/theme/event-design-tokens";
import { trustStyles } from "./style";

const TRUST_LINES = [
  "Tiket resmi & terverifikasi",
  "Antrean mengikuti urutan bergabung",
  "Tiket elektronik langsung ke pintu masuk",
] as const;

export function TrustBox() {
  return (
    <View style={trustStyles.container}>
      {TRUST_LINES.map((text) => (
        <View key={text} style={trustStyles.row}>
          <CheckIcon color={designColors.success} size={16} />
          <Text style={trustStyles.text}>{text}</Text>
        </View>
      ))}
    </View>
  );
}
