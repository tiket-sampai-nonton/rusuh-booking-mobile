import { View } from "react-native";

import { TicketTabButton } from "../TicketTabButton";
import { ticketTabsStyles } from "../style";
import type { TicketTab } from "../types";

interface TicketTabsProps {
  readonly activeTab: TicketTab;
  readonly upcomingCount: number;
  readonly pastCount: number;
  readonly onChange: (tab: TicketTab) => void;
}

export function TicketTabs({
  activeTab,
  upcomingCount,
  pastCount,
  onChange,
}: TicketTabsProps) {
  return (
    <View style={ticketTabsStyles.container} accessibilityRole="tablist">
      <TicketTabButton
        tab="upcoming"
        activeTab={activeTab}
        count={upcomingCount}
        onChange={onChange}
      />
      <TicketTabButton
        tab="past"
        activeTab={activeTab}
        count={pastCount}
        onChange={onChange}
      />
    </View>
  );
}
