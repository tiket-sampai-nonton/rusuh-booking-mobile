/**
 * EventDetail  Brutalist Mono styles
 *
 * MATCHES: `.genesis/prototype/v2-mobile/02-event-detail.html` (native)
 * MATCHES: `.oil-ui/v2/02-event-detail.html` (web)
 *
 *  Design Rules:
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
  designBorders,
  designColors,
  designFontSizes,
  designLayout,
  designShadows,
  designSpacingSemantic,
} from "@presentation/theme/event-design-tokens";
import { hardShadowStyle } from "@presentation/utils/style";

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

/** Screen dimensions for viewport-based calculations */
const { height: SCREEN_HEIGHT } = Dimensions.get("window");

/** Hero height: 50vh on native (matches prototype), 400px on web */
export const HERO_HEIGHT =
  Platform.OS === "web" ? 400 : Math.max(SCREEN_HEIGHT * 0.5, 300);

/** Header height for padding calculations */
export const HEADER_HEIGHT =
  Platform.OS === "web" ? 60 : designLayout.headerHeightMobile;

/** Floating CTA height */
export const FLOATING_CTA_HEIGHT = 100;

/** Safe area bottom padding for native */
export const SAFE_AREA_BOTTOM = Platform.OS === "web" ? 0 : 34;

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN STYLES
// ═══════════════════════════════════════════════════════════════════════════════

export const designDetailStyles = StyleSheet.create({
  // ---------------------------------------------------------------------------
  // Root & Layout
  // ---------------------------------------------------------------------------
  root: {
    flex: 1,
    backgroundColor: designColors.ground, // WHITE background
  },

  // ---------------------------------------------------------------------------
  // Scroll Progress Bar (fixed top)
  // ---------------------------------------------------------------------------
  scrollProgress: {
    position: "absolute",
    top: 0,
    left: 0,
    height: 3,
    backgroundColor: designColors.ink,
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
    paddingVertical: designSpacingSemantic.s, // 16px
    paddingHorizontal: designSpacingSemantic.m, // 24px
    // Web: solid background, Native: controlled by headerScrolled
    backgroundColor:
      Platform.OS === "web" ? designColors.ground : "transparent",
    borderBottomWidth: Platform.OS === "web" ? designBorders.standard : 0,
    borderBottomColor: designColors.ink,
  },
  // Native only: scrolled header state (applied via Animated)
  headerScrolled: {
    backgroundColor: designColors.ground,
    borderBottomWidth: designBorders.standard,
    borderBottomColor: designColors.ink,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: designSpacingSemantic.m,
  },
  backBtn: {
    // Native: square 44x44 icon-only button
    // Web: wider button with "← Kembali" text
    width: Platform.OS === "web" ? "auto" : designLayout.tapTarget, // 44px on native
    height: designLayout.tapTarget,
    flexDirection: Platform.OS === "web" ? "row" : "column",
    gap: Platform.OS === "web" ? 8 : 0,
    paddingHorizontal: Platform.OS === "web" ? 16 : 0,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
    ...hardShadowStyle(3, 3, designColors.ink, 3),
  },
  backBtnText: {
    fontFamily: interFonts.semiBold,
    fontSize: designFontSizes.s,
    color: designColors.ink,
    textTransform: "uppercase",
    letterSpacing: designFontSizes.s * 0.04,
  },
  logo: {
    fontFamily: interFonts.black,
    fontSize: 18,
    color: designColors.ink,
    textTransform: "uppercase",
    letterSpacing: 0.02 * 18,
  },
  headerActions: {
    flexDirection: "row",
    gap: designSpacingSemantic.xs,
  },
  iconBtn: {
    width: designLayout.tapTarget, // 44px
    height: designLayout.tapTarget,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
    ...hardShadowStyle(3, 3, designColors.ink, 3),
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
    paddingVertical: designSpacingSemantic.m,
    paddingHorizontal: designSpacingSemantic.m,
    paddingTop: HEADER_HEIGHT + designSpacingSemantic.m,
    backgroundColor: designColors.ground,
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
    backgroundColor: designColors.ink,
    borderColor: designColors.ink,
  },
  stepNumInactive: {
    backgroundColor: "transparent",
    borderColor: designColors.inkMuted,
  },
  stepNumText: {
    fontFamily: interFonts.bold,
    fontSize: 10,
  },
  stepNumTextActive: {
    color: designColors.ground,
  },
  stepNumTextInactive: {
    color: designColors.inkMuted,
  },
  stepLabel: {
    fontFamily: interFonts.bold,
    fontSize: designFontSizes.xs,
    textTransform: "uppercase",
    letterSpacing: designFontSizes.xs * 0.08,
  },
  stepLabelActive: {
    color: designColors.ink,
  },
  stepLabelInactive: {
    color: designColors.inkMuted,
  },
  stepConnector: {
    position: "absolute",
    left: "50%",
    top: 11,
    width: "100%",
    height: 2,
    backgroundColor: designColors.inkMuted,
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
    padding:
      Platform.OS === "web"
        ? designSpacingSemantic.xl
        : designSpacingSemantic.m,
    paddingHorizontal: Platform.OS === "web" ? designSpacingSemantic.m : 16, // frame = 16px
    maxWidth: 1200,
    width: "100%",
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: designSpacingSemantic.xs,
    paddingVertical: designSpacingSemantic.xs,
    paddingHorizontal: designSpacingSemantic.s,
    backgroundColor: designColors.ink,
    // Native: space-xs (8px), Web: space-m (24px)
    marginBottom:
      Platform.OS === "web"
        ? designSpacingSemantic.m
        : designSpacingSemantic.xs,
  },
  heroBadgeText: {
    fontFamily: interFonts.bold,
    fontSize: designFontSizes.xs,
    color: designColors.ground,
    textTransform: "uppercase",
    letterSpacing: designFontSizes.xs * 0.08,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: designColors.danger, // #ff0000 - Live red dot per Design Palette Guide
  },
  heroTitle: {
    fontFamily: interFonts.black,
    fontSize: Platform.OS === "web" ? 48 : designFontSizes["2xl"], // 24px on mobile
    lineHeight: (Platform.OS === "web" ? 48 : designFontSizes["2xl"]) * 1.1,
    color: designColors.ink,
    textTransform: "uppercase",
    letterSpacing:
      -0.03 * (Platform.OS === "web" ? 48 : designFontSizes["2xl"]),
    // Native: space-xs (8px), Web: space-s (16px)
    marginBottom:
      Platform.OS === "web"
        ? designSpacingSemantic.s
        : designSpacingSemantic.xs,
  },
  heroSubtitle: {
    fontFamily: interFonts.medium,
    fontSize: designFontSizes.l,
    color: designColors.inkMuted,
    marginBottom: designSpacingSemantic.m,
  },
  heroMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: designSpacingSemantic.m,
  },
  heroMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: designSpacingSemantic.xs,
  },
  heroMetaText: {
    fontFamily: interFonts.semiBold,
    fontSize: designFontSizes.m,
    color: designColors.ink,
  },

  // ---------------------------------------------------------------------------
  // Info Card (Mobile only - date/location below hero)
  // ---------------------------------------------------------------------------
  infoCard: {
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    padding: designSpacingSemantic.m,
    marginBottom: designSpacingSemantic.m,
    backgroundColor: designColors.ground,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: designSpacingSemantic.s,
    marginBottom: designSpacingSemantic.s,
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
    fontSize: designFontSizes.xs,
    color: designColors.inkMuted,
    textTransform: "uppercase",
    letterSpacing: designFontSizes.xs * 0.05,
  },
  infoValue: {
    fontFamily: interFonts.semiBold,
    fontSize: designFontSizes.s,
    color: designColors.ink,
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
    paddingHorizontal: Platform.OS === "web" ? designSpacingSemantic.m : 16, // frame = 16px
    paddingTop:
      Platform.OS === "web" ? designSpacingSemantic.l : designSpacingSemantic.m, // space-m = 24px
    paddingBottom: designSpacingSemantic.xl + FLOATING_CTA_HEIGHT,
  },

  // ---------------------------------------------------------------------------
  // Section Block
  // ---------------------------------------------------------------------------
  section: {
    marginBottom: designSpacingSemantic.l, // 48px
    // Animation: starts hidden, revealed on scroll
    opacity: 1, // Controlled by Animated.View
  },
  sectionTitle: {
    fontFamily: interFonts.black,
    // Native: text-xs (12px), Web: text-xl (20px)
    fontSize: Platform.OS === "web" ? designFontSizes.xl : designFontSizes.xs,
    color: designColors.ink,
    textTransform: "uppercase",
    letterSpacing:
      (Platform.OS === "web" ? designFontSizes.xl : designFontSizes.xs) * 0.05,
    // Native: space-xs (8px), Web: space-s (16px)
    paddingBottom:
      Platform.OS === "web"
        ? designSpacingSemantic.s
        : designSpacingSemantic.xs,
    borderBottomWidth: designBorders.standard,
    borderBottomColor: designColors.ink,
    // Native: space-s (16px), Web: space-m (24px)
    marginBottom:
      Platform.OS === "web" ? designSpacingSemantic.m : designSpacingSemantic.s,
  },

  // ---------------------------------------------------------------------------
  // Description Text
  // ---------------------------------------------------------------------------
  description: {
    fontFamily: interFonts.regular,
    fontSize: designFontSizes.m,
    lineHeight: designFontSizes.m * 1.8,
    color: designColors.inkMuted,
  },
  descriptionParagraph: {
    marginBottom: designSpacingSemantic.m,
  },

  // ---------------------------------------------------------------------------
  // Ticket Categories Preview
  //
  // Prototype mobile: individually bordered rows with a shared 2px divider.
  // ---------------------------------------------------------------------------
  categoriesGrid: {
    gap: Platform.OS === "web" ? designSpacingSemantic.s : 0,
    marginBottom: designSpacingSemantic.m,
  },
  categoryFrame: {
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    backgroundColor: designColors.ground,
    padding: 0,
    marginBottom: Platform.OS === "web" ? 0 : -designBorders.standard,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    // Inner content sits 16px from the outer 2px border on mobile.
    padding:
      Platform.OS === "web"
        ? designSpacingSemantic.m
        : designSpacingSemantic.s - designBorders.standard,
  },
  categoryItemHover: {
    backgroundColor: designColors.field,
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
    fontSize: Platform.OS === "web" ? designFontSizes.m : designFontSizes.s,
    // Explicit lineHeight on native keeps the left column height predictable
    // so it always matches the right column's height (name ↔ price, desc ↔ status)
    lineHeight:
      Platform.OS === "web" ? undefined : Math.round(designFontSizes.s * 1.35),
    color: designColors.ink,
    textTransform: "uppercase",
  },
  categoryDesc: {
    fontFamily: interFonts.regular,
    // Native: text-xs (12px) per prototype, Web: text-s (14px)
    fontSize: Platform.OS === "web" ? designFontSizes.s : designFontSizes.xs,
    lineHeight:
      Platform.OS === "web" ? undefined : Math.round(designFontSizes.xs * 1.35),
    color: designColors.inkMuted,
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
    fontSize: Platform.OS === "web" ? designFontSizes.l : designFontSizes.m,
    lineHeight:
      Platform.OS === "web" ? undefined : Math.round(designFontSizes.m * 1.35),
    color: designColors.ink,
  },
  categoryAvail: {
    fontFamily: interFonts.semiBold,
    fontSize: designFontSizes.xs,
    lineHeight:
      Platform.OS === "web" ? undefined : Math.round(designFontSizes.xs * 1.35),
    color: designColors.success,
  },
  categoryAvailLimited: {
    fontFamily: interFonts.semiBold,
    fontSize: designFontSizes.xs,
    lineHeight:
      Platform.OS === "web" ? undefined : Math.round(designFontSizes.xs * 1.35),
    color: designColors.warning,
  },
  categoryAvailOut: {
    fontFamily: interFonts.semiBold,
    fontSize: designFontSizes.xs,
    lineHeight:
      Platform.OS === "web" ? undefined : Math.round(designFontSizes.xs * 1.35),
    color: designColors.danger, // #ff0000 - "Habis" per Design Palette Guide
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
    gap: designSpacingSemantic.s,
  },
  // Native: horizontal scroll container
  lineupScroll: {
    marginHorizontal: -designSpacingSemantic.m, // Bleed to edges
    paddingHorizontal: designSpacingSemantic.m,
    paddingBottom: designSpacingSemantic.s,
  },
  lineupItem: {
    width: Platform.OS === "web" ? 150 : 100, // Smaller on mobile
    alignItems: "center",
    padding: designSpacingSemantic.m,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
  },
  lineupItemHover: {
    backgroundColor: designColors.ink,
  },
  lineupAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40, // Exception: avatars are circular
    marginBottom: designSpacingSemantic.s,
    // Grayscale by default
  },
  lineupAvatarHover: {
    // Remove grayscale on hover
  },
  lineupName: {
    fontFamily: interFonts.bold,
    fontSize: designFontSizes.s,
    color: designColors.ink,
    textTransform: "uppercase",
    textAlign: "center",
  },
  lineupNameHover: {
    color: designColors.ground,
  },
  lineupRole: {
    fontFamily: interFonts.regular,
    fontSize: designFontSizes.xs,
    color: designColors.inkMuted,
    textAlign: "center",
  },
  lineupRoleHover: {
    color: designColors.ground,
    opacity: 0.7,
  },

  // ---------------------------------------------------------------------------
  // Venue Map
  // ---------------------------------------------------------------------------
  venueMap: {
    position: "relative",
    aspectRatio: 16 / 9,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
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
    gap: designSpacingSemantic.xs,
    paddingVertical: designSpacingSemantic.s,
    paddingHorizontal: designSpacingSemantic.m,
    backgroundColor: designColors.ground,
  },
  venueMapBtnText: {
    fontFamily: interFonts.bold,
    fontSize: designFontSizes.s,
    color: designColors.ink,
    textTransform: "uppercase",
    letterSpacing: designFontSizes.s * 0.04,
  },
  venueInfo: {
    marginTop: designSpacingSemantic.m,
  },
  venueName: {
    fontFamily: interFonts.bold,
    fontSize: designFontSizes.l,
    color: designColors.ink,
    marginBottom: designSpacingSemantic.xs,
  },
  venueAddress: {
    fontFamily: interFonts.regular,
    fontSize: designFontSizes.s,
    color: designColors.inkMuted,
  },

  // ---------------------------------------------------------------------------
  // Gallery Grid
  // ---------------------------------------------------------------------------
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: designColors.ink,
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
    color: designColors.ground,
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
    gap: designSpacingSemantic.s,
    paddingVertical: designSpacingSemantic.s,
    borderBottomWidth: 1,
    borderBottomColor: designColors.field,
  },
  termsCheck: {
    fontFamily: interFonts.black,
    fontSize: designFontSizes.s,
    color: designColors.success, // #00aa00 per Design Palette Guide
  },
  termsText: {
    flex: 1,
    fontFamily: interFonts.regular,
    fontSize: designFontSizes.s,
    color: designColors.ink,
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
    paddingVertical: designSpacingSemantic.s,
    paddingHorizontal: Platform.OS === "web" ? designSpacingSemantic.m : 16, // frame padding on mobile
    paddingBottom:
      Platform.OS === "web"
        ? designSpacingSemantic.m
        : designSpacingSemantic.s + SAFE_AREA_BOTTOM,
    backgroundColor: designColors.ground,
    borderTopWidth: designBorders.standard,
    borderTopColor: designColors.ink,
    zIndex: 99,
  },
  floatingCtaInner: {
    maxWidth: 900,
    width: "100%",
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: designSpacingSemantic.s,
  },
  floatingCtaInfo: {
    flex: 1,
  },
  floatingCtaPriceLabel: {
    fontFamily: interFonts.regular,
    fontSize: designFontSizes.xs,
    color: designColors.inkMuted,
    textTransform: "uppercase",
    letterSpacing: designFontSizes.xs * 0.04,
  },
  floatingCtaPrice: {
    fontFamily: interFonts.black,
    fontSize: designFontSizes.xl,
    color: designColors.ink,
  },
  // Native: static container style for shadow (avoids NOBRIDGE error)
  floatingCtaBtnContainer: hardShadowStyle(
    designShadows.md.x,
    designShadows.md.y,
    designColors.ink,
    4,
  ),
  floatingCtaBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: designSpacingSemantic.xs,
    // Native: 1rem 2rem (16px 32px) per prototype
    // Web: larger padding for desktop layout
    paddingVertical:
      Platform.OS === "web" ? designSpacingSemantic.m : designSpacingSemantic.s, // 24px web, 16px native
    paddingHorizontal: Platform.OS === "web" ? designSpacingSemantic.l : 32, // 48px web, 32px native
    backgroundColor: designColors.ink,
    borderWidth: designBorders.standard,
    borderColor: designColors.ink,
    // Pulse glow animation applied separately
  },
  floatingCtaBtnDisabled: {
    opacity: 0.45,
  },
  floatingCtaBtnText: {
    fontFamily: interFonts.bold,
    // Native: text-s (14px) per prototype, Web: text-m (16px)
    fontSize: Platform.OS === "web" ? designFontSizes.m : designFontSizes.s,
    color: designColors.ground,
    textTransform: "uppercase",
    letterSpacing:
      (Platform.OS === "web" ? designFontSizes.m : designFontSizes.s) * 0.04,
  },
  floatingCtaArrow: {
    fontFamily: interFonts.bold,
    // Native: text-s (14px) per prototype, Web: text-m (16px)
    fontSize: Platform.OS === "web" ? designFontSizes.m : designFontSizes.s,
    color: designColors.ground,
  },

  // ---------------------------------------------------------------------------
  // Trust Badges (Web only - hidden on native mobile)
  // ---------------------------------------------------------------------------
  trustBadges: {
    flexDirection: "row",
    gap: designSpacingSemantic.s,
    marginTop: designSpacingSemantic.s,
    display: Platform.OS === "web" ? "flex" : "none",
  },
  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  trustBadgeText: {
    fontFamily: interFonts.regular,
    fontSize: designFontSizes.xs,
    color: designColors.inkMuted,
  },
  trustBadgeCheck: {
    fontFamily: interFonts.bold,
    fontSize: 12,
    color: designColors.success, // #00aa00 per Design Palette Guide
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
    top: designSpacingSemantic.m,
    right: designSpacingSemantic.m,
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: designColors.ground,
    alignItems: "center",
    justifyContent: "center",
  },
  lightboxCloseText: {
    fontFamily: interFonts.bold,
    fontSize: designFontSizes.l,
    color: designColors.ground,
  },
  lightboxNav: {
    position: "absolute",
    top: "50%",
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: designColors.ground,
    alignItems: "center",
    justifyContent: "center",
  },
  lightboxNavText: {
    fontFamily: interFonts.bold,
    fontSize: designFontSizes.l,
    color: designColors.ground,
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
    backgroundColor: designColors.ink,
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
    backgroundColor: designColors.ground,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: designColors.ground,
    alignItems: "center",
    justifyContent: "center",
    padding: designSpacingSemantic.l,
  },
  errorText: {
    fontFamily: interFonts.bold,
    fontSize: designFontSizes.l,
    color: designColors.ink,
    textAlign: "center",
    marginBottom: designSpacingSemantic.m,
  },
});

// ═══════════════════════════════════════════════════════════════════════════════
// SCROLL CONTENT HELPER
// ═══════════════════════════════════════════════════════════════════════════════

export const designDetailScrollContent = (isDesktop: boolean): object => ({
  paddingBottom: FLOATING_CTA_HEIGHT + designSpacingSemantic.l,
});

// ═══════════════════════════════════════════════════════════════════════════════
// LEGACY EXPORTS (for gradual migration)
// ═══════════════════════════════════════════════════════════════════════════════

/** @deprecated Use designDetailStyles instead */
export const detailStyles = designDetailStyles;

/** @deprecated Use designDetailScrollContent instead */
export const detailScrollContent = designDetailScrollContent;

/** @deprecated Use designDetailStyles.floatingCtaBtn instead */
export const detailCta = (disabled: boolean) => [
  designDetailStyles.floatingCtaBtn,
  disabled && designDetailStyles.floatingCtaBtnDisabled,
];
