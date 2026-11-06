import { Pressable, Text, View } from "react-native";

import {
  browseLoadMore,
  browseLoadMoreButtonStyle,
  browseLoadMoreLabel,
} from "../../style";

interface BrowseLoadMoreProps {
  readonly disabled: boolean;
  readonly onPress: () => void;
}

export function BrowseLoadMore({ disabled, onPress }: BrowseLoadMoreProps) {
  return (
    <View style={browseLoadMore}>
      <Pressable
        style={({ pressed }) => browseLoadMoreButtonStyle(pressed, disabled)}
        onPress={onPress}
        disabled={disabled}
        testID="load-more-btn"
      >
        <Text style={browseLoadMoreLabel(disabled)}>
          {disabled ? "Semua Event Ditampilkan" : "Muat Lebih Banyak Event"}
        </Text>
      </Pressable>
    </View>
  );
}
