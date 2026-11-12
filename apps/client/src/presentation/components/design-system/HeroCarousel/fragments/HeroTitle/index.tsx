import { Text, useWindowDimensions } from "react-native";

import { TEXT_HERO_MAX, TEXT_HERO_MIN } from "../../constants";
import { styleForHeroTitleText4 } from "../../style";

export function HeroTitle({ name }: { readonly name: string }) {
  const { width } = useWindowDimensions();

  // Responsive font size: clamp(3rem, 12vw, 10rem)
  // 3rem = 48px, 10rem = 160px, 12vw at 1200px = 144px
  const fontSize = Math.min(
    Math.max(TEXT_HERO_MIN, width * 0.12),
    TEXT_HERO_MAX,
  );

  return (
    <Text
      accessibilityRole="header"
      style={styleForHeroTitleText4(fontSize, fontSize)}
    >
      {name}
    </Text>
  );
}
