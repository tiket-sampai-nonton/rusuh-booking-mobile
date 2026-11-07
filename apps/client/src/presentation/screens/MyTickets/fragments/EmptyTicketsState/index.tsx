import { Pressable, Text, View } from "react-native";

import type { TicketTab } from "../TicketTabs";
import { styles } from "./style";

interface EmptyTicketsStateProps {
  readonly activeTab: TicketTab;
  readonly onBrowse: () => void;
}

export function EmptyTicketsState({
  activeTab,
  onBrowse,
}: EmptyTicketsStateProps) {
  return (
    <View style={styles.container} testID="my-tickets-empty">
      <Text style={styles.title}>
        {activeTab === "upcoming"
          ? "Belum Ada Tiket Mendatang"
          : "Belum Ada Tiket Sebelumnya"}
      </Text>
      <Text style={styles.description}>
        Tiket yang sudah dikonfirmasi akan tampil di sini setelah pembayaran.
      </Text>
      <Pressable onPress={onBrowse} style={styles.browseButton}>
        <Text style={styles.browseLabel}>Jelajahi Event</Text>
      </Pressable>
    </View>
  );
}
