import type { DynamicStyle } from "@presentation/utils/style";

export function styleForBrowseHeroView0(
  arg0: number,
  isMobileWeb = false,
): DynamicStyle {
  return { paddingTop: arg0 + (isMobileWeb ? 72 : 80) } as DynamicStyle;
}
