import { Text, View } from "react-native";

import type { BrowseChipProps } from "../../../interface";

import { browseChipStyles } from "./style";

export function BrowseChip({ label, value }: BrowseChipProps) {
  return (
    <View style={browseChipStyles.container}>
      <Text
        style={browseChipStyles.label}
        className="text-2xs font-sans font-bold uppercase"
      >
        {label}:{" "}
        <Text
          style={browseChipStyles.value}
          className="font-sans font-extrabold"
        >
          {value}
        </Text>
      </Text>
    </View>
  );
}
