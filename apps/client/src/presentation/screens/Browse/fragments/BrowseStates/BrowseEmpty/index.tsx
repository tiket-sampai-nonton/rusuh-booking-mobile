import { Text, View } from "react-native";

import { designColors, plusJakartaSansFonts } from "@presentation/theme";

import { browseEmpty } from "../../../style";

const styles = {
  title: {
    color: designColors.ink,
    fontSize: 18,
    fontFamily: plusJakartaSansFonts.extraBold,
    textTransform: "uppercase" as const,
    letterSpacing: -0.36,
    textAlign: "center" as const,
    marginBottom: 8,
  },
  message: {
    color: designColors.inkMuted,
    fontSize: 14,
    fontFamily: plusJakartaSansFonts.regular,
    textAlign: "center" as const,
    maxWidth: 320,
  },
};

export function BrowseEmpty() {
  return (
    <View style={browseEmpty} testID="browse-empty">
      <Text style={styles.title}>Tidak Ada Event</Text>
      <Text style={styles.message}>
        Tidak ada event yang cocok dengan filter ini. Coba ubah filter atau
        kembali ke beranda.
      </Text>
    </View>
  );
}
