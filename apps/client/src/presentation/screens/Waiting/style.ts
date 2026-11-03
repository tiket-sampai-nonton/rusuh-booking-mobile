/**
 * RBT-091 — Waiting-room styles, V2 "Brutalist Mono" TERMINAL variant.
 *
 * The waiting room is the ONE screen the V2 prototype (06-waiting) renders in the
 * mono/terminal variant: pure black ground, white ink, HARD 3px borders, square
 * corners (no radius), JetBrains Mono. This is deliberate (see v2-tokens:
 * v2Font.mono / v2Border.heavy) — it reads as a live "terminal" while you wait.
 *
 * STYLE ONLY. The screen's logic is untouched: server-authoritative polling
 * (useQueuePolling — no Math.random, no device clock), the RBT-040 state machine,
 * RBT-044 auto-claim, and the icon+label (never color-only) zone banners all stay
 * exactly as before. Every testID is preserved.
 */
import { StyleSheet } from "react-native";

import { v2, v2Border, v2Font, v2Zone } from "@presentation/theme";

import type { ZoneTone } from "./display";

/**
 * V2 Brutalist Mono palette (06-waiting). Pure black/white base; the live dot +
 * admit/ok and error tints come from the unified V2 token set (no inline rgba).
 */
export const palette = {
  ink: v2.ink, //        black ground
  ember: v2.accent, //   progress accent (brutalist red)
  red: v2.accent,
  white: v2.ground, //   white ink
  muted: "#999999", //   mono muted gray (on-black readable)
  faint: "#666666", //   mono faint gray
  ringBg: "#333333", //  ring track on black
  pillDot: v2.accent, //  live dot
  ok: v2Zone.ok.border, //      GUARANTEED border/green
  okText: v2Zone.ok.border, //  green text on black
  amber: v2Zone.warn.border, // POSSIBLE amber
  amberText: v2Zone.warn.border,
  errText: v2.accent, //  error red text
} as const;

/**
 * Zone banner tone → {bg, border, text}. V2 brutalist: WHITE card, hard colored
 * border, colored bold text — the icon+label still carries the meaning so it is
 * never color-only (RBT-080). Uses the unified v2Zone tints.
 */
export const ZONE_STYLE: Readonly<
  Record<ZoneTone, { bg: string; border: string; text: string }>
> = {
  ok: { bg: v2.ground, border: v2Zone.ok.border, text: v2Zone.ok.text },
  warn: { bg: v2.ground, border: v2Zone.warn.border, text: v2Zone.warn.text },
  error: { bg: v2.ground, border: v2Zone.bad.border, text: v2Zone.bad.text },
};

export const RING_SIZE = 200;
export const RING_RADIUS = 90;
export const RING_STROKE = 9;

const B = v2Border.heavy; // 3px hard brutalist border
const MONO = v2Font.mono; // JetBrains Mono

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
    borderWidth: B,
    borderColor: palette.white,
    backgroundColor: palette.ink,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 22,
  },
  pillDot: { width: 7, height: 7, borderRadius: 999, backgroundColor: palette.pillDot },
  pillLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: palette.white,
    fontFamily: MONO,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  card: {
    width: "100%",
    maxWidth: 440,
    borderWidth: B,
    borderColor: palette.white,
    backgroundColor: palette.ink,
    padding: 9,
  },
  core: {
    borderWidth: 1,
    borderColor: palette.ringBg,
    backgroundColor: palette.ink,
    paddingVertical: 34,
    paddingHorizontal: 28,
    alignItems: "center",
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 2.4,
    textTransform: "uppercase",
    fontWeight: "700",
    color: palette.muted,
    fontFamily: MONO,
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
    fontFamily: MONO,
    fontVariant: ["tabular-nums"],
  },
  positionLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: palette.muted,
    marginTop: 6,
    fontFamily: MONO,
  },
  title: {
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: -0.4,
    color: palette.white,
    marginTop: 14,
    marginBottom: 6,
    textAlign: "center",
    fontFamily: MONO,
  },
  sub: {
    fontSize: 14,
    lineHeight: 22,
    color: palette.muted,
    maxWidth: 300,
    textAlign: "center",
    fontFamily: MONO,
  },
  zone: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
    borderWidth: B,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  zoneText: { flex: 1, fontSize: 13, fontWeight: "600", lineHeight: 18, fontFamily: MONO },
  zoneLabel: { fontWeight: "800" },
  stats: { flexDirection: "row", gap: 10, marginTop: 18, width: "100%" },
  stat: {
    flex: 1,
    alignItems: "center",
    borderWidth: B,
    borderColor: palette.white,
    backgroundColor: palette.ink,
    paddingVertical: 14,
    paddingHorizontal: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    color: palette.white,
    fontFamily: MONO,
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: palette.muted,
    marginTop: 4,
    fontFamily: MONO,
  },
  admit: { marginTop: 22, width: "100%" },
  prep: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 11,
    borderWidth: B,
    borderColor: palette.ok,
    backgroundColor: palette.ink,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  prepText: { fontSize: 14, fontWeight: "700", color: palette.okText, fontFamily: MONO },
  admitTitle: {
    fontSize: 23,
    fontWeight: "800",
    letterSpacing: -0.4,
    color: palette.white,
    marginTop: 14,
    textAlign: "center",
    fontFamily: MONO,
  },
  errBox: {
    marginTop: 18,
    width: "100%",
    borderWidth: B,
    borderColor: palette.errText,
    backgroundColor: palette.ink,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  errTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: palette.errText,
    textAlign: "center",
    marginBottom: 6,
    fontFamily: MONO,
  },
  errBody: { fontSize: 13, lineHeight: 20, color: palette.errText, textAlign: "center", fontFamily: MONO },
  leave: { marginTop: 16, paddingVertical: 4 },
  leaveText: { fontSize: 12, color: palette.faint, textDecorationLine: "underline", fontFamily: MONO },
  footnote: {
    fontSize: 11,
    color: palette.faint,
    marginTop: 20,
    textAlign: "center",
    maxWidth: 440,
    fontFamily: MONO,
  },
});
