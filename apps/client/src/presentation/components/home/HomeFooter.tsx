/**
 * HomeFooter — 1:1 of the prototype `footer`: ink background, white brand mark,
 * a short blurb, three link columns (Kategori / Bantuan / Perusahaan) over a
 * hairline, and the fine print row. Links are inert (prototype `href="#"`).
 */
import { Text, View } from "react-native";

import { BrandMark } from "@presentation/components/BrandMark";

const COLUMNS: readonly { title: string; links: readonly string[] }[] = [
  { title: "Kategori", links: ["Musik", "Festival", "Jazz", "Rock"] },
  { title: "Bantuan", links: ["Cara Booking", "Aturan NIK", "Refund", "Kontak"] },
  { title: "Perusahaan", links: ["Tentang", "Karier", "Kebijakan Privasi"] },
];

export function HomeFooter() {
  return (
    <View style={{ backgroundColor: "#0a0a0c", paddingTop: 60, paddingBottom: 40, paddingHorizontal: 20, marginTop: 40 }} testID="home-footer">
      <View
        style={{ borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.08)", paddingBottom: 30, marginBottom: 24 }}
      >
        <View style={{ maxWidth: 300 }}>
          <BrandMark color="#ffffff" />
          <Text style={{ fontSize: 13, marginTop: 12, lineHeight: 21 }} className="text-white/60">
            Platform booking tiket konser online yang tetap adil dan stabil saat
            ribuan orang menyerbu sekaligus.
          </Text>
        </View>

        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 30, marginTop: 24 }}>
          {COLUMNS.map((col) => (
            <View key={col.title}>
              <Text style={{ fontSize: 15, marginBottom: 14 }} className="font-extrabold text-white">
                {col.title}
              </Text>
              {col.links.map((l) => (
                <Text key={l} style={{ fontSize: 13, marginBottom: 9 }} className="text-white/60">
                  {l}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 }}>
        <Text style={{ fontSize: 12 }} className="text-white/60">
          © 2026 Rusuh Tiket · PT. Tiga Sekawan Angin Ribut
        </Text>
        <Text style={{ fontSize: 12 }} className="text-white/60">
          Prototype V5 — selaras API contract
        </Text>
      </View>
    </View>
  );
}
