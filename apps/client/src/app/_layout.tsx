import "../../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Fragment, useCallback, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";

import { NotificationBridge } from "@presentation/bridges/NotificationBridge";
import { AccountSessionBridge } from "@presentation/bridges/AccountSessionBridge";
import { useInterFonts } from "@presentation/theme/fonts";
import { AppProviders } from "@providers/providers";
import { NativeLaunchSplash } from "@presentation/components/NativeLaunchSplash";
import { rootLayoutStyles } from "@presentation/layout/RootLayout/style";

// RBT-001 shipped the router root; RBT-004 wraps this tree with the
// composition-root providers. RBT-072 adds the native notification bridge.
// RBT-096 adds Inter font loading for  "Brutalist Mono" design system.
export default function RootLayout() {
  const { fontsLoaded, fontError } = useInterFonts();
  const [showSplash, setShowSplash] = useState(Platform.OS !== "web");
  const finishSplash = useCallback(() => setShowSplash(false), []);

  return (
    <View style={rootLayoutStyles.root}>
      {fontsLoaded || fontError ? (
        <AppProviders>
          <Fragment>
            <NotificationBridge />
            <AccountSessionBridge />
            <Stack screenOptions={{ headerShown: false }} />
          </Fragment>
        </AppProviders>
      ) : (
        <View style={rootLayoutStyles.loading}>
          <ActivityIndicator size="large" color="#000000" />
        </View>
      )}
      <StatusBar style={showSplash ? "light" : "auto"} />
      {showSplash && Platform.OS !== "web" ? <NativeLaunchSplash onFinish={finishSplash} /> : null}
    </View>
  );
}
