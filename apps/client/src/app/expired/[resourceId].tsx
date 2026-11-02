import { useLocalSearchParams } from "expo-router";
import { Fragment } from "react";
import { Text, View } from "react-native";

import { Seo } from "@presentation/components/Seo";

// Top-level route `/expired/[resourceId]` (expired queue session / booking
// hold / payment). Skeleton placeholder — real expiry screen lands later.
// noindex: transactional state, never indexed (§6.5).
export default function ExpiredScreen() {
  const { resourceId } = useLocalSearchParams<{ resourceId: string }>();
  return (
    <Fragment>
      <Seo title="Kedaluwarsa" description="Expired." path={`/expired/${resourceId}`} noindex />
      <View className="flex-1 items-center justify-center bg-background">
        <Text className="text-lg font-semibold text-brand" accessibilityRole="header">
          Expired — /expired/{resourceId} (RBT-002)
        </Text>
      </View>
    </Fragment>
  );
}
