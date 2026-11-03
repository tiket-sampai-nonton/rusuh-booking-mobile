/**
 * V2 Brutalist Mono Detail Chrome — Header + Steps
 *
 * MATCHES: `.oil-ui/v2/02-event-detail.html`
 *
 * - Header: fixed top bar with back button, logo, action icons
 * - Steps: numbered circles with connectors (Detail → Antre → Pilih → Bayar → Selesai)
 */
import type { ReactNode } from "react";
import { Animated, Pressable, Text, View } from "react-native";

import { interFonts } from "@presentation/theme/fonts";
import { v2Colors } from "@presentation/theme/v2-tokens";

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
// ═══════════════════════════════════════════════════════════════════════════════

interface HeaderProps {
  readonly onBack: () => void;
  readonly onWishlist?: () => void;
  readonly onShare?: () => void;
  readonly isWishlisted?: boolean;
}

export function V2Header({
  onBack,
  onWishlist,
  onShare,
  isWishlisted = false,
}: HeaderProps) {
  return (
    <Animated.View style={styles.header}>
      <View style={styles.headerLeft}>
        {/* Back Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Kembali"
          onPress={onBack}
          style={styles.backBtn}
        >
          <Text style={{ fontFamily: interFonts.semiBold, fontSize: 14, color: v2Colors.ink }}>
            ←
          </Text>
          <Text style={styles.backBtnText}>Kembali</Text>
        </Pressable>

        {/* Logo */}
        <Text style={styles.logo}>Rusuh Tiket</Text>
      </View>

      <View style={styles.headerActions}>
        {/* Wishlist Button */}
        {onWishlist && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isWishlisted ? "Hapus dari wishlist" : "Tambah ke wishlist"}
            onPress={onWishlist}
            style={styles.iconBtn}
          >
            <Text style={{ fontFamily: interFonts.bold, fontSize: 18, color: v2Colors.ink }}>
              {isWishlisted ? "♥" : "♡"}
            </Text>
          </Pressable>
        )}

        {/* Share Button */}
        {onShare && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Bagikan"
            onPress={onShare}
            style={styles.iconBtn}
          >
            <Text style={{ fontFamily: interFonts.bold, fontSize: 16, color: v2Colors.ink }}>
              ⤴
            </Text>
          </Pressable>
        )}
      </View>
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
