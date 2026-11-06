import { Text, View } from "react-native";

import { LockIcon } from "@presentation/components/ArrowIcon";
import { designColors } from "@presentation/theme";

import { paymentSummaryStyles } from "../style";

export function PaymentHoldBanner() {
  return (
    <View
      className="mb-6 flex-row items-center gap-2.5 px-3.5 py-3"
      style={paymentSummaryStyles.holdBanner}
    >
      <LockIcon color={designColors.ground} size={16} />
      <Text className="flex-1 text-xs font-semibold text-white">
        Tiket sudah disimpan sementara. Selesaikan pembayaran sebelum waktu
        habis.
      </Text>
    </View>
  );
}
