import "../../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

// RBT-001 ships the router root only. RBT-004 wraps this tree with the
// composition-root providers (QueryClient + ServiceProvider + ThemeProvider).
export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style="auto" />
    </>
  );
}
