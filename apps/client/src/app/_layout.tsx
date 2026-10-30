import "../../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { AppProviders } from "@providers/providers";

// RBT-001 shipped the router root; RBT-004 wraps this tree with the
// composition-root providers (ServiceProvider now; QueryClientProvider +
// ThemeProvider layer in as RBT-010/RBT-003 land).
export default function RootLayout() {
  return (
    <AppProviders>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </AppProviders>
  );
}
