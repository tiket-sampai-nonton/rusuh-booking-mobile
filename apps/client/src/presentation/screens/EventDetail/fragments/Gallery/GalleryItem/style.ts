import type { DynamicStyle } from "@presentation/utils/style";

export function galleryItemWidthStyle(width: `${number}%`): DynamicStyle {
  return { width } as DynamicStyle;
}

export function galleryImageHoverStyle(hovered: boolean): DynamicStyle {
  return {
    filter: hovered ? "grayscale(0%)" : "grayscale(100%)",
    transform: hovered ? "scale(1.1)" : "scale(1)",
    transition: "all 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
  } as DynamicStyle;
}

export function galleryOverlayOpacityStyle(hovered: boolean): DynamicStyle {
  return { opacity: hovered ? 1 : 0 } as DynamicStyle;
}
