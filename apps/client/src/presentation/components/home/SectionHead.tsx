/**
 * SectionHead — 1:1 of the prototype `.sec-head`: a pill `.tag` (uppercase,
 * tracked), an `h2` (28px, weight 800, tight tracking), and a muted `p`. The
 * `archive` variant uses the muted grey tag styling from the History section.
 */
import { Text, View } from "react-native";

import { brand, neutral, withAlpha } from "@presentation/theme";

export interface SectionHeadProps {
  readonly tag: string;
  readonly title: string;
  readonly subtitle: string;
  readonly archive?: boolean;
}

// Prototype `.tag` tints: brand (--red) for live sections, --ink for archive.
const TAG_BORDER = { brand: withAlpha(brand.red, 0.18), ink: withAlpha(neutral.ink, 0.08) };
const TAG_BG = { brand: withAlpha(brand.red, 0.08), ink: withAlpha(neutral.ink, 0.05) };

export function SectionHead({ tag, title, subtitle, archive = false }: SectionHeadProps) {
  return (
    <View style={{ marginBottom: 34 }}>
      <View
        style={{
          alignSelf: "flex-start",
          borderWidth: 1,
          borderColor: archive ? TAG_BORDER.ink : TAG_BORDER.brand,
          backgroundColor: archive ? TAG_BG.ink : TAG_BG.brand,
          paddingHorizontal: 13,
          paddingVertical: 6,
        }}
        className="rounded-pill"
      >
        <Text
          style={{
            fontSize: 10,
            letterSpacing: 2,
            // Token values (not literals): archive uses --muted, brand uses --red.
            color: archive ? neutral.muted : brand.red,
          }}
          className="font-bold uppercase"
        >
          {tag}
        </Text>
      </View>
      <Text
        style={{ fontSize: 28, letterSpacing: -0.84, marginTop: 14, lineHeight: 30 }}
        className="font-extrabold text-ink"
        accessibilityRole="header"
      >
        {title}
      </Text>
      <Text style={{ fontSize: 14, marginTop: 8, lineHeight: 20 }} className="text-muted-foreground">
        {subtitle}
      </Text>
    </View>
  );
}
