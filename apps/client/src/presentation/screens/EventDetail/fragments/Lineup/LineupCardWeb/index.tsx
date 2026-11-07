import { useState } from "react";
import {
  Image,
  Platform,
  Pressable,
  Text,
  type ImageStyle,
} from "react-native";

import { lineupStyles } from "../style";
import type { LineupItem } from "../types";
import { lineupWebImageStyle } from "./style";

export function LineupCardWeb({ name, role, avatar }: LineupItem) {
  const [isHovered, setIsHovered] = useState(false);
  const avatarUri =
    avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=000&color=fff&bold=true&size=160`;

  return (
    <Pressable
      style={[lineupStyles.cardWeb, isHovered && lineupStyles.cardHover]}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
    >
      <Image
        source={{ uri: avatarUri }}
        style={[
          lineupStyles.avatar,
          Platform.OS === "web" &&
            (lineupWebImageStyle(isHovered) as unknown as ImageStyle),
        ]}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
      />
      <Text
        style={[lineupStyles.name, isHovered && lineupStyles.nameHover]}
        numberOfLines={2}
      >
        {name}
      </Text>
      <Text
        style={[lineupStyles.role, isHovered && lineupStyles.roleHover]}
        numberOfLines={1}
      >
        {role}
      </Text>
    </Pressable>
  );
}
