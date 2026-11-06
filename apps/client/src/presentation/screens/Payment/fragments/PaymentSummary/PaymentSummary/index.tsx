import { Text, View } from "react-native";

import { minorToIDR } from "@domain/services/money";

import type { PaymentSummaryProps } from "../../../interface";
import { paymentSummaryStyles } from "../style";

export function PaymentSummary({
  bookingId,
  amountMinor,
}: PaymentSummaryProps) {
  return (
    <View className="mb-4" style={paymentSummaryStyles.container}>
      <Text
        className="px-5 py-3.5 text-2xs font-extrabold uppercase"
        style={paymentSummaryStyles.heading}
      >
        Ringkasan Pesanan
      </Text>
      <View className="p-5">
        <Text
          className="text-base font-extrabold uppercase"
          style={paymentSummaryStyles.bookingId}
        >
          Pesanan {bookingId}
        </Text>
        {/* Total follows D10.1: service fee is not added by the client. */}
        <View
          className="mt-4 flex-row items-center justify-between pt-3"
          style={paymentSummaryStyles.totalRow}
        >
          <Text
            className="text-base font-extrabold"
            style={paymentSummaryStyles.total}
          >
            Total
          </Text>
          <Text
            className="text-lg font-extrabold"
            style={paymentSummaryStyles.total}
            testID="payment-total"
          >
            {minorToIDR(amountMinor)}
          </Text>
        </View>
      </View>
    </View>
  );
}
