import { Pressable, Text, View } from "react-native";
import { useRouter, type Href } from "expo-router";

import { CalendarIcon } from "@presentation/components/ArrowIcon/CalendarIcon";
import { designColors } from "@presentation/theme";

import { historyStateStyles, historyStyles } from "../../../style";

export function HistoryEmpty() {
  const router = useRouter();

  const handleBrowse = () => {
    router.navigate("/browse" as Href);
  };

  return (
    <View style={[historyStyles.main, historyStateStyles.main]}>
      <View
        style={historyStateStyles.emptyCard}
        testID="history-empty"
        accessibilityLiveRegion="polite"
      >
        <View style={historyStateStyles.emptyIcon}>
          <CalendarIcon color={designColors.ink} size={32} />
        </View>
        <Text style={historyStateStyles.emptyTitle}>Belum Ada Arsip</Text>
        <Text style={historyStateStyles.emptyText}>
          Event yang sudah selesai akan muncul di sini sebagai arsip.
        </Text>
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
