import { View } from "react-native";

import { Loader } from "@presentation/components/design-system/Loader";

import { historyStateStyles } from "../../../style";

export function HistoryLoading() {
  return (
    <View style={historyStateStyles.loadingContainer} testID="history-loading">
      <Loader visible={true} label="ARSIP" testID="history-v2-loader" />
    </View>
  );
}
