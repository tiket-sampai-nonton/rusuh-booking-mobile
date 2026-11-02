/** Payment method rows (VA/QRIS/GoPay) with radio ring (prototype payment.html). */
import { Pressable, Text, View } from "react-native";

import { methodMeta } from "@domain/rules/payment-method";

import type { PaymentMethodsProps } from "../interface";
import { paymentStyles } from "../style";

export function PaymentMethods({ methods, selected, onSelect }: PaymentMethodsProps) {
  return (
    <View className="rounded-3xl border border-line bg-card p-[7px] shadow-filter">
      <View className="p-4.5">
        <Text className="mb-3.5 text-2xs font-bold uppercase tracking-tag text-muted-foreground">
          Metode Pembayaran
        </Text>
        <View className="gap-2.5">
          {/* Server-driven list (RBT-060 AC2) — only `page.methods`, in order. */}
          {methods.map((code) => {
            const m = methodMeta(code);
            const isSelected = selected === m.code;
            return (
              <Pressable
                key={m.code}
                accessibilityRole="button"
                accessibilityLabel={m.name}
                accessibilityState={{ selected: isSelected }}
                onPress={() => onSelect(m.code)}
                testID={`method-${m.code}`}
                className={`flex-row items-center gap-3 rounded-[15px] border-[1.5px] p-3.5 ${
                  isSelected ? "border-brand bg-brand/[0.04]" : "border-line"
                }`}
              >
                <View style={paymentStyles.methodIcon} className="items-center justify-center bg-ink">
                  <Text className="text-2xs font-extrabold text-white">{m.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-foreground">{m.name}</Text>
                  <Text className="text-2xs text-muted-foreground">{m.sub}</Text>
                </View>
                {/* Radio ring → red inner dot when selected. */}
                <View
                  className={`h-5 w-5 items-center justify-center rounded-full border-2 ${
                    isSelected ? "border-brand" : "border-line"
                  }`}
                >
                  {isSelected ? <View className="h-2.5 w-2.5 rounded-full bg-brand" /> : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
