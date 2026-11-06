/**
 * Loads the bundled Plus Jakarta Sans family for native and web.
 *
 * The prototype uses Plus Jakarta Sans with regular, medium, semibold, bold,
 * and extra-bold weights. Separate static files keep the font compatible with
 * this app's Expo SDK / React Native version while using one typeface family.
 */

import { useFonts } from "expo-font";
import PlusJakartaSansBold from "../../assets/fonts/PlusJakartaSans-Bold.ttf";
import PlusJakartaSansExtraBold from "../../assets/fonts/PlusJakartaSans-ExtraBold.ttf";
import PlusJakartaSansMedium from "../../assets/fonts/PlusJakartaSans-Medium.ttf";
import PlusJakartaSansRegular from "../../assets/fonts/PlusJakartaSans-Regular.ttf";
import PlusJakartaSansSemiBold from "../../assets/fonts/PlusJakartaSans-SemiBold.ttf";

export const plusJakartaSansFonts = {
  regular: "PlusJakartaSans_400Regular",
  medium: "PlusJakartaSans_500Medium",
  semiBold: "PlusJakartaSans_600SemiBold",
  bold: "PlusJakartaSans_700Bold",
  extraBold: "PlusJakartaSans_800ExtraBold",
} as const;

/** Wait for the bundled typeface to load before rendering app text. */
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
