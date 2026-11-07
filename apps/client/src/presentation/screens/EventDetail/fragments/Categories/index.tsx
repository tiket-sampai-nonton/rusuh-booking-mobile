/**
 *  Brutalist Mono Ticket Categories Preview
 *
 * MATCHES: `.genesis/prototype/v2-mobile/02-event-detail.html` .categories-preview
 *
 * Availability states (native only, per Design Palette Guide):
 * - "Tersedia" (available ≥50) → success green (#00aa00)
 * - "Sisa X" (0 < available <50) → warning orange (#ff6600)
 * - "Habis" (available = 0) → danger red (#ff0000) + strikethrough
 *
 * Features:
 * - 2px bordered rows with hover translateX(4px)
 * - Category name uppercase bold
 * - Price with availability-colored status text
 * - Note callout with left accent border
 */
import { View } from "react-native";

import { minorToIDR } from "@domain/services/money";

import type { CategoriesProps } from "../../interface";
import { designDetailStyles as styles } from "../../style";
import { CategoryRow } from "./CategoryRow";
import { LOW_CATEGORY_STOCK_THRESHOLD, type AvailabilityStatus } from "./types";

export function Categories({ categories }: CategoriesProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <View>
      <View style={styles.categoriesGrid}>
        {categories.map((c) => {
          const status = categoryAvailabilityStatus(c.available);
          const availTxt = categoryAvailabilityLabel(status, c.available);

          return (
            <CategoryRow
              key={`${c.code}-${c.name}`}
              name={c.name}
              description={c.code ? `Kode ${c.code}` : undefined}
              price={minorToIDR(c.priceMinor)}
              availability={availTxt}
              status={status}
            />
          );
        })}
      </View>
    </View>
  );
}

function categoryAvailabilityStatus(available: number): AvailabilityStatus {
  if (available <= 0) return "sold-out";
  if (available < LOW_CATEGORY_STOCK_THRESHOLD) return "limited";
  return "available";
}

function categoryAvailabilityLabel(
  status: AvailabilityStatus,
  available: number,
): string {
  switch (status) {
    case "sold-out":
      return "Habis";
    case "limited":
      return `Sisa ${available}`;
    case "available":
      return "Tersedia";
  }
}
