/**
 * RBT-096 — Inter font loader for  "Brutalist Mono" design system.
 *
 * The prototype uses Google Fonts Inter with weights 400/500/600/700/900.
 * This module provides:
 * 1. Font loading hook using expo-font
 * 2. Font family constants for StyleSheet usage
 *
 * Usage in _layout.tsx:
 *   const { fontsLoaded, fontError } = useInterFonts();
 *   if (!fontsLoaded && !fontError) return null; // or splash
 *
 * Usage in components:
 *   import { interFonts } from '@presentation/theme/fonts';
 *   style={{ fontFamily: interFonts.bold }} // Inter_700Bold
 */

import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  Inter_900Black,
} from "@expo-google-fonts/inter";

/**
 * Hook to load Inter fonts via expo-font.
 * Returns { fontsLoaded, fontError } - wait for fontsLoaded before rendering.
 */
export function useInterFonts() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    Inter_900Black,
  });

  return { fontsLoaded, fontError };
}

/**
 * Font family constants matching the loaded font names.
 * Use these in StyleSheet instead of plain 'Inter'.
 */
export const interFonts = {
  regular: "Inter_400Regular",
  medium: "Inter_500Medium",
  semiBold: "Inter_600SemiBold",
  bold: "Inter_700Bold",
  black: "Inter_900Black",
} as const;

/**
 * Resolve fontWeight (CSS-style) to Inter font family name.
 * Useful when you have dynamic weights.
 */
export function interFontForWeight(weight: "400" | "500" | "600" | "700" | "900" | number): string {
  const w = String(weight);
  switch (w) {
    case "400":
      return interFonts.regular;
    case "500":
      return interFonts.medium;
    case "600":
      return interFonts.semiBold;
    case "700":
      return interFonts.bold;
    case "900":
      return interFonts.black;
    default:
      // Fallback to regular
      return interFonts.regular;
  }
}
