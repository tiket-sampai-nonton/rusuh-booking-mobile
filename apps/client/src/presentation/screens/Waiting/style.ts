/**
 * RBT-043 — waiting-room styles. StyleSheet (not NativeWind) because the dark
 * aura surface + SVG ring + exact rgba palette from waiting.html can't be
 * expressed as Tailwind tokens here. Palette lifted verbatim from the prototype
 * `:root` vars (--ink / --ember / --red / --ok / --amber dark tones).
 */
import { StyleSheet } from "react-native";

import { brand, neutral, withAlpha } from "@presentation/theme";

import type { ZoneTone } from "./display";

/**
 * Prototype palette (waiting.html dark surface). Core hues come from the TOKEN
 * set (ink/ember/red/white); the remaining entries are the prototype's
 * dark-context accents (`--ok`/`--amber` dark tones, pill dot) that the light
 * token set does not model — kept here as the single documented source.
 */
export const palette = {
  ink: neutral.ink,
  ember: brand.ember,
  red: brand.red,
  white: neutral.card,
  muted: neutral.mutedDark,
  faint: withAlpha(neutral.card, 0.4),
  ringBg: withAlpha(neutral.card, 0.08),
  pillDot: "#ff3b4e", //   dark-context live dot (not a core token)
  ok: "#4ade80", //        waiting.html dark --ok
  okText: "#a7f3c4", //    dark --ok text tint
  amber: "#f5b301", //     waiting.html --amber
  amberText: "#ffdd8a", // dark amber text tint
  errText: "#ff9a8f", //   dark error text tint
} as const;

/** Zone banner tone → {bg, border, text} rgba triple (prototype .zone.*). */
export const ZONE_STYLE: Readonly<
  Record<ZoneTone, { bg: string; border: string; text: string }>
> = {
  ok: {
    bg: withAlpha(palette.ok, 0.12),
    border: withAlpha(palette.ok, 0.3),
    text: palette.okText,
  },
  warn: {
    bg: withAlpha(palette.amber, 0.12),
    border: withAlpha(palette.amber, 0.32),
    text: palette.amberText,
  },
  error: {
    bg: withAlpha(palette.red, 0.12),
    border: withAlpha(palette.red, 0.34),
    text: palette.errText,
  },
};

export const RING_SIZE = 200;
export const RING_RADIUS = 90;
export const RING_STROKE = 9;

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: palette.ink },
  shell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: withAlpha(palette.white, 0.14),
    backgroundColor: withAlpha(palette.white, 0.07),
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 22,
  },
  pillDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: palette.pillDot },
  pillLabel: { fontSize: 13, fontWeight: "600", color: palette.white },
  card: {
    width: "100%",
    maxWidth: 440,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: withAlpha(palette.white, 0.1),
    backgroundColor: withAlpha(palette.white, 0.04),
    padding: 9,
  },
  core: {
    borderRadius: 21,
    backgroundColor: withAlpha(palette.white, 0.03),
    paddingVertical: 34,
    paddingHorizontal: 28,
    alignItems: "center",
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 2.4,
    textTransform: "uppercase",
    fontWeight: "600",
    color: palette.muted,
  },
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    marginTop: 26,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  ringTrack: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_STROKE,
  },
  ringProgress: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_STROKE,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
    transform: [{ rotate: "-45deg" }],
  },
  ringCenter: { position: "absolute", alignItems: "center", justifyContent: "center" },
  position: {
    fontSize: 48,
    lineHeight: 48,
    fontWeight: "800",
    letterSpacing: -1.9,
    color: palette.white,
    fontVariant: ["tabular-nums"],
  },
  positionLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: palette.muted,
    marginTop: 6,
  },
  title: {
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: -0.4,
    color: palette.white,
    marginTop: 14,
    marginBottom: 6,
    textAlign: "center",
  },
  sub: {
    fontSize: 14,
    lineHeight: 22,
    color: palette.muted,
    maxWidth: 300,
    textAlign: "center",
  },
  zone: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  zoneText: { flex: 1, fontSize: 13, fontWeight: "600", lineHeight: 18 },
  zoneLabel: { fontWeight: "800" },
  stats: { flexDirection: "row", gap: 10, marginTop: 18, width: "100%" },
  stat: {
    flex: 1,
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: withAlpha(palette.white, 0.08),
    backgroundColor: withAlpha(palette.white, 0.04),
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: palette.white,
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: palette.muted,
    marginTop: 4,
  },
  admit: { marginTop: 22, width: "100%" },
  prep: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 11,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: withAlpha(palette.ok, 0.3),
    backgroundColor: withAlpha(palette.ok, 0.12),
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  prepText: { fontSize: 14, fontWeight: "700", color: palette.okText },
  admitTitle: {
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: -0.4,
    color: palette.white,
    marginTop: 14,
    textAlign: "center",
  },
  errBox: {
    marginTop: 18,
    width: "100%",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: withAlpha(palette.red, 0.34),
    backgroundColor: withAlpha(palette.red, 0.12),
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  errTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: palette.errText,
    textAlign: "center",
    marginBottom: 6,
  },
  errBody: { fontSize: 13, lineHeight: 20, color: palette.errText, textAlign: "center" },
  leave: { marginTop: 16, paddingVertical: 4 },
  leaveText: { fontSize: 12, color: palette.faint, textDecorationLine: "underline" },
  footnote: {
    fontSize: 11,
    color: palette.faint,
    marginTop: 20,
    textAlign: "center",
    maxWidth: 440,
  },
});
