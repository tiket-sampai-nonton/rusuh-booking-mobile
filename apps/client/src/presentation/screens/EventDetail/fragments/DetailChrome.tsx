/** Shared detail chrome: dark aura background + sticky mini-nav + steps row. */
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import { BrandMark } from "@presentation/components/BrandMark";

import { detailStyles } from "../style";

/** Dark root with the prototype's ember aura glow behind the content. */
export function DetailBackground({
  children,
  testID,
}: {
  readonly children: ReactNode;
  readonly testID?: string;
}) {
  return (
    <View style={detailStyles.root} testID={testID}>
      <View style={detailStyles.aura} pointerEvents="none" />
      {children}
    </View>
  );
}

/** Sticky mini-nav: brand mark + "← Beranda" back link. */
export function MiniNav({ onBack }: { readonly onBack: () => void }) {
  return (
    <View style={detailStyles.miniNav}>
      <BrandMark color="#fff" />
      <Pressable accessibilityRole="button" accessibilityLabel="Kembali ke beranda" onPress={onBack}>
        <Text style={detailStyles.navBack} className="font-semibold text-white/60">
          ← Beranda
        </Text>
      </Pressable>
    </View>
  );
}

const STEPS = ["0 Detail", "1 Antre", "2 Pilih", "3 Bayar"] as const;

/** Funnel progress — Detail is the active (first) step. */
export function Steps() {
  return (
    <View style={detailStyles.stepsRow}>
      {STEPS.map((s, i) => (
        <Text
          key={s}
          style={detailStyles.step}
          className={i === 0 ? "font-semibold uppercase text-brand-ember" : "uppercase text-white/40"}
        >
          {s}
        </Text>
      ))}
    </View>
  );
}
