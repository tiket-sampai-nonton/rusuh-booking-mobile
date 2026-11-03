/**
 * V2 Brutalist Mono Loading + Error States
 *
 * MATCHES: `.oil-ui/v2/02-event-detail.html` .loader
 *
 * Features:
 * - Loader: Black background with white progress bar
 * - Error: White background with black text
 */
import { useEffect, useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";

import { DetailBackground, V2Header } from "./DetailChrome";
import { v2DetailStyles as styles } from "../style";

// ═══════════════════════════════════════════════════════════════════════════════
// LOADING STATE
// ═══════════════════════════════════════════════════════════════════════════════

export function DetailLoading({ onBack }: { readonly onBack: () => void }) {
  const progressAnim = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 1500,
      useNativeDriver: true,
    }).start();
  }, [progressAnim]);

  return (
    <View style={styles.loader} testID="detail-loading">
      <View style={styles.loaderBar}>
        <Animated.View
          style={[
            styles.loaderProgress,
            { transform: [{ translateX: progressAnim }] },
          ]}
        />
      </View>
    </View>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ERROR STATE
// ═══════════════════════════════════════════════════════════════════════════════

export function DetailError({
  message,
  onBack,
}: {
  readonly message?: string;
  readonly onBack: () => void;
}) {
  return (
    <DetailBackground testID="detail-error">
      <V2Header onBack={onBack} />
      <View
        style={styles.errorContainer}
        accessibilityLiveRegion="polite"
      >
        <Text style={styles.errorText} accessibilityRole="header">
          Gagal memuat event
        </Text>
        <Text style={[styles.description, { textAlign: "center" }]}>
          {message || "Event tidak ditemukan."}
        </Text>
        <Pressable
          style={styles.floatingCtaBtn}
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Kembali ke beranda"
        >
          <Text style={styles.floatingCtaBtnText}>Kembali</Text>
        </Pressable>
      </View>
    </DetailBackground>
  );
}
