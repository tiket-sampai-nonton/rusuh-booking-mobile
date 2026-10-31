/** Amber-tinted glyph circle (prototype expired.html reason glyph). */
import { Text, View } from "react-native";

import { expiredStyles } from "../style";

export function ExpiredGlyph({ glyph }: { readonly glyph: string }) {
  return (
    <View style={expiredStyles.glyph}>
      <Text style={expiredStyles.glyphText} accessibilityElementsHidden>{glyph}</Text>
    </View>
  );
}
