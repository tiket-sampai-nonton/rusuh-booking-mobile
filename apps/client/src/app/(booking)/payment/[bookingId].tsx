import { useLocalSearchParams } from "expo-router";
import { Fragment } from "react";
import { Text, View } from "react-native";

import { Seo } from "@presentation/components/Seo";

// Booking route `/payment/[bookingId]` (mock-first payment attempt). Skeleton
// placeholder — real payment flow lands in a later RBT. Routing-only.
// noindex: a crawler must never see payment state (SECURITY / §6.5).
export default function PaymentScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  return (
    <Fragment>
      <Seo title="Pembayaran" description="Payment." path={`/payment/${bookingId}`} noindex />
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-lg font-semibold text-brand" accessibilityRole="header">
          Payment — /payment/{bookingId} (RBT-002)
        </Text>
      </View>
    </Fragment>
  );
}
