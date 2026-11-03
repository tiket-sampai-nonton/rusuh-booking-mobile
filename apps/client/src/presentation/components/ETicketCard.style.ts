/** V2 e-ticket styles — the dashed perforation divider (prototype `.ticket-divider`). */
import { StyleSheet } from "react-native";

import { v2Colors } from "@presentation/theme";

export const eTicketStyles = StyleSheet.create({
  divider: { borderTopWidth: 2, borderStyle: "dashed", borderTopColor: v2Colors.field },
});
