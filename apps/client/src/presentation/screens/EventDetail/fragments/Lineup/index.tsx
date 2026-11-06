import { Platform, ScrollView, Text, View } from "react-native";

import { designSpacingSemantic } from "@presentation/theme/event-design-tokens";

import { LineupCardNative } from "./LineupCardNative";
import { LineupCardWeb } from "./LineupCardWeb";
import { lineupStyles } from "./style";
import type { LineupItem } from "./types";

interface LineupProps {
  readonly items: readonly LineupItem[];
}

export function Lineup({ items }: LineupProps) {
  const isNative = Platform.OS !== "web";

  if (items.length === 0) {
    return (
      <Text style={lineupStyles.empty}>
        Daftar pengisi acara akan diumumkan menyusul.
      </Text>
    );
  }

  if (isNative) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={lineupStyles.scrollContent}
        style={lineupStyles.scroll}
        snapToInterval={100 + designSpacingSemantic.s}
        decelerationRate="fast"
      >
        {items.map((item, index) => (
          <LineupCardNative key={item.name} {...item} index={index} />
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={lineupStyles.grid}>
      {items.map((item) => (
        <LineupCardWeb key={item.name} {...item} />
      ))}
    </View>
  );
}
