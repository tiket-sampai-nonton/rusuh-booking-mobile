/** Two stacked actions (requeue primary + home ghost) — prototype expired.html. */
import { Pressable, Text, View } from "react-native";

import type { ExpiredActionsProps } from "../interface";
import { expiredStyles } from "../style";

export function ExpiredActions({ cta, onRequeue, onHome }: ExpiredActionsProps) {
  return (
    <View className="mt-6 w-full max-w-[400px] gap-2.5">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={cta}
        onPress={onRequeue}
        testID="expired-requeue"
        className="flex-row items-center justify-center gap-3 rounded-pill bg-white py-4"
      >
        <Text className="text-md font-bold text-ink">{cta}</Text>
        <View style={expiredStyles.ctaPin} className="items-center justify-center">
          <Text style={expiredStyles.ctaPinText} accessibilityElementsHidden>↗</Text>
        </View>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Kembali ke Beranda"
        onPress={onHome}
        testID="expired-home"
        className="items-center rounded-pill border border-white/[0.15] bg-white/[0.07] py-4"
      >
        <Text className="text-md font-bold text-white">Kembali ke Beranda</Text>
      </Pressable>
    </View>
  );
}
