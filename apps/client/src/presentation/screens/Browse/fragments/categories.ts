export const BROWSE_CATEGORIES = [
  { key: "all", label: "Semua" },
  { key: "concert", label: "Konser" },
  { key: "festival", label: "Festival" },
  { key: "sports", label: "Olahraga" },
  { key: "theater", label: "Teater" },
] as const;

export type BrowseCategoryKey = (typeof BROWSE_CATEGORIES)[number]["key"];
