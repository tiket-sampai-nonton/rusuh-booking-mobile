/**
 * V2 Brutalist Mono Ticket Categories Preview
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
import { Platform, Text, View } from "react-native";

import { minorToIDR } from "@domain/services/money";

import type { CategoriesProps } from "../interface";
import { v2DetailStyles as styles } from "../style";

/** Availability status types matching prototype CSS classes */
type AvailabilityStatus = "available" | "limited" | "sold-out";

export function Categories({ categories }: CategoriesProps) {
  if (categories.length === 0) {
    return null;
  }

  return (
    <View>
      <View style={styles.categoriesGrid}>
        {categories.map((c) => {
          const status: AvailabilityStatus =
            c.available <= 0 ? "sold-out" : c.available < 50 ? "limited" : "available";

          const availTxt =
            status === "sold-out"
              ? "Habis"
              : status === "limited"
                ? `Sisa ${c.available}`
                : "Tersedia";

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

// ═══════════════════════════════════════════════════════════════════════════════
// CATEGORY ROW COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

interface CategoryRowProps {
  readonly name: string;
  readonly description?: string;
  readonly price: string;
  readonly availability: string;
  readonly status: AvailabilityStatus;
}

function CategoryRow({
  name,
  description,
  price,
  availability,
  status,
}: CategoryRowProps) {
  const isSoldOut = status === "sold-out";

  // Native: use design-palette status colors; Web: keep existing behavior
  const getAvailabilityStyle = () => {
    if (Platform.OS === "web") {
      // Web uses existing green/muted pattern
      return isSoldOut ? styles.categoryAvailOut : styles.categoryAvail;
    }
    // Native follows prototype exactly: available (green), limited (orange), sold-out (red + strikethrough)
    switch (status) {
      case "available":
        return styles.categoryAvail;
      case "limited":
        return styles.categoryAvailLimited;
      case "sold-out":
        return styles.categoryAvailOut;
    }
  };

  return (
    <View style={[styles.categoryFrame, isSoldOut && styles.categorySoldOut]}>
      <View style={styles.categoryItem}>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{name}</Text>
          {description && <Text style={styles.categoryDesc}>{description}</Text>}
        </View>
        <View style={styles.categoryPrice}>
          <Text style={styles.categoryPriceValue}>{price}</Text>
          <Text style={getAvailabilityStyle()}>{availability}</Text>
        </View>
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STATIC DEMO CATEGORIES (for prototyping)
// ═══════════════════════════════════════════════════════════════════════════════

export const DEMO_CATEGORIES = [
  { name: "VVIP", code: "", desc: "Front stage, Meet & Greet", priceMinor: 1500000_00, available: 50 },
  { name: "VIP", code: "", desc: "Premium seating area", priceMinor: 950000_00, available: 200 },
  { name: "CAT 1", code: "", desc: "Tribune bawah", priceMinor: 550000_00, available: 500 },
  { name: "CAT 2", code: "", desc: "Tribune atas", priceMinor: 350000_00, available: 1000 },
  { name: "Festival", code: "", desc: "Standing area", priceMinor: 200000_00, available: 0 },
] as const;
