/**
 * Web font loader. These WOFF2 files are Latin-subset versions of the licensed
 * bundled TTF faces; native continues to load the original full TTF files.
 */
import { useFonts } from "expo-font";
import PlusJakartaSansBold from "../../assets/fonts/web/PlusJakartaSans-Bold.woff2";
import PlusJakartaSansExtraBold from "../../assets/fonts/web/PlusJakartaSans-ExtraBold.woff2";
import PlusJakartaSansMedium from "../../assets/fonts/web/PlusJakartaSans-Medium.woff2";
import PlusJakartaSansRegular from "../../assets/fonts/web/PlusJakartaSans-Regular.woff2";
import PlusJakartaSansSemiBold from "../../assets/fonts/web/PlusJakartaSans-SemiBold.woff2";

export const plusJakartaSansFonts = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semiBold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extraBold: "PlusJakartaSans_800ExtraBold",
} as const;

/** Wait for the web subset typeface to load before rendering app text. */
export function usePlusJakartaSansFonts() {
  const [fontsLoaded, fontError] = useFonts({
    [plusJakartaSansFonts.regular]: PlusJakartaSansRegular,
    [plusJakartaSansFonts.medium]: PlusJakartaSansMedium,
    [plusJakartaSansFonts.semiBold]: PlusJakartaSansSemiBold,
    [plusJakartaSansFonts.bold]: PlusJakartaSansBold,
    [plusJakartaSansFonts.extraBold]: PlusJakartaSansExtraBold,
  });

  return { fontsLoaded, fontError };
}

/** Resolve CSS-style weights to the matching bundled Plus Jakarta Sans face. */
export function plusJakartaSansFontForWeight(weight: string | number): string {
  switch (String(weight)) {
    case "500":
      return plusJakartaSansFonts.medium;
    case "600":
      return plusJakartaSansFonts.semiBold;
    case "700":
      return plusJakartaSansFonts.bold;
    case "800":
    case "900":
      return plusJakartaSansFonts.extraBold;
    case "400":
    default:
      return plusJakartaSansFonts.regular;
  }
}
