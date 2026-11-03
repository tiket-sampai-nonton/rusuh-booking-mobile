/**
 * EventDetail V2 Brutalist Mono styles
 *
 * MATCHES: `.oil-ui/v2/02-event-detail.html`
 *
 * V2 Design Rules:
 * - Background: WHITE (#ffffff) — not dark
 * - Colors: ONLY #000, #fff, #666, #f5f5f5, #ff0000, #00aa00
 * - Borders: 2px solid black (NO border-radius)
 * - Shadows: hard offset, NO blur (4px 4px 0 #000)
 * - Images: grayscale(100%) default, color on hover
 * - Fonts: Inter (weight 900 for titles, 700 for labels)
 */
import { Platform, StyleSheet } from "react-native";

import { interFonts } from "@presentation/theme/fonts";
import {
  v2Borders,
  v2Colors,
  v2FontSizes,
  v2SpacingSemantic,
} from "@presentation/theme/v2-tokens";

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

/** Header height for padding calculations */
export const HEADER_HEIGHT = 60;

/** Floating CTA height */
export const FLOATING_CTA_HEIGHT = 100;

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN STYLES
// ═══════════════════════════════════════════════════════════════════════════════

export const v2DetailStyles = StyleSheet.create({
  // ---------------------------------------------------------------------------
  // Root & Layout
  // ---------------------------------------------------------------------------
  root: {
    flex: 1,
    backgroundColor: v2Colors.ground, // WHITE background
  },

  // ---------------------------------------------------------------------------
  // Scroll Progress Bar (fixed top)
  // ---------------------------------------------------------------------------
  scrollProgress: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 3,
    backgroundColor: v2Colors.ink,
    zIndex: 1000,
  },

  // ---------------------------------------------------------------------------
  // Header (fixed top bar)
  // ---------------------------------------------------------------------------
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: v2SpacingSemantic.s, // 16px
    paddingHorizontal: v2SpacingSemantic.m, // 24px
    backgroundColor: v2Colors.ground,
    borderBottomWidth: v2Borders.standard,
    borderBottomColor: v2Colors.ink,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: v2SpacingSemantic.m,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: v2SpacingSemantic.xs,
    paddingVertical: v2SpacingSemantic.xs,
    paddingHorizontal: v2SpacingSemantic.s,
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ink,
  },
  backBtnText: {
    fontFamily: interFonts.semiBold,
    fontSize: v2FontSizes.s,
    color: v2Colors.ink,
    textTransform: "uppercase",
    letterSpacing: v2FontSizes.s * 0.04,
  },
  logo: {
    fontFamily: interFonts.black,
    fontSize: 18,
    color: v2Colors.ink,
    textTransform: "uppercase",
    letterSpacing: 0.02 * 18,
  },
  headerActions: {
    flexDirection: "row",
    gap: v2SpacingSemantic.xs,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },

  // ---------------------------------------------------------------------------
  // Flow Steps Indicator
  // ---------------------------------------------------------------------------
  stepsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: v2SpacingSemantic.xs,
    paddingVertical: v2SpacingSemantic.m,
    paddingHorizontal: v2SpacingSemantic.m,
    paddingTop: HEADER_HEIGHT + v2SpacingSemantic.m,
    backgroundColor: v2Colors.ground,
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: v2SpacingSemantic.xs,
  },
  stepNum: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderRadius: 12, // Exception: step numbers are circular
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumActive: {
    backgroundColor: v2Colors.ink,
    borderColor: v2Colors.ink,
  },
  stepNumInactive: {
    backgroundColor: "transparent",
    borderColor: v2Colors.inkMuted,
  },
  stepNumText: {
    fontFamily: interFonts.bold,
    fontSize: 10,
  },
  stepNumTextActive: {
    color: v2Colors.ground,
  },
  stepNumTextInactive: {
    color: v2Colors.inkMuted,
  },
  stepLabel: {
    fontFamily: interFonts.bold,
    fontSize: v2FontSizes.xs,
    textTransform: "uppercase",
    letterSpacing: v2FontSizes.xs * 0.08,
  },
  stepLabelActive: {
    color: v2Colors.ink,
  },
  stepLabelInactive: {
    color: v2Colors.inkMuted,
  },
  stepConnector: {
    width: 30,
    height: 2,
    backgroundColor: v2Colors.inkMuted,
    opacity: 0.3,
    marginLeft: v2SpacingSemantic.xs,
  },

  // ---------------------------------------------------------------------------
  // Hero Section (monochrome concert banner)
  // ---------------------------------------------------------------------------
  hero: {
    position: "relative",
    height: 400, // 60vh equivalent
    minHeight: 350,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  heroBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Grayscale applied via Image style or platform-specific filter
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // Gradient from white at bottom to transparent at top
  },
  // Scan line effect (web only)
  heroScanlines: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    ...(Platform.OS === "web" && {
      backgroundImage: `repeating-linear-gradient(
        to bottom,
        transparent 0px,
        transparent 2px,
        rgba(0,0,0,0.03) 2px,
        rgba(0,0,0,0.03) 4px
      )`,
    }),
  },
  heroContent: {
    position: "relative",
    zIndex: 10,
    padding: v2SpacingSemantic.xl, // 80px
    paddingHorizontal: v2SpacingSemantic.m, // 24px
    maxWidth: 1200,
    width: "100%",
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: v2SpacingSemantic.xs,
    paddingVertical: v2SpacingSemantic.xs,
    paddingHorizontal: v2SpacingSemantic.s,
    backgroundColor: v2Colors.ink,
    marginBottom: v2SpacingSemantic.m,
  },
  heroBadgeText: {
    fontFamily: interFonts.bold,
    fontSize: v2FontSizes.xs,
    color: v2Colors.ground,
    textTransform: "uppercase",
    letterSpacing: v2FontSizes.xs * 0.08,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444", // Live red dot
  },
  heroTitle: {
    fontFamily: interFonts.black,
    fontSize: 48, // Will be clamped responsively
    lineHeight: 48 * 0.9,
    color: v2Colors.ink,
    textTransform: "uppercase",
    letterSpacing: -0.03 * 48,
    marginBottom: v2SpacingSemantic.s,
  },
  heroSubtitle: {
    fontFamily: interFonts.medium,
    fontSize: v2FontSizes.l,
    color: v2Colors.inkMuted,
    marginBottom: v2SpacingSemantic.m,
  },
  heroMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: v2SpacingSemantic.m,
  },
  heroMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: v2SpacingSemantic.xs,
  },
  heroMetaText: {
    fontFamily: interFonts.semiBold,
    fontSize: v2FontSizes.m,
    color: v2Colors.ink,
  },

  // ---------------------------------------------------------------------------
  // Content Layout (single column, max 900px)
  // ---------------------------------------------------------------------------
  content: {
    maxWidth: 900,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: v2SpacingSemantic.m,
    paddingTop: v2SpacingSemantic.l,
    paddingBottom: v2SpacingSemantic.xl + FLOATING_CTA_HEIGHT,
  },

  // ---------------------------------------------------------------------------
  // Section Block
  // ---------------------------------------------------------------------------
  section: {
    marginBottom: v2SpacingSemantic.l, // 48px
    // Animation: starts hidden, revealed on scroll
    opacity: 1, // Controlled by Animated.View
  },
  sectionTitle: {
    fontFamily: interFonts.black,
    fontSize: v2FontSizes.xl, // 20px
    color: v2Colors.ink,
    textTransform: "uppercase",
    letterSpacing: v2FontSizes.xl * 0.02,
    paddingBottom: v2SpacingSemantic.s,
    borderBottomWidth: v2Borders.standard,
    borderBottomColor: v2Colors.ink,
    marginBottom: v2SpacingSemantic.m,
  },

  // ---------------------------------------------------------------------------
  // Description Text
  // ---------------------------------------------------------------------------
  description: {
    fontFamily: interFonts.regular,
    fontSize: v2FontSizes.m,
    lineHeight: v2FontSizes.m * 1.8,
    color: v2Colors.inkMuted,
  },
  descriptionParagraph: {
    marginBottom: v2SpacingSemantic.m,
  },

  // ---------------------------------------------------------------------------
  // Ticket Categories Preview
  // ---------------------------------------------------------------------------
  categoriesGrid: {
    gap: v2SpacingSemantic.s,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: v2SpacingSemantic.m,
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ink,
  },
  categoryItemHover: {
    backgroundColor: v2Colors.field,
    transform: [{ translateX: 4 }],
  },
  categoryInfo: {},
  categoryName: {
    fontFamily: interFonts.bold,
    fontSize: v2FontSizes.m,
    color: v2Colors.ink,
    textTransform: "uppercase",
  },
  categoryDesc: {
    fontFamily: interFonts.regular,
    fontSize: v2FontSizes.s,
    color: v2Colors.inkMuted,
    marginTop: 2,
  },
  categoryPrice: {
    alignItems: "flex-end",
  },
  categoryPriceValue: {
    fontFamily: interFonts.black,
    fontSize: v2FontSizes.l,
    color: v2Colors.ink,
  },
  categoryAvail: {
    fontFamily: interFonts.semiBold,
    fontSize: v2FontSizes.xs,
    color: "#16a34a", // Success green
  },
  categoryAvailOut: {
    fontFamily: interFonts.semiBold,
    fontSize: v2FontSizes.xs,
    color: v2Colors.inkMuted,
  },
  categorySoldOut: {
    opacity: 0.5,
  },
  categoriesNote: {
    marginTop: v2SpacingSemantic.s,
    padding: v2SpacingSemantic.s,
    backgroundColor: v2Colors.field,
    borderLeftWidth: 4,
    borderLeftColor: v2Colors.ink,
  },
  categoriesNoteText: {
    fontFamily: interFonts.regular,
    fontSize: v2FontSizes.s,
    color: v2Colors.inkMuted,
  },

  // ---------------------------------------------------------------------------
  // Lineup Grid
  // ---------------------------------------------------------------------------
  lineupGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: v2SpacingSemantic.s,
  },
  lineupItem: {
    width: 150, // Will be responsive
    alignItems: "center",
    padding: v2SpacingSemantic.m,
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ink,
  },
  lineupItemHover: {
    backgroundColor: v2Colors.ink,
  },
  lineupAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40, // Exception: avatars are circular
    marginBottom: v2SpacingSemantic.s,
    // Grayscale by default
  },
  lineupAvatarHover: {
    // Remove grayscale on hover
  },
  lineupName: {
    fontFamily: interFonts.bold,
    fontSize: v2FontSizes.s,
    color: v2Colors.ink,
    textTransform: "uppercase",
    textAlign: "center",
  },
  lineupNameHover: {
    color: v2Colors.ground,
  },
  lineupRole: {
    fontFamily: interFonts.regular,
    fontSize: v2FontSizes.xs,
    color: v2Colors.inkMuted,
    textAlign: "center",
  },
  lineupRoleHover: {
    color: v2Colors.ground,
    opacity: 0.7,
  },

  // ---------------------------------------------------------------------------
  // Venue Map
  // ---------------------------------------------------------------------------
  venueMap: {
    position: "relative",
    aspectRatio: 16 / 9,
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ink,
    overflow: "hidden",
  },
  venueMapImage: {
    width: "100%",
    height: "100%",
    // Grayscale by default
  },
  venueMapOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    justifyContent: "center",
    opacity: 0, // Show on hover
  },
  venueMapBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: v2SpacingSemantic.xs,
    paddingVertical: v2SpacingSemantic.s,
    paddingHorizontal: v2SpacingSemantic.m,
    backgroundColor: v2Colors.ground,
  },
  venueMapBtnText: {
    fontFamily: interFonts.bold,
    fontSize: v2FontSizes.s,
    color: v2Colors.ink,
    textTransform: "uppercase",
    letterSpacing: v2FontSizes.s * 0.04,
  },
  venueInfo: {
    marginTop: v2SpacingSemantic.m,
  },
  venueName: {
    fontFamily: interFonts.bold,
    fontSize: v2FontSizes.l,
    color: v2Colors.ink,
    marginBottom: v2SpacingSemantic.xs,
  },
  venueAddress: {
    fontFamily: interFonts.regular,
    fontSize: v2FontSizes.s,
    color: v2Colors.inkMuted,
  },

  // ---------------------------------------------------------------------------
  // Gallery Grid
  // ---------------------------------------------------------------------------
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: v2Colors.ink,
    gap: 2,
  },
  galleryItem: {
    width: "24%", // 4 columns with 2px gap
    aspectRatio: 1,
    overflow: "hidden",
  },
  galleryImage: {
    width: "100%",
    height: "100%",
    // Grayscale by default
  },
  galleryImageHover: {
    // Remove grayscale + scale(1.1)
  },
  galleryPlus: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    opacity: 0, // Show on hover
  },
  galleryPlusText: {
    fontFamily: interFonts.black,
    fontSize: 32,
    color: v2Colors.ground,
  },

  // ---------------------------------------------------------------------------
  // Terms List
  // ---------------------------------------------------------------------------
  termsList: {
    gap: 0,
  },
  termsItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: v2SpacingSemantic.s,
    paddingVertical: v2SpacingSemantic.s,
    borderBottomWidth: 1,
    borderBottomColor: v2Colors.field,
  },
  termsCheck: {
    fontFamily: interFonts.black,
    fontSize: v2FontSizes.s,
    color: "#16a34a", // Success green
  },
  termsText: {
    flex: 1,
    fontFamily: interFonts.regular,
    fontSize: v2FontSizes.s,
    color: v2Colors.ink,
  },

  // ---------------------------------------------------------------------------
  // Floating CTA (fixed bottom bar)
  // ---------------------------------------------------------------------------
  floatingCta: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: v2SpacingSemantic.m,
    paddingHorizontal: v2SpacingSemantic.m,
    backgroundColor: v2Colors.ground,
    borderTopWidth: v2Borders.standard,
    borderTopColor: v2Colors.ink,
    zIndex: 99,
  },
  floatingCtaInner: {
    maxWidth: 900,
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: v2SpacingSemantic.m,
  },
  floatingCtaInfo: {
    flex: 1,
  },
  floatingCtaPriceLabel: {
    fontFamily: interFonts.regular,
    fontSize: v2FontSizes.xs,
    color: v2Colors.inkMuted,
    textTransform: "uppercase",
    letterSpacing: v2FontSizes.xs * 0.04,
  },
  floatingCtaPrice: {
    fontFamily: interFonts.black,
    fontSize: v2FontSizes.xl,
    color: v2Colors.ink,
  },
  floatingCtaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: v2SpacingSemantic.xs,
    paddingVertical: v2SpacingSemantic.m,
    paddingHorizontal: v2SpacingSemantic.l,
    backgroundColor: v2Colors.ink,
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ink,
    // Pulse glow animation applied separately
  },
  floatingCtaBtnDisabled: {
    opacity: 0.45,
  },
  floatingCtaBtnText: {
    fontFamily: interFonts.bold,
    fontSize: v2FontSizes.m,
    color: v2Colors.ground,
    textTransform: "uppercase",
    letterSpacing: v2FontSizes.m * 0.04,
  },
  floatingCtaArrow: {
    fontFamily: interFonts.bold,
    fontSize: v2FontSizes.m,
    color: v2Colors.ground,
  },

  // ---------------------------------------------------------------------------
  // Trust Badges
  // ---------------------------------------------------------------------------
  trustBadges: {
    flexDirection: "row",
    gap: v2SpacingSemantic.s,
    marginTop: v2SpacingSemantic.s,
  },
  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trustBadgeText: {
    fontFamily: interFonts.regular,
    fontSize: v2FontSizes.xs,
    color: v2Colors.inkMuted,
  },
  trustBadgeCheck: {
    fontFamily: interFonts.bold,
    fontSize: 12,
    color: "#16a34a",
  },

  // ---------------------------------------------------------------------------
  // Lightbox Modal
  // ---------------------------------------------------------------------------
  lightbox: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.95)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  lightboxClose: {
    position: "absolute",
    top: v2SpacingSemantic.m,
    right: v2SpacingSemantic.m,
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: v2Colors.ground,
    alignItems: "center",
    justifyContent: "center",
  },
  lightboxCloseText: {
    fontFamily: interFonts.bold,
    fontSize: v2FontSizes.l,
    color: v2Colors.ground,
  },
  lightboxNav: {
    position: "absolute",
    top: "50%",
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: v2Colors.ground,
    alignItems: "center",
    justifyContent: "center",
  },
  lightboxNavText: {
    fontFamily: interFonts.bold,
    fontSize: v2FontSizes.l,
    color: v2Colors.ground,
  },
  lightboxContent: {
    maxWidth: "90%",
    maxHeight: "90%",
  },
  lightboxImage: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
  },

  // ---------------------------------------------------------------------------
  // Loading & Error States
  // ---------------------------------------------------------------------------
  loader: {
    flex: 1,
    backgroundColor: v2Colors.ink,
    alignItems: "center",
    justifyContent: "center",
  },
  loaderBar: {
    width: 200,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
    overflow: "hidden",
  },
  loaderProgress: {
    height: "100%",
    backgroundColor: v2Colors.ground,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: v2Colors.ground,
    alignItems: "center",
    justifyContent: "center",
    padding: v2SpacingSemantic.l,
  },
  errorText: {
    fontFamily: interFonts.bold,
    fontSize: v2FontSizes.l,
    color: v2Colors.ink,
    textAlign: "center",
    marginBottom: v2SpacingSemantic.m,
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// SCROLL CONTENT HELPER
// ═══════════════════════════════════════════════════════════════════════════════

export const v2DetailScrollContent = (isDesktop: boolean): object => ({
  paddingBottom: FLOATING_CTA_HEIGHT + v2SpacingSemantic.l,
});

// ═══════════════════════════════════════════════════════════════════════════════
// LEGACY EXPORTS (for gradual migration)
// ═══════════════════════════════════════════════════════════════════════════════

/** @deprecated Use v2DetailStyles instead */
export const detailStyles = v2DetailStyles;

/** @deprecated Use v2DetailScrollContent instead */
export const detailScrollContent = v2DetailScrollContent;

/** @deprecated Use v2DetailStyles.floatingCtaBtn instead */
export const detailCta = (disabled: boolean) => [
  v2DetailStyles.floatingCtaBtn,
  disabled && v2DetailStyles.floatingCtaBtnDisabled,
];
