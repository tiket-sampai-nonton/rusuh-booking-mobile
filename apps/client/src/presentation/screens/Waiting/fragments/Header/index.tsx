import { useRouter, type Href } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BrandMark } from "@presentation/components/BrandMark";
import { useResponsive } from "@presentation/hooks/useResponsive";

import { headerInsetStyle, styles } from "../../style";

export function Header({ status = "MENUNGGU" }: { readonly status?: string }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { isDesktop, isWeb } = useResponsive();
  return (
    <View
      style={[
        styles.header,
        isWeb && styles.headerWeb,
        isDesktop && styles.headerDesktop,
        !isWeb && headerInsetStyle(insets.top),
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Beranda Rusuh Tiket"
        onPress={() => router.replace("/" as Href)}
      >
        <BrandMark size={isDesktop ? 32 : 28} />
      </Pressable>
      <Text style={[styles.headerMeta, isDesktop && styles.headerMetaDesktop]}>
        {isDesktop ? `RUANG TUNGGU / STATUS ${status}` : "ANTREAN / 01"}
      </Text>
    </View>
  );
}
