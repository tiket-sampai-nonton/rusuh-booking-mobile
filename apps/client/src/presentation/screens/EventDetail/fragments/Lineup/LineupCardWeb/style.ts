import type { DynamicStyle } from "@presentation/utils/style";

export function lineupWebImageStyle(hovered: boolean): DynamicStyle {
  return {
    filter: hovered ? "grayscale(0%)" : "grayscale(100%)",
    transition: "filter 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
  } as DynamicStyle;
}
