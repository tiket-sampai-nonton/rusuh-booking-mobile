/**
 * V2 Brutalist Mono marketing sections (RBT-088).
 *
 * Ports the prototype 01-home sections that sit BELOW the event grid and that
 * the V5 build never had: Stats (ink bar, 4 animated counters), How It Works
 * (4 numbered steps), Testimonials (3 quote cards), Newsletter (email + Daftar).
 * Pure black/white, 2px hard borders, no shadow. Reveal/stagger + counter are
 * Reanimated and reduced-motion safe. Presentation-only — no data wiring.
 */
import { useEffect, useRef, useState } from "react";
import { Text, TextInput, View } from "react-native";
import { useReducedMotion } from "react-native-reanimated";

import { V2Button, V2Reveal, V2RevealStagger, useV2ToastContext } from "@presentation/components/v2";
import { v2, interFonts } from "@presentation/theme";

const COUNT_MS = 1600;

/** Prototype `--ease` cubic-bezier(0.16,1,0.3,1) as an ease-out-expo approx. */
function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/** Prototype stat tiles (`data-target` / `data-suffix` / `data-decimal`). */
const STATS = [
  { target: 2_500_000, suffix: "+", decimals: 0, label: "Tiket Terjual" },
  { target: 500, suffix: "+", decimals: 0, label: "Mitra Event" },
  { target: 1_000_000, suffix: "+", decimals: 0, label: "Pengguna Aktif" },
  { target: 99.9, suffix: "%", decimals: 1, label: "Transaksi Aman" },
] as const;

/** Prototype how-it-works steps. */
const STEPS = [
  { n: "01", title: "Pilih Event", desc: "Cari dan pilih event yang ingin kamu hadiri dari berbagai kategori" },
  { n: "02", title: "Pilih Tiket", desc: "Tentukan kategori kursi dan jumlah tiket sesuai kebutuhan" },
  { n: "03", title: "Bayar", desc: "Selesaikan pembayaran dengan metode pilihanmu secara aman" },
  { n: "04", title: "Masuk ke Lokasi Acara", desc: "Tunjukkan tiket elektronik di pintu masuk dan nikmati acaranya." },
] as const;

/** Prototype testimonials. */
const TESTIMONIALS = [
  { text: "Proses beli tiket cepat banget, langsung masuk ke email. Gak perlu antre panjang lagi di lokasi.", name: "Rina Putri", role: "Jakarta" },
  { text: "Sudah beli 10+ tiket di Rusuh Tiket. Harga kompetitif dan sering ada promo menarik setiap bulan.", name: "Dimas Prakoso", role: "Bandung" },
  { text: "Customer service responsif. Waktu ada kendala pembayaran, langsung ditangani dengan cepat dan profesional.", name: "Sarah Amelia", role: "Surabaya" },
] as const;

/** Format a stat value with Indonesian thousands separators + suffix. */
export function formatStat(value: number, decimals: number, suffix: string): string {
  const fixed = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();
  const [intPart, decPart] = fixed.split(".");
  const grouped = (intPart ?? "0").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const body = decPart ? `${grouped},${decPart}` : grouped;
  return `${body}${suffix}`;
}

/**
 * Derive the counter's displayed string for progress `v` (0→1) toward `target`.
 * Extracted (and exported) so it is unit-testable off the UI thread — the
 * reanimated reaction below only forwards `v` into this via `runOnJS`.
 */
export function counterDisplay(
  v: number,
  target: number,
  decimals: number,
  suffix: string,
): string {
  return formatStat(v * target, decimals, suffix);
}

/**
 * Animated counter that ticks 0 → target over COUNT_MS on the JS thread via
 * requestAnimationFrame (a one-shot ~1.6s tick, cheap). Reduced-motion jumps
 * straight to the target. Pure JS so every branch is unit-testable (no worklet).
 */
function V2Counter({
  target,
  suffix,
  decimals,
  label,
}: {
  readonly target: number;
  readonly suffix: string;
  readonly decimals: number;
  readonly label: string;
}) {
  const reduced = useReducedMotion();
  const [display, setDisplay] = useState(() => formatStat(reduced ? target : 0, decimals, suffix));
  const rafRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  useEffect(() => {
    if (reduced) {
      setDisplay(formatStat(target, decimals, suffix));
      return;
    }
    const start = Date.now();
    const tick = (): void => {
      const t = Math.min(1, (Date.now() - start) / COUNT_MS);
      setDisplay(counterDisplay(easeOutExpo(t), target, decimals, suffix));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [reduced, target, decimals, suffix]);

  return (
    <View style={{ flex: 1, minWidth: 140, alignItems: "center", paddingVertical: 8 }}>
      <Text
        style={{ color: v2.ground, letterSpacing: -1 }}
        className="text-5xl font-v2 font-black"
        accessibilityLabel={`${label}: ${formatStat(target, decimals, suffix)}`}
      >
        {display}
      </Text>
      <Text
        style={{ color: v2.ground, opacity: 0.7, letterSpacing: 1.2, marginTop: 6 }}
        className="text-sm font-v2 font-medium uppercase"
      >
        {label}
      </Text>
    </View>
  );
}

/** Brutalist centered section header (uppercase title). */
function MarketingHeader({ title }: { readonly title: string }) {
  return (
    <View style={{ alignItems: "center", marginBottom: 32 }}>
      <View style={{ width: 40, height: 2, backgroundColor: v2.ink, marginBottom: 16 }} />
      <Text
        accessibilityRole="header"
        style={{ color: v2.ink, letterSpacing: -0.5, textAlign: "center" }}
        className="text-3xl font-v2 font-black uppercase"
      >
        {title}
      </Text>
    </View>
  );
}

export function HomeMarketing() {
  const toast = useV2ToastContext();
  const [email, setEmail] = useState("");
  const [focused, setFocused] = useState(false);

  const submitNewsletter = (): void => {
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
    if (!ok) {
      toast?.show("Masukkan alamat email yang valid.", "error");
      return;
    }
    setEmail("");
    toast?.show("Berhasil! Cek email kamu untuk konfirmasi.", "success");
  };

  return (
    <View testID="home-marketing">
      {/* STATS — ink bar with animated counters. */}
      <View style={{ backgroundColor: v2.ink, paddingVertical: 48, paddingHorizontal: 20 }} testID="home-stats">
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 24 }}>
          {STATS.map((s) => (
            <V2Counter key={s.label} target={s.target} suffix={s.suffix} decimals={s.decimals} label={s.label} />
          ))}
        </View>
      </View>

      {/* HOW IT WORKS — 4 numbered steps. */}
      <View style={{ paddingVertical: 48, paddingHorizontal: 20 }} testID="home-how">
        <V2Reveal>
          <MarketingHeader title="Cara Beli Tiket" />
        </V2Reveal>
        <V2RevealStagger step={80} testID="step">
          {STEPS.map((s) => (
            <View
              key={s.n}
              style={{
                borderWidth: 2,
                borderColor: v2.ink,
                backgroundColor: v2.ground,
                padding: 22,
                marginBottom: 16,
              }}
            >
              <Text style={{ color: v2.accent, letterSpacing: -1 }} className="text-4xl font-v2 font-black">
                {s.n}
              </Text>
              <Text style={{ color: v2.ink, marginTop: 10 }} className="text-xl font-v2 font-bold uppercase">
                {s.title}
              </Text>
              <Text style={{ color: v2.muted, marginTop: 8, lineHeight: 21 }} className="text-base font-v2">
                {s.desc}
              </Text>
            </View>
          ))}
        </V2RevealStagger>
      </View>

      {/* TESTIMONIALS — 3 quote cards. */}
      <View style={{ paddingVertical: 48, paddingHorizontal: 20, backgroundColor: v2.field }} testID="home-testimonials">
        <V2Reveal>
          <MarketingHeader title="Kata Mereka" />
        </V2Reveal>
        <V2RevealStagger step={80} testID="testimonial">
          {TESTIMONIALS.map((t) => (
            <View
              key={t.name}
              style={{
                borderWidth: 2,
                borderColor: v2.ink,
                backgroundColor: v2.ground,
                padding: 22,
                marginBottom: 16,
              }}
            >
              <Text style={{ color: v2.ink, lineHeight: 23 }} className="text-base font-v2">
                “{t.text}”
              </Text>
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 18, gap: 12 }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderWidth: 2,
                    borderColor: v2.ink,
                    backgroundColor: v2.ink,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: v2.ground }} className="text-base font-v2 font-black">
                    {t.name.charAt(0)}
                  </Text>
                </View>
                <View>
                  <Text style={{ color: v2.ink }} className="text-sm font-v2 font-bold uppercase">
                    {t.name}
                  </Text>
                  <Text style={{ color: v2.muted }} className="text-xs font-v2">
                    {t.role}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </V2RevealStagger>
      </View>

      {/* NEWSLETTER — email + Daftar. */}
      <View style={{ paddingVertical: 48, paddingHorizontal: 20, alignItems: "center" }} testID="home-newsletter">
        <V2Reveal>
          <MarketingHeader title="Dapatkan Info Event Terbaru" />
        </V2Reveal>
        <V2Reveal delay={80}>
          <Text style={{ color: v2.muted, textAlign: "center", marginBottom: 20 }} className="text-base font-v2">
            Berlangganan info event agar tidak melewatkan event favoritmu
          </Text>
        </V2Reveal>
        <V2Reveal delay={160}>
          <View style={{ width: "100%", maxWidth: 420, gap: 12 }}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              placeholder="Alamat email kamu"
              placeholderTextColor={v2.gray}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Alamat email untuk info event"
              testID="newsletter-input"
              style={{
                borderWidth: 2,
                borderColor: focused ? v2.accent : v2.ink,
                backgroundColor: v2.ground,
                color: v2.ink,
                paddingVertical: 14,
                paddingHorizontal: 16,
                fontFamily: interFonts.regular,
                fontSize: 16,
              }}
            />
            <V2Button label="Berlangganan" onPress={submitNewsletter} testID="newsletter-submit" />
          </View>
        </V2Reveal>
      </View>
    </View>
  );
}
