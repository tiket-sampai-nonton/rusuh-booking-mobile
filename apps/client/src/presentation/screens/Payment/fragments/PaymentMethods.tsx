/** V2 brutalist payment method rows (VA/QRIS/GoPay) — prototype 08-payment.html. */
import { Pressable, Text, View } from "react-native";

import { methodMeta } from "@domain/rules/payment-method";
import { v2, v2Border } from "@presentation/theme";

import type { PaymentMethodsProps } from "../interface";
import { paymentStyles } from "../style";

export function PaymentMethods({ methods, selected, onSelect }: PaymentMethodsProps) {
  return (
    <View style={{ borderWidth: v2Border.base, borderColor: v2.ink, backgroundColor: v2.ground }}>
      <Text
        className="px-5 py-3.5 text-2xs font-extrabold uppercase"
        style={{
          color: v2.gray,
          letterSpacing: 2,
          borderBottomWidth: v2Border.base,
          borderBottomColor: v2.ink,
        }}
      >
        Metode Pembayaran
      </Text>
      <View className="gap-2.5 p-5">
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
              className="flex-row items-center gap-3 p-3.5"
              style={{
                borderWidth: v2Border.base,
                borderColor: v2.ink,
                backgroundColor: isSelected ? v2.ink : v2.ground,
              }}
            >
              <View
                style={paymentStyles.methodIcon}
                className="items-center justify-center"
              >
                <Text className="text-2xs font-extrabold" style={{ color: v2.ground }}>
                  {m.icon}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold uppercase" style={{ color: isSelected ? v2.ground : v2.ink }}>
                  {m.name}
                </Text>
                <Text className="text-2xs" style={{ color: isSelected ? "#cccccc" : v2.gray }}>
                  {m.sub}
                </Text>
              </View>
              {/* Square radio → filled when selected (brutalist). */}
              <View
                className="h-5 w-5 items-center justify-center"
                style={{ borderWidth: v2Border.base, borderColor: isSelected ? v2.ground : v2.ink }}
              >
                {isSelected ? <View className="h-2.5 w-2.5" style={{ backgroundColor: v2.ground }} /> : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
