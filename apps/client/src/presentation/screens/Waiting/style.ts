/**
 * RBT-091 — Waiting-room styles,  "Brutalist Mono" (Light variant).
 *
 * Matches the  prototype `06-waiting.html`:
 * - WHITE background, BLACK text/borders
 * - JetBrains Mono font throughout
 * - 3px solid black borders
 * - SVG ring progress indicator (220px)
 * - Pulse animation on status badge
 * - Zone banners with semantic colors
 * - Auto-redirect countdown with pulsing red background
 * - Warning boxes (background, long wait, turn expiry)
 * - Modal overlay for leave confirmation
 * - Network status bar (fixed bottom)
 * - Loading overlay with spinner
 *
 * STYLE ONLY. The screen's logic is untouched: server-authoritative polling
 * (useQueuePolling — no Math.random, no device clock), the RBT-040 state machine,
 * RBT-044 auto-claim, and the icon+label (never color-only) zone banners all stay
 * exactly as before. Every testID is preserved.
 */
import { Platform, StyleSheet, type TextStyle, type ViewStyle } from "react-native";

import { designColors, designFonts, designBorders, designZoneBanners } from "@presentation/theme";

import type { ZoneTone } from "./display";

/**
 *  Brutalist Mono palette (06-waiting.html). WHITE background, BLACK text.
 * DESIGN PALETTE GUIDE: NO GRAYS in main UI — only use inkMuted (#666666).
 */
export const palette = {
  // Core
  ground: designColors.ground, // #fff - background
  ink: designColors.ink, // #000 - text/borders
  gray: designColors.inkMuted, // #666666 - the only allowed gray per Design Palette Guide
  muted: designColors.inkMuted, // #666666 - same
  field: designColors.field, // #f5f5f5 - subtle background (estimated time block)
  ringBg: designColors.field, // #f5f5f5 - ring track background (use field, not arbitrary gray)

  // Functional
  red: designColors.danger, // #ff0000 - accent/danger
  green: designColors.success, // #00aa00 - success
  orange: designColors.warning, // #ff6600 - warning/offline

  // Legacy aliases for compatibility
  white: designColors.ground,
  ember: designColors.danger,
  pillDot: designColors.danger,
  okText: designColors.success,
  errText: designColors.danger,
  ok: designZoneBanners.guaranteed.border,
  amber: designZoneBanners.possible.border,
  amberText: designZoneBanners.possible.text,
  faint: designColors.inkMuted, // #666666 - the only allowed gray
} as const;

/**
 * Zone banner tone → {bg, border, text}.  brutalist: colored background,
 * hard colored border, colored bold text — the icon+label still carries the
 * meaning so it is never color-only (RBT-080).
 */
export const ZONE_STYLE: Readonly<
  Record<ZoneTone, { bg: string; border: string; text: string }>
> = {
  ok: {
    bg: designZoneBanners.guaranteed.bg,
    border: designZoneBanners.guaranteed.border,
    text: designZoneBanners.guaranteed.text,
  },
  warn: {
    bg: designZoneBanners.possible.bg,
    border: designZoneBanners.possible.border,
    text: designZoneBanners.possible.text,
  },
  error: {
    bg: designZoneBanners.notEnough.bg,
    border: designZoneBanners.notEnough.border,
    text: designZoneBanners.notEnough.text,
  },
};

export function headerInsetStyle(top: number): ViewStyle {
  return { paddingTop: top + 12 };
}

export function zoneBannerStyle(tone: ZoneTone): ViewStyle {
  const { bg, border } = ZONE_STYLE[tone];
  return { backgroundColor: bg, borderColor: border };
}

export function zoneTextStyle(tone: ZoneTone): TextStyle {
  return { color: ZONE_STYLE[tone].text };
}

// Ring dimensions (SVG-based, 220px as per prototype)
export const RING_SIZE = 200;
export const RING_RADIUS = 90;
export const RING_STROKE = 6;
export const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS; // ~628

const B = designBorders.thick; // 3px for waiting room
const MONO = designFonts.mono; // JetBrains Mono

export const styles = StyleSheet.create({
  // ═══════════════════════════════════════════════════════════════════════════
  // ROOT & SHELL
  // ═══════════════════════════════════════════════════════════════════════════
  root: {
    flex: 1,
    backgroundColor: palette.ground,
  },
  shell: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 32,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // HEADER (sticky top bar with logo)
  // ═══════════════════════════════════════════════════════════════════════════
  header: {
    width: "100%",
    borderBottomWidth: B,
    borderBottomColor: palette.ink,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: palette.ground,
    ...Platform.select({
      web: { position: "sticky" as unknown as undefined, top: 0, zIndex: 100 },
      default: {},
    }),
  },
  logo: {
    fontSize: 20,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: -1,
    color: palette.ink,
    fontFamily: MONO,
  },
  logoAccent: {
    color: palette.red,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // STATUS BADGE (top, with pulse animation)
  // ═══════════════════════════════════════════════════════════════════════════
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: B,
    borderColor: palette.ink,
    backgroundColor: palette.ink,
    marginBottom: 24,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2,
    color: palette.ground,
    fontFamily: MONO,
  },
  statusBadgeYourTurn: {
    backgroundColor: palette.red,
    borderColor: palette.red,
  },
  statusBadgeSoldOut: {
    backgroundColor: palette.gray,
    borderColor: palette.gray,
  },
  statusBadgeOffline: {
    backgroundColor: palette.orange,
    borderColor: palette.orange,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WAITING CONTAINER
  // ═══════════════════════════════════════════════════════════════════════════
  waitingContainer: {
    maxWidth: 600,
    width: "100%",
    alignItems: "center",
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // EVENT INFO
  // ═══════════════════════════════════════════════════════════════════════════
  eventInfo: {
    marginBottom: 32,
    alignItems: "center",
  },
  eventName: {
    fontSize: 24,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: -1,
    color: palette.ink,
    textAlign: "center",
    marginBottom: 8,
    fontFamily: MONO,
  },
  eventDate: {
    fontSize: 14,
    color: palette.gray,
    fontFamily: MONO,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // RING PROGRESS (SVG-based, 200px)
  // ═══════════════════════════════════════════════════════════════════════════
  ringWrap: {
    width: RING_SIZE,
    height: RING_SIZE,
    marginBottom: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  ringSvg: {
    transform: [{ rotate: "-90deg" }],
  },
  ringCenter: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  position: {
    fontSize: 56,
    fontWeight: "800",
    lineHeight: 56,
    color: palette.ink,
    fontFamily: MONO,
    fontVariant: ["tabular-nums"],
  },
  positionLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2,
    color: palette.gray,
    marginTop: 8,
    fontFamily: MONO,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ZONE BANNER
  // ═══════════════════════════════════════════════════════════════════════════
  zone: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: B,
    marginBottom: 24,
    width: "100%",
  },
  zoneIcon: {
    fontSize: 20,
    lineHeight: 24,
  },
  zoneTextWrap: {
    flex: 1,
  },
  zoneLabel: {
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
    fontFamily: MONO,
  },
  zoneBody: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    fontFamily: MONO,
  },
  // Legacy zone text (single line)
  zoneText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    fontFamily: MONO,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ESTIMATED TIME (minute/second blocks)
  // ═══════════════════════════════════════════════════════════════════════════
  estimatedTime: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 32,
    marginBottom: 32,
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderWidth: B,
    borderColor: palette.ink,
    backgroundColor: palette.field,
    width: "100%",
  },
  timeBlock: {
    alignItems: "center",
  },
  timeValue: {
    fontSize: 32,
    fontWeight: "800",
    color: palette.ink,
    fontFamily: MONO,
    fontVariant: ["tabular-nums"],
  },
  timeLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: palette.gray,
    marginTop: 4,
    fontFamily: MONO,
  },
  etaUnavailable: {
    color: palette.gray,
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 12,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // REDIRECT COUNTDOWN (pulsing red background)
  // ═══════════════════════════════════════════════════════════════════════════
  redirectCountdown: {
    paddingVertical: 24,
    paddingHorizontal: 32,
    borderWidth: B,
    borderColor: palette.red,
    backgroundColor: palette.red,
    marginBottom: 32,
    width: "100%",
    alignItems: "center",
  },
  redirectTitle: {
    fontSize: 20,
    fontWeight: "800",
    textTransform: "uppercase",
    color: palette.ground,
    marginBottom: 8,
    fontFamily: MONO,
  },
  redirectNumber: {
    fontSize: 48,
    fontWeight: "800",
    color: palette.ground,
    fontFamily: MONO,
    fontVariant: ["tabular-nums"],
  },
  redirectText: {
    fontSize: 12,
    color: palette.ground,
    opacity: 0.9,
    marginTop: 8,
    fontFamily: MONO,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WARNING BOXES
  // ═══════════════════════════════════════════════════════════════════════════
  warningBox: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: B,
    borderColor: palette.orange,
    backgroundColor: "#fff3e0",
    marginBottom: 32,
    width: "100%",
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    color: palette.orange,
    marginBottom: 8,
    fontFamily: MONO,
  },
  warningText: {
    fontSize: 12,
    color: palette.ink,
    lineHeight: 18,
    fontFamily: MONO,
  },

  // Turn expiry warning (red variant)
  turnExpiryBox: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: B,
    borderColor: palette.red,
    backgroundColor: "#ffe0e0",
    marginBottom: 32,
    width: "100%",
    alignItems: "center",
  },
  turnExpiryTitle: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    color: palette.red,
    marginBottom: 8,
    fontFamily: MONO,
  },
  turnExpiryTime: {
    fontSize: 24,
    fontWeight: "800",
    color: palette.red,
    fontFamily: MONO,
    fontVariant: ["tabular-nums"],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // INFO TEXT
  // ═══════════════════════════════════════════════════════════════════════════
  infoText: {
    fontSize: 12,
    color: palette.gray,
    maxWidth: 400,
    textAlign: "center",
    lineHeight: 19,
    marginBottom: 32,
    fontFamily: MONO,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEAVE BUTTON
  // ═══════════════════════════════════════════════════════════════════════════
  leaveBtn: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderWidth: B,
    borderColor: palette.ink,
    backgroundColor: palette.ground,
  },
  leaveBtnText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2,
    color: palette.ink,
    fontFamily: MONO,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // ERROR STATES (sold-out, sale-ended, session-expired, turn-expired)
  // ═══════════════════════════════════════════════════════════════════════════
  errorState: {
    alignItems: "center",
  },
  iconCentered: {
    alignItems: "center",
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 32,
    fontWeight: "800",
    textTransform: "uppercase",
    color: palette.ink,
    marginBottom: 16,
    textAlign: "center",
    fontFamily: MONO,
  },
  errorText: {
    fontSize: 14,
    color: palette.gray,
    marginBottom: 32,
    textAlign: "center",
    maxWidth: 400,
    fontFamily: MONO,
  },
  errorBtn: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderWidth: B,
    borderColor: palette.ink,
    backgroundColor: palette.ink,
  },
  errorBtnText: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: palette.ground,
    fontFamily: MONO,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // MODAL (leave confirmation)
  // ═══════════════════════════════════════════════════════════════════════════
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.8)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    zIndex: 1000,
  },
  modalOverlayNative: {
    justifyContent: "flex-end",
    paddingHorizontal: 0,
  },
  modal: {
    backgroundColor: palette.ground,
    borderWidth: B,
    borderColor: palette.ink,
    paddingVertical: 32,
    paddingHorizontal: 32,
    maxWidth: 400,
    width: "100%",
    alignItems: "center",
  },
  modalPanelNative: {
    maxWidth: "100%",
    borderBottomWidth: 0,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    textTransform: "uppercase",
    color: palette.ink,
    marginBottom: 16,
    textAlign: "center",
    fontFamily: MONO,
  },
  modalText: {
    fontSize: 14,
    color: palette.gray,
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 22,
    fontFamily: MONO,
  },
  modalActions: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
  modalBtnStay: {
    flex: 1,
    paddingVertical: 16,
    borderWidth: B,
    borderColor: palette.ink,
    backgroundColor: palette.ink,
    alignItems: "center",
  },
  modalBtnStayText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: palette.ground,
    fontFamily: MONO,
  },
  modalBtnLeave: {
    flex: 1,
    paddingVertical: 16,
    borderWidth: B,
    borderColor: palette.ink,
    backgroundColor: palette.ground,
    alignItems: "center",
  },
  modalBtnLeaveText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: palette.ink,
    fontFamily: MONO,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // NETWORK STATUS BAR (fixed bottom)
  // ═══════════════════════════════════════════════════════════════════════════
  networkStatus: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 16,
    backgroundColor: palette.orange,
    alignItems: "center",
    zIndex: 999,
  },
  networkStatusReconnected: {
    backgroundColor: palette.green,
  },
  networkStatusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: palette.ground,
    fontFamily: MONO,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LOADING OVERLAY
  // ═══════════════════════════════════════════════════════════════════════════
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: palette.ground,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3000,
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEGACY STYLES (for backwards compatibility)
  // ═══════════════════════════════════════════════════════════════════════════
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: B,
    borderColor: palette.ink,
    backgroundColor: palette.ink,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 32,
  },
  pillDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    backgroundColor: palette.red,
  },
  pillLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: palette.ground,
    fontFamily: MONO,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  card: {
    width: "100%",
    maxWidth: 600,
  },
  core: {
    alignItems: "center",
    width: "100%",
  },
  eyebrow: {
    display: "none", // Hidden in  prototype
  },

  // Legacy ring styles (View-based fallback)
  ringTrack: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_STROKE,
    borderColor: palette.ringBg,
  },
  ringProgress: {
    position: "absolute",
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: RING_STROKE,
    borderColor: palette.ink,
    borderLeftColor: "transparent",
    borderBottomColor: "transparent",
    transform: [{ rotate: "-45deg" }],
  },

  // Legacy text styles
  title: {
    fontSize: 32,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: -1,
    color: palette.ink,
    textAlign: "center",
    marginBottom: 16,
    fontFamily: MONO,
  },
  sub: {
    fontSize: 14,
    lineHeight: 22,
    color: palette.gray,
    maxWidth: 400,
    textAlign: "center",
    fontFamily: MONO,
  },

  // Legacy stats (now using estimatedTime blocks)
  stats: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 32,
    width: "100%",
  },
  stat: {
    flex: 1,
    alignItems: "center",
    borderWidth: B,
    borderColor: palette.ink,
    backgroundColor: palette.field,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "800",
    color: palette.ink,
    fontFamily: MONO,
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: palette.gray,
    marginTop: 4,
    fontFamily: MONO,
  },

  // Legacy admit styles
  admit: {
    marginTop: 16,
    width: "100%",
    alignItems: "center",
  },
  prep: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderWidth: B,
    borderColor: palette.green,
    backgroundColor: "#e8f5e9",
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "100%",
  },
  prepText: {
    fontSize: 14,
    fontWeight: "700",
    color: designZoneBanners.guaranteed.text,
    fontFamily: MONO,
  },
  admitTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: palette.ink,
    marginBottom: 16,
    textAlign: "center",
    fontFamily: MONO,
  },

  // Legacy error box
  errBox: {
    marginTop: 16,
    width: "100%",
    borderWidth: B,
    borderColor: palette.red,
    backgroundColor: "#ffebee",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  errTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: palette.red,
    textAlign: "center",
    marginBottom: 8,
    fontFamily: MONO,
  },
  errBody: {
    fontSize: 13,
    lineHeight: 20,
    color: palette.red,
    textAlign: "center",
    fontFamily: MONO,
  },

  // Legacy leave link
  leave: {
    marginTop: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderWidth: B,
    borderColor: palette.ink,
    backgroundColor: palette.ground,
  },
  leaveText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2,
    color: palette.ink,
    fontFamily: MONO,
  },
  footnote: {
    fontSize: 11,
    color: palette.gray,
    marginTop: 24,
    textAlign: "center",
    maxWidth: 440,
    fontFamily: MONO,
  },
});
