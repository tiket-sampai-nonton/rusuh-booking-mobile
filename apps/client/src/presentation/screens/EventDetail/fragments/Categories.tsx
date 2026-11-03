/**
 * Prototype `.cats` — pricing categories + per-category availability.
 *
 * Categories come from the opaque `EventDetail.description` bag (FE-NEED O2:
 * the typed `priceMinor`/`available` contract is not wired yet), so they are
 * parsed DEFENSIVELY upstream. When none are present the screen falls back to a
 * server-authoritative note (prototype: harga & stok final from the server,
 * chosen after the queue).
 */
import { Text, View } from "react-native";

import { minorToIDR } from "@domain/services/money";

import type { CategoriesProps } from "../interface";
import { detailStyles } from "../style";

export function Categories({ categories }: CategoriesProps) {
  if (categories.length === 0) {
    return (
      <Text style={detailStyles.catNote} className="text-white/60">
        Kategori tiket final akan dipilih setelah kamu berhasil melewati antrean.
      </Text>
    );
  }
  return (
    <View>
      <View style={detailStyles.catList}>
        {categories.map((c) => {
          const out = c.available <= 0;
          const availTxt = out
            ? "Habis"
            : c.available < 50
              ? `Sisa ${c.available}`
              : "Tersedia";
          return (
            <View key={`${c.code}-${c.name}`} style={detailStyles.cat}>
              <View>
                <Text style={detailStyles.catName} className="font-bold text-white">
                  {c.name}
                </Text>
                {c.code ? (
                  <Text style={detailStyles.catCode} className="text-white/60">
                    Kode {c.code}
                  </Text>
                ) : null}
              </View>
              <View style={detailStyles.catPrWrap}>
                <Text style={detailStyles.catPrice}>{minorToIDR(c.priceMinor)}</Text>
                <Text
                  style={out ? detailStyles.catAvailOut : detailStyles.catAvail}
                  className={out ? "text-white/60" : undefined}
                >
                  {availTxt}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
      <Text style={detailStyles.catNote} className="text-white/45">
        Kategori tiket final akan dipilih setelah kamu berhasil melewati antrean.
      </Text>
    </View>
  );
}
