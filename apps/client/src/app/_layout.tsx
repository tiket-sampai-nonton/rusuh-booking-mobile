import "../../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Fragment, useCallback, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";

import { NotificationBridge } from "@presentation/bridges/NotificationBridge";
import { AccountSessionBridge } from "@presentation/bridges/AccountSessionBridge";
import { usePlusJakartaSansFonts } from "@presentation/theme/fonts";
import { brand } from "@presentation/theme";
import { AppProviders } from "@providers/providers";
import { NativeLaunchSplash } from "@presentation/components/NativeLaunchSplash";
import { rootLayoutStyles } from "@presentation/layout/RootLayout/style";

// RBT-001 shipped the router root; RBT-004 wraps this tree with the
// composition-root providers. RBT-072 adds the native notification bridge.
// Load the prototype's Plus Jakarta Sans family before rendering app content.
export default function RootLayout() {
  const { fontsLoaded, fontError } = usePlusJakartaSansFonts();
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
          <ActivityIndicator size="large" color={brand.purple} />
        </View>
      )}
      <StatusBar style={showSplash ? "light" : "auto"} />
      {showSplash && Platform.OS !== "web" ? (
        <NativeLaunchSplash onFinish={finishSplash} />
      ) : null}
    </View>
  );
}
