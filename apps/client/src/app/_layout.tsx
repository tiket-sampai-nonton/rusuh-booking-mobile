import "../../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Fragment } from "react";

import { useNotifications } from "@presentation/hooks/useNotifications";
import { AppProviders } from "@providers/providers";

// Runs INSIDE the providers so it can read the DI container (useServices).
// Registers for push + wires the notification tap→deep-link (RBT-072, native).
function NotificationBridge() {
  useNotifications();
  return null;
}

// RBT-001 shipped the router root; RBT-004 wraps this tree with the
// composition-root providers. RBT-072 adds the native notification bridge.
export default function RootLayout() {
  return (
    <AppProviders>
      <Fragment>
        <NotificationBridge />
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style="auto" />
      </Fragment>
    </AppProviders>
  );
}
