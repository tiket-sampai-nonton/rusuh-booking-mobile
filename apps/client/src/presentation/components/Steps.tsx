/**
 * Steps — 1:1 of the prototype `.steps` funnel breadcrumb:
 * `0 Detail · 1 Antre · 2 Pilih · 3 Bayar`. The active step is ember; others
 * are white/40. Each step is a numbered ring + label; a thin connector sits
 * between steps. Horizontally scrollable on narrow screens (prototype
 * `overflow:auto`).
 */
import { ScrollView, Text, View } from "react-native";

import { brand } from "@presentation/theme";

export const FUNNEL_STEPS = ["Detail", "Antre", "Pilih", "Bayar"] as const;

export interface StepsProps {
  /** Index of the active step (0=Detail … 3=Bayar). */
  readonly active: number;
  readonly testID?: string;
}

export function Steps({ active, testID }: StepsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ flexDirection: "row", alignItems: "center", gap: 8 }}
      style={{ marginBottom: 22 }}
      testID={testID ?? "funnel-steps"}
    >
      {FUNNEL_STEPS.map((label, i) => {
        const on = i === active;
        const color = on ? brand.ember : "rgba(255,255,255,0.4)";
        return (
          <View key={label} style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 999,
                  borderWidth: 1,
                  borderColor: color,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 9, color }}>{i}</Text>
              </View>
              <Text
                style={{ fontSize: 10, letterSpacing: 1.4, color }}
                className="font-semibold uppercase"
              >
                {label}
              </Text>
            </View>
            {i < FUNNEL_STEPS.length - 1 ? (
              <View style={{ width: 22, height: 1, backgroundColor: color, opacity: 0.4 }} />
            ) : null}
          </View>
        );
      })}
    </ScrollView>
  );
}
