import { ActivityIndicator, View } from "react-native";

import { neutral } from "@presentation/theme";

import { homeStyles } from "../../../style";

export function HomeLoading() {
  return (
    <View
      className="items-center justify-center bg-ink"
      style={homeStyles.heroLoading}
      testID="home-loading"
    >
      <ActivityIndicator
        accessibilityLabel="Memuat event"
        color={neutral.card}
      />
    </View>
  );
}
