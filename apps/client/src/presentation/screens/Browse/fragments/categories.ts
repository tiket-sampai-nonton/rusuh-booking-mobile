export const BROWSE_CATEGORIES = [
  { key: "all", label: "Semua" },
  { key: "concert", label: "Konser" },
  { key: "festival", label: "Festival" },
  { key: "sports", label: "Olahraga" },
] as const;

export type BrowseCategoryKey = (typeof BROWSE_CATEGORIES)[number]["key"];

/** Map the URL's category label or slug to the one selected browse chip. */
export function readBrowseCategory(
  value: string | readonly string[] | undefined,
): BrowseCategoryKey | null {
  const raw = typeof value === "string" ? value : value?.[0];
  const normalized = raw?.trim().toLowerCase();
  if (!normalized || normalized === "semua" || normalized === "all") {
    return "all";
  }

  return (
    BROWSE_CATEGORIES.find(
      (category) =>
        category.key === normalized ||
        category.label.toLowerCase() === normalized,
    )?.key ?? null
  );
}
