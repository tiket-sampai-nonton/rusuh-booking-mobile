import { StyleSheet } from "react-native";
import { neutral } from "@presentation/theme";

export const rootLayoutStyles = StyleSheet.create({
  root: { flex: 1, backgroundColor: neutral.paper },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: neutral.paper,
  },
});
