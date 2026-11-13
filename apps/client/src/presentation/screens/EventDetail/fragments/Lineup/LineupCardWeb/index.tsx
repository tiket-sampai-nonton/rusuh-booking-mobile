import { useState } from "react";
import { Platform, Pressable, Text, type ImageStyle } from "react-native";
import { CachedImage } from "@presentation/components/CachedImage";

import { lineupStyles } from "../style";
import type { LineupItem } from "../types";
import { lineupWebImageStyle } from "./style";
import { neutral } from "@presentation/theme";

export function LineupCardWeb({ name, role, avatar }: LineupItem) {
  const [isHovered, setIsHovered] = useState(false);
  const avatarUri =
    avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${neutral.ink.slice(1)}&color=${neutral.paper.slice(1)}&bold=true&size=160`;

  return (
    <Pressable
      style={[lineupStyles.cardWeb, isHovered && lineupStyles.cardHover]}
      onHoverIn={() => setIsHovered(true)}
      onHoverOut={() => setIsHovered(false)}
    >
      <CachedImage
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
