/**
 * RBT-091 — Waiting-room styles, using the shared pink and semantic status tokens.
 *
 * Follows the waiting-room layout from prototype `06-waiting.html`:
 * - Plus Jakarta Sans throughout
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
import {
  Platform,
  StyleSheet,
  type TextStyle,
  type ViewStyle,
} from "react-native";

import {
  designBorders,
  designColors,
  designZoneBanners,
} from "@presentation/theme/event-design-tokens";
import { plusJakartaSansFontForWeight } from "@presentation/theme/fonts";
import { withAlpha } from "@presentation/theme";

import type { ZoneTone } from "./display";

/**
 * Waiting-room color aliases read from the shared theme tokens.
 */
export const palette = {
  // Core
  ground: designColors.ground,
  ink: designColors.ink,
  gray: designColors.inkMuted,
  muted: designColors.inkMuted,
  field: designColors.field,
  ringBg: designColors.field,

  // Functional
  red: designColors.danger,
  green: designColors.success,
  orange: designColors.warning,

  // Legacy aliases for compatibility
  white: designColors.ground,
  ember: designColors.danger,
  pillDot: designColors.danger,
  okText: designColors.success,
  errText: designColors.danger,
  ok: designZoneBanners.guaranteed.border,
  amber: designZoneBanners.possible.border,
  amberText: designZoneBanners.possible.text,
  faint: designColors.inkMuted,
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
  mobileWebShell: {
    justifyContent: "flex-start",
    paddingTop: 18,
    paddingBottom: 20,
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
    fontFamily: plusJakartaSansFontForWeight("700"),
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
    fontFamily: plusJakartaSansFontForWeight("800"),
  },
  eventDate: {
    fontSize: 14,
    color: palette.gray,
    fontFamily: plusJakartaSansFontForWeight("400"),
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
    fontFamily: plusJakartaSansFontForWeight("800"),
    fontVariant: ["tabular-nums"],
  },
  positionLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2,
    color: palette.gray,
    marginTop: 8,
    fontFamily: plusJakartaSansFontForWeight("700"),
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
    fontFamily: plusJakartaSansFontForWeight("800"),
  },
  zoneBody: {
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    fontFamily: plusJakartaSansFontForWeight("600"),
  },
  // Legacy zone text (single line)
  zoneText: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
    fontFamily: plusJakartaSansFontForWeight("600"),
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
    fontFamily: plusJakartaSansFontForWeight("800"),
    fontVariant: ["tabular-nums"],
  },
  timeLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: palette.gray,
    marginTop: 4,
    fontFamily: plusJakartaSansFontForWeight("700"),
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
    fontFamily: plusJakartaSansFontForWeight("800"),
  },
  redirectNumber: {
    fontSize: 48,
    fontWeight: "800",
    color: palette.ground,
    fontFamily: plusJakartaSansFontForWeight("800"),
    fontVariant: ["tabular-nums"],
  },
  redirectText: {
    fontSize: 12,
    color: palette.ground,
    opacity: 0.9,
    marginTop: 8,
    fontFamily: plusJakartaSansFontForWeight("400"),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // WARNING BOXES
  // ═══════════════════════════════════════════════════════════════════════════
  warningBox: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: B,
    borderColor: palette.orange,
    backgroundColor: designZoneBanners.possible.bg,
    marginBottom: 32,
    width: "100%",
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    color: palette.orange,
    marginBottom: 8,
    fontFamily: plusJakartaSansFontForWeight("700"),
  },
  warningText: {
    fontSize: 12,
    color: palette.ink,
    lineHeight: 18,
    fontFamily: plusJakartaSansFontForWeight("400"),
  },

  // Turn expiry warning (red variant)
  turnExpiryBox: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: B,
    borderColor: palette.red,
    backgroundColor: designZoneBanners.notEnough.bg,
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
    fontFamily: plusJakartaSansFontForWeight("700"),
  },
  turnExpiryTime: {
    fontSize: 24,
    fontWeight: "800",
    color: palette.red,
    fontFamily: plusJakartaSansFontForWeight("800"),
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
    fontFamily: plusJakartaSansFontForWeight("400"),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // LEAVE BUTTON
  // ═══════════════════════════════════════════════════════════════════════════
  leaveBtn: {
    minHeight: 44,
    alignSelf: "flex-start",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: B,
    borderColor: palette.ink,
    backgroundColor: palette.ground,
  },
  leaveBtnText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    color: palette.ink,
    fontFamily: plusJakartaSansFontForWeight("700"),
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
    fontFamily: plusJakartaSansFontForWeight("800"),
  },
  errorText: {
    fontSize: 14,
    color: palette.gray,
    marginBottom: 32,
    textAlign: "center",
    maxWidth: 400,
    fontFamily: plusJakartaSansFontForWeight("400"),
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
    fontFamily: plusJakartaSansFontForWeight("700"),
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
    backgroundColor: withAlpha(designColors.overlay, 0.8),
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
    fontFamily: plusJakartaSansFontForWeight("800"),
  },
  modalText: {
    fontSize: 14,
    color: palette.gray,
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 22,
    fontFamily: plusJakartaSansFontForWeight("400"),
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
    fontFamily: plusJakartaSansFontForWeight("700"),
  },
  modalBtnLeave: {
    flex: 1,
    paddingVertical: 16,
    borderWidth: B,
    borderColor: palette.red,
    backgroundColor: palette.red,
    alignItems: "center",
  },
  modalBtnLeaveText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: palette.ground,
    fontFamily: plusJakartaSansFontForWeight("700"),
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
    fontFamily: plusJakartaSansFontForWeight("700"),
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
    fontFamily: plusJakartaSansFontForWeight("700"),
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
    fontFamily: plusJakartaSansFontForWeight("800"),
  },
  sub: {
    fontSize: 14,
    lineHeight: 22,
    color: palette.gray,
    maxWidth: 400,
    textAlign: "center",
    fontFamily: plusJakartaSansFontForWeight("400"),
  },

  // Legacy stats (now using estimatedTime blocks)
  legacyStats: {
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
    fontFamily: plusJakartaSansFontForWeight("800"),
    fontVariant: ["tabular-nums"],
  },
  statLabel: {
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
    color: palette.gray,
    marginTop: 4,
    fontFamily: plusJakartaSansFontForWeight("400"),
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
    backgroundColor: designZoneBanners.guaranteed.bg,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "100%",
  },
  prepText: {
    fontSize: 14,
    fontWeight: "700",
    color: designZoneBanners.guaranteed.text,
    fontFamily: plusJakartaSansFontForWeight("700"),
  },
  admitTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: palette.ink,
    marginBottom: 16,
    textAlign: "center",
    fontFamily: plusJakartaSansFontForWeight("800"),
  },

  // Legacy error box
  errBox: {
    marginTop: 16,
    width: "100%",
    borderWidth: B,
    borderColor: palette.red,
    backgroundColor: designZoneBanners.notEnough.bg,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  errTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: palette.red,
    textAlign: "center",
    marginBottom: 8,
    fontFamily: plusJakartaSansFontForWeight("800"),
  },
  errBody: {
    fontSize: 13,
    lineHeight: 20,
    color: palette.red,
    textAlign: "center",
    fontFamily: plusJakartaSansFontForWeight("400"),
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
    fontFamily: plusJakartaSansFontForWeight("700"),
  },
  footnote: {
    fontSize: 11,
    color: palette.gray,
    marginTop: 24,
    textAlign: "center",
    maxWidth: 440,
    fontFamily: plusJakartaSansFontForWeight("400"),
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // BUKU ANTREAN — selected RBT-120 layout
  // ═══════════════════════════════════════════════════════════════════════════
  headerDesktop: {
    marginTop: 30,
    paddingHorizontal: 56,
    minHeight: 56,
    paddingTop: 0,
    paddingBottom: 13,
  },
  headerWeb: {
    marginTop: 20,
    minHeight: 42,
    paddingTop: 0,
    paddingBottom: 10,
  },
  headerMeta: {
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: palette.ink,
    fontFamily: plusJakartaSansFontForWeight("700"),
  },
  headerMetaDesktop: {
    fontSize: 11,
  },
  waitingScroll: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  mobileWebWaitingScroll: {
    flexGrow: 0,
    alignItems: "flex-start",
    paddingHorizontal: 16,
  },
  waitingScrollView: {
    flex: 1,
  },
  waitingScrollDesktop: {
    paddingHorizontal: 56,
  },
  waitingPage: {
    flexGrow: 1,
    width: "100%",
    maxWidth: 1240,
    paddingTop: 20,
    paddingBottom: 22,
  },
  waitingPageDesktop: {
    paddingTop: 55,
    paddingBottom: 34,
  },
  mobileWebWaitingPage: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingTop: 16,
    paddingBottom: 12,
  },
  eventBlock: {
    gap: 5,
  },
  eventBlockDesktop: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 32,
    paddingBottom: 20,
    borderBottomWidth: B,
    borderBottomColor: palette.ink,
  },
  eventCopy: {
    flexShrink: 1,
  },
  eventEyebrow: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: palette.ink,
    fontFamily: plusJakartaSansFontForWeight("700"),
  },
  eventTitle: {
    marginTop: 5,
    fontSize: 20,
    lineHeight: 24,
    fontWeight: "800",
    letterSpacing: -1.4,
    textTransform: "uppercase",
    color: palette.ink,
    fontFamily: plusJakartaSansFontForWeight("800"),
  },
  eventTitleDesktop: {
    marginTop: 13,
    fontSize: 38,
    lineHeight: 44,
    letterSpacing: -3,
  },
  eventDetails: {
    fontSize: 11,
    lineHeight: 16,
    color: palette.gray,
    fontFamily: plusJakartaSansFontForWeight("400"),
  },
  eventDetailsDesktop: {
    maxWidth: 280,
    textAlign: "right",
    fontSize: 12,
    lineHeight: 19,
  },
  dashboard: {
    gap: 18,
    marginTop: 20,
  },
  dashboardDesktop: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: 30,
    marginTop: 30,
  },
  positionPanelFrame: {
    position: "relative",
    alignSelf: "stretch",
    width: "100%",
    minHeight: 158,
  },
  positionPanelFrameDesktop: {
    flex: 1.55,
    minHeight: 430,
  },
  positionPanelShadow: {
    position: "absolute",
    top: 5,
    left: 5,
    right: -5,
    bottom: -5,
    backgroundColor: palette.ink,
  },
  positionPanelShadowDesktop: {
    top: 8,
    left: 8,
    right: -8,
    bottom: -8,
  },
  positionPanel: {
    alignSelf: "stretch",
    flex: 1,
    width: "100%",
    minHeight: 158,
    padding: 14,
    borderWidth: B,
    borderColor: palette.ink,
    backgroundColor: palette.ground,
  },
  positionPanelDesktop: {
    flex: 1,
    minHeight: 430,
    paddingHorizontal: 24,
    paddingVertical: 22,
  },
  positionHead: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  positionHeadLabel: {
    fontSize: 10,
    lineHeight: 13,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: palette.ink,
    fontFamily: plusJakartaSansFontForWeight("800"),
  },
  positionHeadLabelDesktop: {
    fontSize: 11,
  },
  positionNumberMobile: {
    marginTop: 4,
    fontSize: 68,
    lineHeight: 68,
    fontWeight: "800",
    letterSpacing: -8,
    color: palette.red,
    fontFamily: plusJakartaSansFontForWeight("800"),
    fontVariant: ["tabular-nums"],
  },
  positionNumberMobileLong: {
    fontSize: 54,
    lineHeight: 58,
    letterSpacing: -6,
  },
  positionNumberDesktop: {
    flexGrow: 1,
    marginTop: 75,
    marginBottom: 28,
    fontSize: 196,
    lineHeight: 194,
    fontWeight: "800",
    letterSpacing: -24,
    color: palette.red,
    fontFamily: plusJakartaSansFontForWeight("800"),
    fontVariant: ["tabular-nums"],
  },
  positionNumberDesktopLong: {
    fontSize: 150,
    lineHeight: 156,
    letterSpacing: -18,
  },
  numberRule: {
    marginTop: 10,
    marginBottom: 9,
    borderTopWidth: B,
    borderTopColor: palette.ink,
  },
  positionFoot: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  positionFootText: {
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
    color: palette.ink,
    fontFamily: plusJakartaSansFontForWeight("800"),
  },
  positionFootTextDesktop: {
    fontSize: 11,
  },
  summary: {
    alignSelf: "stretch",
  },
  summaryDesktop: {
    flex: 0.75,
    borderTopWidth: B,
    borderTopColor: palette.ink,
  },
  summaryHeading: {
    paddingVertical: 13,
    borderBottomWidth: 2,
    borderBottomColor: palette.ink,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "800",
    letterSpacing: 1.2,
    textTransform: "uppercase",
    color: palette.ink,
    fontFamily: plusJakartaSansFontForWeight("800"),
  },
  summaryHeadingDesktop: {
    fontSize: 11,
  },
  ledgerStats: {
    flexDirection: "row",
    borderWidth: 2,
    borderColor: palette.ink,
  },
  ledgerStatsDesktop: {
    flexDirection: "column",
    borderWidth: 0,
  },
  ledgerStat: {
    flex: 1,
    minHeight: 76,
    justifyContent: "space-between",
    gap: 8,
    padding: 11,
  },
  ledgerStatDesktop: {
    minHeight: 105,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 0,
    paddingVertical: 16,
    borderBottomWidth: 2,
    borderBottomColor: palette.ink,
  },
  ledgerStatSecond: {
    borderLeftWidth: 2,
    borderLeftColor: palette.ink,
  },
  ledgerStatSecondDesktop: {
    borderLeftWidth: 0,
  },
  ledgerStatLabel: {
    maxWidth: 120,
    fontSize: 9,
    lineHeight: 13,
    fontWeight: "700",
    letterSpacing: 0.9,
    textTransform: "uppercase",
    color: palette.ink,
    fontFamily: plusJakartaSansFontForWeight("700"),
  },
  ledgerStatLabelDesktop: {
    fontSize: 11,
  },
  ledgerStatValue: {
    fontSize: 19,
    lineHeight: 22,
    fontWeight: "800",
    color: palette.ink,
    fontFamily: plusJakartaSansFontForWeight("800"),
    fontVariant: ["tabular-nums"],
  },
  ledgerStatValueDesktop: {
    maxWidth: "65%",
    fontSize: 32,
    lineHeight: 36,
    letterSpacing: -2,
    textAlign: "right",
  },
  zoneLedger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    width: "100%",
    minHeight: 58,
    paddingVertical: 10,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: palette.ink,
  },
  zoneLedgerDesktop: {
    flex: 1,
    minHeight: 112,
    paddingVertical: 18,
    gap: 13,
    borderTopWidth: 0,
  },
  zoneMarker: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  zoneMarkerDesktop: {
    width: 34,
    height: 34,
  },
  zoneTitleLedger: {
    fontSize: 12,
    lineHeight: 14,
    fontWeight: "800",
    textTransform: "uppercase",
    color: palette.ink,
    fontFamily: plusJakartaSansFontForWeight("800"),
  },
  zoneTitleLedgerDesktop: {
    fontSize: 14,
    lineHeight: 18,
  },
  zoneBodyLedger: {
    marginTop: 2,
    fontSize: 10,
    lineHeight: 14,
    color: palette.gray,
    fontFamily: plusJakartaSansFontForWeight("400"),
  },
  zoneBodyLedgerDesktop: {
    fontSize: 12,
    lineHeight: 17,
    maxWidth: 280,
  },
  waitingSpacer: {
    flexGrow: 1,
    minHeight: 18,
  },
  mobileWebWaitingSpacer: { flexGrow: 0, minHeight: 16 },
  waitingFooter: {
    gap: 20,
  },
  mobileWebWaitingFooter: { gap: 12 },
  waitingFooterDesktop: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 24,
  },
  waitingFootnote: {
    maxWidth: 440,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: palette.ink,
    fontSize: 11,
    lineHeight: 15,
    color: palette.gray,
    fontFamily: plusJakartaSansFontForWeight("400"),
  },
  waitingFootnoteDesktop: {
    maxWidth: 420,
    fontSize: 12,
    lineHeight: 16,
  },
  leaveBtnDesktop: {
    minHeight: 48,
    paddingHorizontal: 18,
  },
  leaveBtnTextDesktop: {
    fontSize: 11,
  },
  yourTurnPanel: {
    width: "100%",
    padding: 18,
    borderWidth: B,
    borderColor: palette.ink,
    backgroundColor: palette.ground,
    gap: 12,
  },
  yourTurnPanelDesktop: {
    flex: 0.75,
    alignSelf: "stretch",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  yourTurnTitle: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "800",
    textTransform: "uppercase",
    color: palette.ink,
    fontFamily: plusJakartaSansFontForWeight("800"),
  },
  yourTurnText: {
    fontSize: 11,
    lineHeight: 16,
    color: palette.gray,
    fontFamily: plusJakartaSansFontForWeight("400"),
  },
});
