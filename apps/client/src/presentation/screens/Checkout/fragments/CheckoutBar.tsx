/** Dark sticky checkout bar — Total + "Lanjut Bayar" (prototype detail.html). */
import { Pressable, Text, View } from "react-native";

import { minorToIDR } from "@domain/services/money";

import type { CheckoutBarProps } from "../interface";
import { checkoutBar } from "../style";

export function CheckoutBar({
  totalMinor,
  ready,
  pending,
  expired,
  errorMessage,
  onSubmit,
  bottomInset,
}: CheckoutBarProps) {
  const canSubmit = ready && !pending && !expired;
  return (
    <View style={checkoutBar(bottomInset)} className="px-5 pt-4">
      {errorMessage ? (
        <Text className="mb-2 text-center text-xs text-error-dark" accessibilityLiveRegion="polite">
          {errorMessage}
        </Text>
      ) : null}
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-2xs uppercase tracking-tag text-white/50">Total</Text>
          <Text className="text-xl font-extrabold text-white" testID="checkout-total">
            {minorToIDR(totalMinor)}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Lanjut Bayar"
          accessibilityState={{ disabled: !canSubmit }}
          disabled={!canSubmit}
          onPress={onSubmit}
          testID="checkout-submit"
          className={`flex-row items-center gap-3 rounded-pill py-3.5 pl-6 pr-3.5 ${
            ready && !expired ? "bg-brand" : "bg-white/15"
          }`}
        >
          <Text className="text-md font-bold text-white">
            {pending ? "Memproses…" : expired ? "Waktu habis" : "Lanjut Bayar"}
          </Text>
          {canSubmit ? (
            <View className="h-7 w-7 items-center justify-center rounded-full bg-white/25">
              <Text className="text-sm text-white" accessibilityElementsHidden>↗</Text>
            </View>
          ) : null}
        </Pressable>
      </View>
    </View>
  );
}
