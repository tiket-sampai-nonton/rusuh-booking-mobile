/**
 * V2 Brutalist Mono Detail Chrome — Header + Steps
 *
 * MATCHES: `.genesis/prototype/v2-mobile/02-event-detail.html` (native)
 * MATCHES: `.oil-ui/v2/02-event-detail.html` (web)
 *
 * Mobile-specific:
 * - Header: transparent → solid on scroll (controlled by isScrolled prop)
 * - Header: icon-only buttons (no text "Kembali", no logo)
 * - Steps: hidden on mobile (display: none in styles)
 */
import type { ReactNode } from "react";
import { Animated, Platform, Pressable, Text, View } from "react-native";
import Svg, { Line, Path, Polyline } from "react-native-svg";
import { ArrowIcon } from "@presentation/components/ArrowIcon";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { interFonts } from "@presentation/theme/fonts";
import { v2Borders, v2Colors } from "@presentation/theme/v2-tokens";

import { v2DetailStyles as styles } from "../style";

// ═══════════════════════════════════════════════════════════════════════════════
// DETAIL BACKGROUND (V2 Light Theme)
// ═══════════════════════════════════════════════════════════════════════════════

export function DetailBackground({
  children,
  testID,
}: {
  readonly children: ReactNode;
  readonly testID?: string;
}) {
  return (
    <View style={styles.root} testID={testID}>
      {children}
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEADER (Fixed Top Bar)
// Mobile: transparent → solid on scroll
// Web: always solid with border
// ═══════════════════════════════════════════════════════════════════════════════

interface HeaderProps {
  readonly onBack: () => void;
  readonly onShare?: () => void;
  /** Native only: header becomes solid when scrolled past 100px */
  readonly isScrolled?: boolean;
}

export function V2Header({
  onBack,
  onShare,
  isScrolled = false,
}: HeaderProps) {
  const isNative = Platform.OS !== "web";
  const insets = useSafeAreaInsets();

  // Native: animate header background/border based on scroll
  const headerStyle = isNative
    ? [
        styles.header,
        { paddingTop: insets.top + 8 },
        isScrolled && {
          backgroundColor: v2Colors.ground,
          borderBottomWidth: v2Borders.standard,
          borderBottomColor: v2Colors.ink,
        },
      ]
    : styles.header;

  return (
    <Animated.View style={headerStyle}>
      {/* Mobile: icon-only back button, Web: text + icon */}
      {isNative ? (
        // Mobile: just back and share icons (SVG like prototype)
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Kembali"
            onPress={onBack}
            style={({ pressed }) => [
              styles.backBtn,
              { minWidth: 44, minHeight: 44, justifyContent: "center", alignItems: "center" },
              pressed && { backgroundColor: v2Colors.ink },
            ]}
          >
            {({ pressed }) => (
              <Svg
                width={20}
                height={20}
                viewBox="0 0 24 24"
                fill="none"
                stroke={pressed ? v2Colors.ground : v2Colors.ink}
                strokeWidth={2}
              >
                <Path d="m15 18-6-6 6-6" />
              </Svg>
            )}
          </Pressable>

          <View style={styles.headerActions}>
            {/* Share Button */}
            {onShare && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Bagikan"
                onPress={onShare}
                style={({ pressed }) => [
                  styles.iconBtn,
                  { minWidth: 44, minHeight: 44, justifyContent: "center", alignItems: "center" },
                  pressed && { backgroundColor: v2Colors.ink },
                ]}
              >
                {({ pressed }) => (
                  <Svg
                    width={20}
                    height={20}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={pressed ? v2Colors.ground : v2Colors.ink}
                    strokeWidth={2}
                  >
                    <Path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <Polyline points="16,6 12,2 8,6" />
                    <Line x1="12" y1="2" x2="12" y2="15" />
                  </Svg>
                )}
              </Pressable>
            )}
          </View>
        </>
      ) : (
        // Web: full header with back text + logo + share
        <>
          <View style={styles.headerLeft}>
            {/* Back Button - uses styles.backBtn for web which includes flexDirection + gap */}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Kembali"
              onPress={onBack}
              style={styles.backBtn}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <ArrowIcon direction="left" color={v2Colors.ink} />
                <Text style={{ fontFamily: interFonts.semiBold, fontSize: 14, color: v2Colors.ink }}>Kembali</Text>
              </View>
            </Pressable>

            {/* Logo */}
            <Text style={styles.logo}>Rusuh Tiket</Text>
          </View>

          <View style={styles.headerActions}>
            {/* Share Button */}
            {onShare && (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Bagikan"
                onPress={onShare}
                style={styles.iconBtn}
              >
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={v2Colors.ink} strokeWidth={2}>
                  <Path d="M12 16V3m0 0L7 8m5-5 5 5M5 13v7h14v-7" />
                </Svg>
              </Pressable>
            )}
          </View>
        </>
      )}
    </Animated.View>
  );
}

/** @deprecated Use V2Header instead */
export function MiniNav({ onBack }: { readonly onBack: () => void }) {
  return <V2Header onBack={onBack} />;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FLOW STEPS (Numbered Circles)
// ═══════════════════════════════════════════════════════════════════════════════

const FLOW_STEPS = [
  { num: 1, label: "Detail" },
  { num: 2, label: "Antre" },
  { num: 3, label: "Pilih" },
  { num: 4, label: "Bayar" },
  { num: 5, label: "Selesai" },
] as const;

interface StepsProps {
  /** Active step (1-based index). Default = 1 (Detail). */
  readonly activeStep?: number;
}

export function V2Steps({ activeStep = 1 }: StepsProps) {
  return (
    <View style={styles.stepsContainer}>
      {FLOW_STEPS.map((step, index) => {
        const isActive = step.num === activeStep;
        const isLast = index === FLOW_STEPS.length - 1;

        return (
          <View key={step.num} style={styles.step}>
            {/* Number Circle */}
            <View
              style={[
                styles.stepNum,
                isActive ? styles.stepNumActive : styles.stepNumInactive,
              ]}
            >
              <Text
                style={[
                  styles.stepNumText,
                  isActive ? styles.stepNumTextActive : styles.stepNumTextInactive,
                ]}
              >
                {step.num}
              </Text>
            </View>

            {/* Label */}
            <Text
              style={[
                styles.stepLabel,
                isActive ? styles.stepLabelActive : styles.stepLabelInactive,
              ]}
            >
              {step.label}
            </Text>

            {/* Connector (except last) */}
            {!isLast && <View style={styles.stepConnector} />}
          </View>
        );
      })}
    </View>
  );
}

/** @deprecated Use V2Steps instead */
export function Steps() {
  return <V2Steps activeStep={1} />;
}
