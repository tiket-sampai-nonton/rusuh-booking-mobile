/** Prototype `.fact` — small labelled stat in the buy-box grid. */
import { Text, View } from "react-native";

import type { FactProps } from "../interface";
import { detailStyles } from "../style";

export function Fact({ label, value }: FactProps) {
  return (
    <View style={detailStyles.fact}>
      <Text style={detailStyles.factLabel} className="uppercase text-white/60">{label}</Text>
      <Text style={detailStyles.factValue} className="font-semibold text-white">{value}</Text>
    </View>
  );
}
