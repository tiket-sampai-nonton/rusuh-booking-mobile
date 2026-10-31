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
      {/* `animation: fade` gives a soft crossfade between routes (native-stack);
          the per-screen ScreenFade wrapper complements it on web. */}
      <Stack screenOptions={{ headerShown: false, animation: "fade" }} />
      <StatusBar style="auto" />
    </AppProviders>
  );
}
