import "../../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Fragment, useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

import { useNotifications } from "@presentation/hooks/useNotifications";
import { useInterFonts } from "@presentation/theme/fonts";
import { AppProviders } from "@providers/providers";
import { useServices } from "@providers/service-context";
import { useAccountStore } from "@presentation/stores/account-store";

// Runs INSIDE the providers so it can read the DI container (useServices).
// Registers for push + wires the notification tap→deep-link (RBT-072, native).
function NotificationBridge() {
  useNotifications();
  return null;
}

function AccountSessionBridge() {
  const { tokenStorage, userRepository } = useServices();
  useEffect(() => {
    let active = true;
    void tokenStorage.load().then(async (token) => {
      if (!active || !token || useAccountStore.getState().profile) return;
      try {
        const profile = await userRepository.getMe();
        if (active) useAccountStore.getState().setProfile(profile);
      } catch {
        // Expired or unavailable sessions remain guests; the booking flow stays public.
      }
    });
    return () => { active = false; };
  }, [tokenStorage, userRepository]);
  return null;
}

// RBT-001 shipped the router root; RBT-004 wraps this tree with the
// composition-root providers. RBT-072 adds the native notification bridge.
// RBT-096 adds Inter font loading for V2 "Brutalist Mono" design system.
export default function RootLayout() {
  const { fontsLoaded, fontError } = useInterFonts();

  // Wait for fonts to load (or error) before rendering the app
  if (!fontsLoaded && !fontError) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <AppProviders>
      <Fragment>
        <NotificationBridge />
        <AccountSessionBridge />
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar style="auto" />
      </Fragment>
    </AppProviders>
  );
}
