import { useLocalSearchParams } from "expo-router";
import { Fragment } from "react";
import { Text, View } from "react-native";

import { Seo } from "@presentation/components/Seo";

// Booking route `/success/[bookingId]` (confirmed ticket + QR). Skeleton
// placeholder — real success/QR screen lands in a later RBT. Routing-only.
// noindex: a crawler must never see ticket details / NIK (SECURITY / §6.5).
export default function SuccessScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  return (
    <Fragment>
      <Seo title="E-Tiket" description="Your tickets." path={`/success/${bookingId}`} noindex />
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-lg font-semibold text-brand" accessibilityRole="header">
          Success — /success/{bookingId} (RBT-002)
        </Text>
      </View>
    </Fragment>
  );
}
