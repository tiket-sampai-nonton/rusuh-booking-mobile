/**
 * V2 brutalist History loading + empty states (prototype 04-my-tickets).
 *
 * Design:
 * - Loading: V2Loader spinner or simple centered indicator
 * - Empty: Dashed border box with icon, title, subtitle, CTA button
 * - Error: Solid border with danger accent
 */
import { Pressable, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";

import { V2Loader } from "@presentation/components/v2/V2Loader";
import { v2Colors } from "@presentation/theme";

import { historyStateStyles, historyStyles } from "../style";

export function HistoryLoading() {
  return (
    <View style={historyStateStyles.loadingContainer} testID="history-loading">
      <V2Loader
        visible={true}
        label="ARSIP"
        testID="history-v2-loader"
      />
    </View>
  );
}

export function HistoryEmpty() {
  const router = useRouter();

  const handleBrowse = () => {
    router.push("/browse" as Href);
  };

  return (
    <View style={[historyStyles.main, { paddingTop: 0 }]}>
      <View style={historyStateStyles.emptyCard} testID="history-empty" accessibilityLiveRegion="polite">
        {/* Icon box */}
        <View style={historyStateStyles.emptyIcon}>
          <Text style={{ fontSize: 32, color: v2Colors.ink }}>📭</Text>
        </View>

        {/* Title */}
        <Text style={historyStateStyles.emptyTitle}>Belum Ada Arsip</Text>

        {/* Subtitle */}
        <Text style={historyStateStyles.emptyText}>
          Event yang sudah selesai akan muncul di sini sebagai arsip.
        </Text>

        {/* Browse CTA */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Jelajahi event"
          onPress={handleBrowse}
          style={historyStateStyles.browseBtn}
          testID="history-browse-cta"
        >
          <Text style={historyStateStyles.browseBtnText}>Jelajahi Event</Text>
        </Pressable>
      </View>
    </View>
  );
}

export interface HistoryErrorProps {
  readonly message?: string;
}

export function HistoryError({ message }: HistoryErrorProps) {
  return (
    <View style={[historyStyles.main, { paddingTop: 0 }]}>
      <View
        style={historyStateStyles.errorCard}
        testID="history-error"
        accessibilityLiveRegion="polite"
      >
        <Text style={historyStateStyles.errorTitle}>Gagal Memuat Event</Text>
        <Text style={historyStateStyles.errorText}>
          {message || "Terjadi kesalahan. Silakan coba lagi."}
        </Text>
      </View>
    </View>
  );
}
