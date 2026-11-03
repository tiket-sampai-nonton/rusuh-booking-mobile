/**
 * V2 Brutalist Mono Ticket Categories Preview
 *
 * MATCHES: `.oil-ui/v2/02-event-detail.html` .categories-preview
 *
 * Features:
 * - 2px bordered rows with hover translateX(4px)
 * - Category name uppercase bold
 * - Price with success/muted availability text
 * - Note callout with left accent border
 */
import { Pressable, Text, View } from "react-native";

import { minorToIDR } from "@domain/services/money";

import type { CategoriesProps } from "../interface";
import { v2DetailStyles as styles } from "../style";

export function Categories({ categories }: CategoriesProps) {
  if (categories.length === 0) {
    return (
      <View style={styles.categoriesNote}>
        <Text style={styles.categoriesNoteText}>
          Kategori tiket final akan dipilih setelah kamu berhasil melewati antrean.
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.categoriesGrid}>
        {categories.map((c) => {
          const isOut = c.available <= 0;
          const availTxt = isOut
            ? "Habis"
            : c.available < 50
              ? `Sisa ${c.available}`
              : "Tersedia";

          return (
            <CategoryRow
              key={`${c.code}-${c.name}`}
              name={c.name}
              description={c.code ? `Kode ${c.code}` : undefined}
              price={minorToIDR(c.priceMinor)}
              availability={availTxt}
              isSoldOut={isOut}
            />
          );
        })}
      </View>

      <View style={styles.categoriesNote}>
        <Text style={styles.categoriesNoteText}>
          Kategori tiket final akan dipilih setelah kamu berhasil melewati antrean.
        </Text>
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
  readonly isSoldOut: boolean;
}

function CategoryRow({
  name,
  description,
  price,
  availability,
  isSoldOut,
}: CategoryRowProps) {
  return (
    <Pressable
      style={({ hovered }) => [
        styles.categoryItem,
        isSoldOut && styles.categorySoldOut,
        hovered && !isSoldOut && styles.categoryItemHover,
      ]}
      disabled={isSoldOut}
    >
      {/* Left: Name + Description */}
      <View style={styles.categoryInfo}>
        <Text style={styles.categoryName}>{name}</Text>
        {description && <Text style={styles.categoryDesc}>{description}</Text>}
      </View>

      {/* Right: Price + Availability */}
      <View style={styles.categoryPrice}>
        <Text style={styles.categoryPriceValue}>{price}</Text>
        <Text style={isSoldOut ? styles.categoryAvailOut : styles.categoryAvail}>
          {availability}
        </Text>
      </View>
    </Pressable>
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
