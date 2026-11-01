/**
 * SectionHead — 1:1 of the prototype `.sec-head`: a pill `.tag` (uppercase,
 * tracked), an `h2` (28px, weight 800, tight tracking), and a muted `p`. The
 * `archive` variant uses the muted grey tag styling from the History section.
 */
import { Text, View } from "react-native";

export interface SectionHeadProps {
  readonly tag: string;
  readonly title: string;
  readonly subtitle: string;
  readonly archive?: boolean;
}

export function SectionHead({ tag, title, subtitle, archive = false }: SectionHeadProps) {
  return (
    <View style={{ marginBottom: 34 }}>
      <View
        style={{
          alignSelf: "flex-start",
          borderWidth: 1,
          borderColor: archive ? "rgba(10,10,12,0.08)" : "rgba(236,28,36,0.18)",
          backgroundColor: archive ? "rgba(10,10,12,0.05)" : "rgba(236,28,36,0.08)",
          paddingHorizontal: 13,
          paddingVertical: 6,
        }}
        className="rounded-pill"
      >
        <Text
          style={{ fontSize: 10, letterSpacing: 2, color: archive ? "#6b6b76" : "#EC1C24" }}
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
