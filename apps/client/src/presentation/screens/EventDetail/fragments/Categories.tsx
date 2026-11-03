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
import { Fragment } from "react";
import { Platform, Pressable, Text, View } from "react-native";

import { minorToIDR } from "@domain/services/money";

import type { CategoriesProps } from "../interface";
import { v2DetailStyles as styles } from "../style";

/** Availability status types matching prototype CSS classes */
type AvailabilityStatus = "available" | "limited" | "sold-out";

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
      {/*
       * Native: categoriesTableWrapper provides the outer 2px border frame.
       *         A categorySeparator View between each row gives the shared-
       *         border "table" look — the CSS margin-bottom:-2px trick breaks
       *         on native because the next item's bg covers the border below it.
       * Web:    categoriesTableWrapper is a no-op; item-level borders handle it.
       */}
      <View style={[styles.categoriesGrid, styles.categoriesTableWrapper]}>
        {categories.map((c, index) => {
          const status: AvailabilityStatus =
            c.available <= 0 ? "sold-out" : c.available < 50 ? "limited" : "available";

          const availTxt =
            status === "sold-out"
              ? "Habis"
              : status === "limited"
                ? `Sisa ${c.available}`
                : "Tersedia";

          return (
            <Fragment key={`${c.code}-${c.name}`}>
              <CategoryRow
                name={c.name}
                description={c.code ? `Kode ${c.code}` : undefined}
                price={minorToIDR(c.priceMinor)}
                availability={availTxt}
                status={status}
              />
              {/* 2px separator between rows (native only) — NOT after the last row */}
              {Platform.OS !== "web" && index < categories.length - 1 && (
                <View style={styles.categorySeparator} />
              )}
            </Fragment>
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
        <Text style={getAvailabilityStyle()}>{availability}</Text>
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
