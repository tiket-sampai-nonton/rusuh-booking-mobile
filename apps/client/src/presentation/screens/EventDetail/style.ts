/**
 * EventDetail V2 Brutalist Mono styles
 *
 * MATCHES: `.genesis/prototype/v2-mobile/02-event-detail.html` (native)
 * MATCHES: `.oil-ui/v2/02-event-detail.html` (web)
 *
 * V2 Design Rules:
 * - Background: WHITE (#ffffff) — not dark
 * - Colors: ONLY #000, #fff, #666, #f5f5f5, #ff0000, #00aa00
 * - Borders: 2px solid black (NO border-radius)
 * - Shadows: hard offset, NO blur (4px 4px 0 #000)
 * - Images: grayscale(100%) default, color on hover
 * - Fonts: Inter (weight 900 for titles, 700 for labels)
 *
 * Mobile-specific (native only):
 * - Header: transparent → solid on scroll
 * - Hero: 50vh height, parallax scroll
 * - Info card below hero with date/location
 * - Categories: staggered slide-in animation
 * - Lineup: horizontal scroll (not grid)
 * - Floating CTA: native shadow + pulse animation
 */
import { Dimensions, Platform, StyleSheet } from "react-native";

import { interFonts } from "@presentation/theme/fonts";
import {
  v2Borders,
  v2Colors,
  v2FontSizes,
  v2Layout,
  v2Shadows,
  v2SpacingSemantic,
} from "@presentation/theme/v2-tokens";

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

/** Screen dimensions for viewport-based calculations */
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

/** Hero height: 50vh on native (matches prototype), 400px on web */
export const HERO_HEIGHT = Platform.OS === "web" ? 400 : Math.max(SCREEN_HEIGHT * 0.5, 300);

/** Header height for padding calculations */
export const HEADER_HEIGHT = Platform.OS === "web" ? 60 : v2Layout.headerHeightMobile;

/** Floating CTA height */
export const FLOATING_CTA_HEIGHT = 100;

/** Safe area bottom padding for native */
export const SAFE_AREA_BOTTOM = Platform.OS === "web" ? 0 : 34;

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
  // Mobile: transparent by default, solid on scroll (controlled by component)
  // Web: always solid with bottom border
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
    // Web: solid background, Native: controlled by headerScrolled
    backgroundColor: Platform.OS === "web" ? v2Colors.ground : "transparent",
    borderBottomWidth: Platform.OS === "web" ? v2Borders.standard : 0,
    borderBottomColor: v2Colors.ink,
  },
  // Native only: scrolled header state (applied via Animated)
  headerScrolled: {
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
    // Native: square 44x44 icon-only button
    // Web: wider button with "← Kembali" text
    width: Platform.OS === "web" ? "auto" : v2Layout.tapTarget, // 44px on native
    height: v2Layout.tapTarget,
    flexDirection: Platform.OS === "web" ? "row" : "column",
    gap: Platform.OS === "web" ? 8 : 0,
    paddingHorizontal: Platform.OS === "web" ? 16 : 0,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ink,
    backgroundColor: v2Colors.ground,
    shadowColor: v2Colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
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
    width: v2Layout.tapTarget, // 44px
    height: v2Layout.tapTarget,
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ink,
    backgroundColor: v2Colors.ground,
    shadowColor: v2Colors.ink,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
    alignItems: "center",
    justifyContent: "center",
  },

  // ---------------------------------------------------------------------------
  // Flow Steps Indicator (WEB ONLY - hidden on native mobile)
  // ---------------------------------------------------------------------------
  stepsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    alignSelf: "center",
    width: "100%",
    maxWidth: 960,
    paddingVertical: v2SpacingSemantic.m,
    paddingHorizontal: v2SpacingSemantic.m,
    paddingTop: HEADER_HEIGHT + v2SpacingSemantic.m,
    backgroundColor: v2Colors.ground,
    // Hidden on native
    display: Platform.OS === "web" ? "flex" : "none",
  },
  step: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    position: "relative",
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
    position: "absolute",
    left: "50%",
    top: 11,
    width: "100%",
    height: 2,
    backgroundColor: v2Colors.inkMuted,
    opacity: 0.3,
    zIndex: -1,
  },

  // ---------------------------------------------------------------------------
  // Hero Section (monochrome concert banner)
  // Mobile: 50vh (actual viewport height), Web: 400px
  // ---------------------------------------------------------------------------
  hero: {
    position: "relative",
    height: HERO_HEIGHT,
    minHeight: 300,
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
    // Native: absolute bottom positioning like prototype
    // Web: relative with flex-end from parent
    position: Platform.OS === "web" ? "relative" : "absolute",
    bottom: Platform.OS === "web" ? undefined : 0,
    left: Platform.OS === "web" ? undefined : 0,
    right: Platform.OS === "web" ? undefined : 0,
    zIndex: 10,
    // Native: padding-m (24px) top/bottom, frame (16px) horizontal - matches prototype
    // Web: larger padding for desktop layout
    padding: Platform.OS === "web" ? v2SpacingSemantic.xl : v2SpacingSemantic.m,
    paddingHorizontal: Platform.OS === "web" ? v2SpacingSemantic.m : 16, // frame = 16px
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
    // Native: space-xs (8px), Web: space-m (24px)
    marginBottom: Platform.OS === "web" ? v2SpacingSemantic.m : v2SpacingSemantic.xs,
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
    backgroundColor: v2Colors.danger, // #ff0000 - Live red dot per Design Palette Guide
  },
  heroTitle: {
    fontFamily: interFonts.black,
    fontSize: Platform.OS === "web" ? 48 : v2FontSizes["2xl"], // 24px on mobile
    lineHeight: (Platform.OS === "web" ? 48 : v2FontSizes["2xl"]) * 1.1,
    color: v2Colors.ink,
    textTransform: "uppercase",
    letterSpacing: -0.03 * (Platform.OS === "web" ? 48 : v2FontSizes["2xl"]),
    // Native: space-xs (8px), Web: space-s (16px)
    marginBottom: Platform.OS === "web" ? v2SpacingSemantic.s : v2SpacingSemantic.xs,
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
  // Info Card (Mobile only - date/location below hero)
  // ---------------------------------------------------------------------------
  infoCard: {
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ink,
    padding: v2SpacingSemantic.m,
    marginBottom: v2SpacingSemantic.m,
    backgroundColor: v2Colors.ground,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: v2SpacingSemantic.s,
    marginBottom: v2SpacingSemantic.s,
  },
  infoRowLast: {
    marginBottom: 0,
  },
  infoIcon: {
    width: 20,
    height: 20,
    marginTop: 2,
  },
  infoLabel: {
    fontFamily: interFonts.medium,
    fontSize: v2FontSizes.xs,
    color: v2Colors.inkMuted,
    textTransform: "uppercase",
    letterSpacing: v2FontSizes.xs * 0.05,
  },
  infoValue: {
    fontFamily: interFonts.semiBold,
    fontSize: v2FontSizes.s,
    color: v2Colors.ink,
    marginTop: 2,
  },

  // ---------------------------------------------------------------------------
  // Content Layout (single column, max 900px)
  // ---------------------------------------------------------------------------
  content: {
    maxWidth: 900,
    width: "100%",
    alignSelf: "center",
    // Native: padding-m (24px) top, frame (16px) horizontal - matches prototype
    // Web: larger padding for desktop layout
    paddingHorizontal: Platform.OS === "web" ? v2SpacingSemantic.m : 16, // frame = 16px
    paddingTop: Platform.OS === "web" ? v2SpacingSemantic.l : v2SpacingSemantic.m, // space-m = 24px
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
    // Native: text-xs (12px), Web: text-xl (20px)
    fontSize: Platform.OS === "web" ? v2FontSizes.xl : v2FontSizes.xs,
    color: v2Colors.ink,
    textTransform: "uppercase",
    letterSpacing: (Platform.OS === "web" ? v2FontSizes.xl : v2FontSizes.xs) * 0.05,
    // Native: space-xs (8px), Web: space-s (16px)
    paddingBottom: Platform.OS === "web" ? v2SpacingSemantic.s : v2SpacingSemantic.xs,
    borderBottomWidth: v2Borders.standard,
    borderBottomColor: v2Colors.ink,
    // Native: space-s (16px), Web: space-m (24px)
    marginBottom: Platform.OS === "web" ? v2SpacingSemantic.m : v2SpacingSemantic.s,
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
  //
  // Prototype mobile: individually bordered rows with a shared 2px divider.
  // ---------------------------------------------------------------------------
  categoriesGrid: {
    gap: Platform.OS === "web" ? v2SpacingSemantic.s : 0,
    marginBottom: v2SpacingSemantic.m,
  },
  categoryFrame: {
    borderWidth: v2Borders.standard,
    borderColor: v2Colors.ink,
    backgroundColor: v2Colors.ground,
    padding: 0,
    marginBottom: Platform.OS === "web" ? 0 : -v2Borders.standard,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    // Inner content sits 16px from the outer 2px border on mobile.
    padding: Platform.OS === "web" ? v2SpacingSemantic.m : v2SpacingSemantic.s - v2Borders.standard,
  },
  categoryItemHover: {
    backgroundColor: v2Colors.field,
    transform: [{ translateX: 4 }],
  },
  categoryInfo: {
    alignSelf: "flex-start",
    flex: 1,
    flexShrink: 1,
    // Gap before the price column — prevents long names from crowding the price
    paddingRight: Platform.OS === "web" ? 0 : 12,
  },
  categoryName: {
    fontFamily: interFonts.bold,
    // Native: text-s (14px) per prototype, Web: text-m (16px)
    fontSize: Platform.OS === "web" ? v2FontSizes.m : v2FontSizes.s,
    // Explicit lineHeight on native keeps the left column height predictable
    // so it always matches the right column's height (name ↔ price, desc ↔ status)
    lineHeight: Platform.OS === "web" ? undefined : Math.round(v2FontSizes.s * 1.35),
    color: v2Colors.ink,
    textTransform: "uppercase",
  },
  categoryDesc: {
    fontFamily: interFonts.regular,
    // Native: text-xs (12px) per prototype, Web: text-s (14px)
    fontSize: Platform.OS === "web" ? v2FontSizes.s : v2FontSizes.xs,
    lineHeight: Platform.OS === "web" ? undefined : Math.round(v2FontSizes.xs * 1.35),
    color: v2Colors.inkMuted,
    marginTop: 2,
  },
  categoryPrice: {
    alignSelf: "flex-start",
    // flexShrink: 0 ensures the price column is NEVER squeezed by categoryInfo's flex:1
    flexShrink: 0,
    alignItems: "flex-end",
  },
  categoryPriceValue: {
    fontFamily: interFonts.black,
    // Native: text-m (16px) per prototype, Web: text-l (18px)
    fontSize: Platform.OS === "web" ? v2FontSizes.l : v2FontSizes.m,
    lineHeight: Platform.OS === "web" ? undefined : Math.round(v2FontSizes.m * 1.35),
    color: v2Colors.ink,
  },
  categoryAvail: {
    fontFamily: interFonts.semiBold,
    fontSize: v2FontSizes.xs,
    lineHeight: Platform.OS === "web" ? undefined : Math.round(v2FontSizes.xs * 1.35),
    color: v2Colors.success,
  },
  categoryAvailLimited: {
    fontFamily: interFonts.semiBold,
    fontSize: v2FontSizes.xs,
    lineHeight: Platform.OS === "web" ? undefined : Math.round(v2FontSizes.xs * 1.35),
    color: v2Colors.warning,
  },
  categoryAvailOut: {
    fontFamily: interFonts.semiBold,
    fontSize: v2FontSizes.xs,
    lineHeight: Platform.OS === "web" ? undefined : Math.round(v2FontSizes.xs * 1.35),
    color: v2Colors.danger, // #ff0000 - "Habis" per Design Palette Guide
    textDecorationLine: "line-through",
  },
  categorySoldOut: {
    opacity: 0.5,
  },

  // ---------------------------------------------------------------------------
  // Lineup Grid (Web) / Horizontal Scroll (Native)
  // ---------------------------------------------------------------------------
  lineupGrid: {
    flexDirection: "row",
    flexWrap: Platform.OS === "web" ? "wrap" : "nowrap",
    gap: v2SpacingSemantic.s,
  },
  // Native: horizontal scroll container
  lineupScroll: {
    marginHorizontal: -v2SpacingSemantic.m, // Bleed to edges
    paddingHorizontal: v2SpacingSemantic.m,
    paddingBottom: v2SpacingSemantic.s,
  },
  lineupItem: {
    width: Platform.OS === "web" ? 150 : 100, // Smaller on mobile
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
    color: v2Colors.success, // #00aa00 per Design Palette Guide
  },
  termsText: {
    flex: 1,
    fontFamily: interFonts.regular,
    fontSize: v2FontSizes.s,
    color: v2Colors.ink,
  },

  // ---------------------------------------------------------------------------
  // Floating CTA (fixed bottom bar)
  // Mobile: native shadow + pulse + safe area
  // ---------------------------------------------------------------------------
  floatingCta: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: v2SpacingSemantic.s,
    paddingHorizontal: Platform.OS === "web" ? v2SpacingSemantic.m : 16, // frame padding on mobile
    paddingBottom: Platform.OS === "web" ? v2SpacingSemantic.m : v2SpacingSemantic.s + SAFE_AREA_BOTTOM,
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
    gap: v2SpacingSemantic.s,
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
  // Native: static container style for shadow (avoids NOBRIDGE error)
  floatingCtaBtnContainer: Platform.select({
    web: {},
    default: {
      shadowColor: v2Colors.ink,
      shadowOffset: { width: v2Shadows.md.x, height: v2Shadows.md.y },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 4,
    },
  }),
  floatingCtaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: v2SpacingSemantic.xs,
    // Native: 1rem 2rem (16px 32px) per prototype
    // Web: larger padding for desktop layout
    paddingVertical: Platform.OS === "web" ? v2SpacingSemantic.m : v2SpacingSemantic.s, // 24px web, 16px native
    paddingHorizontal: Platform.OS === "web" ? v2SpacingSemantic.l : 32, // 48px web, 32px native
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
    // Native: text-s (14px) per prototype, Web: text-m (16px)
    fontSize: Platform.OS === "web" ? v2FontSizes.m : v2FontSizes.s,
    color: v2Colors.ground,
    textTransform: "uppercase",
    letterSpacing: (Platform.OS === "web" ? v2FontSizes.m : v2FontSizes.s) * 0.04,
  },
  floatingCtaArrow: {
    fontFamily: interFonts.bold,
    // Native: text-s (14px) per prototype, Web: text-m (16px)
    fontSize: Platform.OS === "web" ? v2FontSizes.m : v2FontSizes.s,
    color: v2Colors.ground,
  },

  // ---------------------------------------------------------------------------
  // Trust Badges (Web only - hidden on native mobile)
  // ---------------------------------------------------------------------------
  trustBadges: {
    flexDirection: "row",
    gap: v2SpacingSemantic.s,
    marginTop: v2SpacingSemantic.s,
    display: Platform.OS === "web" ? "flex" : "none",
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
    color: v2Colors.success, // #00aa00 per Design Palette Guide
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
