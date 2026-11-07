import { Pressable, Text } from "react-native";

import { ticketTabsStyles as styles } from "../style";
import type { TicketTab } from "../types";

interface TicketTabButtonProps {
  readonly tab: TicketTab;
  readonly activeTab: TicketTab;
  readonly count: number;
  readonly onChange: (tab: TicketTab) => void;
}

const TAB_LABELS: Readonly<Record<TicketTab, string>> = {
  upcoming: "Mendatang",
  past: "Sebelumnya",
};

export function TicketTabButton({
  tab,
  activeTab,
  count,
  onChange,
}: TicketTabButtonProps) {
  const isActive = tab === activeTab;

  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      onPress={() => onChange(tab)}
      style={[styles.tab, isActive ? styles.activeTab : styles.inactiveTab]}
      testID={`tickets-tab-${tab}`}
    >
      <Text style={[styles.label, isActive && styles.activeLabel]}>
        {TAB_LABELS[tab]} ({count})
      </Text>
    </Pressable>
  );
}
