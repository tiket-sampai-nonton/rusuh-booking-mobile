/**  brutalist payment method rows (VA/QRIS/GoPay) — prototype 08-payment.html. */
import { Pressable, Text, View } from "react-native";

import { methodMeta } from "@domain/rules/payment-method";
import { useResponsive } from "@presentation/hooks/useResponsive";

import type { PaymentMethodsProps } from "../../interface";
import { paymentStyles } from "../../style";
import { componentStyles } from "./style";
import {
  styleForPaymentMethodsPressable0,
  styleForPaymentMethodsText1,
  styleForPaymentMethodsText2,
  styleForPaymentMethodsView3,
} from "./style";

export function PaymentMethods({
  methods,
  selected,
  onSelect,
}: PaymentMethodsProps) {
  const { isMobileWeb } = useResponsive();
  return (
    <View
      style={[
        componentStyles.elementBorderWidth0,
        isMobileWeb && componentStyles.mobileWebContainer,
      ]}
    >
      <Text
        className={
          isMobileWeb
            ? "px-3 py-2.5 text-2xs font-extrabold uppercase"
            : "px-5 py-3.5 text-2xs font-extrabold uppercase"
        }
        style={componentStyles.elementColor1}
      >
        Metode Pembayaran
      </Text>
      <View className={isMobileWeb ? "gap-2 p-3" : "gap-2.5 p-5"}>
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
              className={
                isMobileWeb
                  ? "flex-row items-center gap-3 p-3"
                  : "flex-row items-center gap-3 p-3.5"
              }
              style={styleForPaymentMethodsPressable0(isSelected)}
            >
              <View
                style={paymentStyles.methodIcon}
                className="items-center justify-center"
              >
                <Text
                  className="text-2xs font-extrabold"
                  style={componentStyles.elementColor2}
                >
                  {m.icon}
                </Text>
              </View>
              <View className="flex-1">
                <Text
                  className="text-sm font-bold uppercase"
                  style={styleForPaymentMethodsText1(isSelected)}
                >
                  {m.name}
                </Text>
                <Text
                  className="text-2xs"
                  style={styleForPaymentMethodsText2(isSelected)}
                >
                  {m.sub}
                </Text>
              </View>
              {/* Square radio → filled when selected (brutalist). */}
              <View
                className="h-5 w-5 items-center justify-center"
                style={styleForPaymentMethodsView3(isSelected)}
              >
                {isSelected ? (
                  <View
                    className="h-2.5 w-2.5"
                    style={componentStyles.elementBackgroundColor3}
                  />
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
