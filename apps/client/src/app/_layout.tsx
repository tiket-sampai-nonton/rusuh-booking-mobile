import "../../global.css";

import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Fragment, useCallback, useState } from "react";
import { ActivityIndicator, Platform, View } from "react-native";

import { NotificationBridge } from "@presentation/bridges/NotificationBridge";
import { AccountSessionBridge } from "@presentation/bridges/AccountSessionBridge";
import { QueueMembershipBridge } from "@presentation/bridges/QueueMembershipBridge";
import { usePlusJakartaSansFonts } from "@presentation/theme/fonts";
import { brand } from "@presentation/theme";
import { AppProviders } from "@providers/providers";
import { NativeLaunchSplash } from "@presentation/components/NativeLaunchSplash";
import { StartupUpdateBridge } from "@presentation/bridges/StartupUpdateBridge";
import { rootLayoutStyles } from "@presentation/layout/RootLayout/style";

// RBT-001 shipped the router root; RBT-004 wraps this tree with the
// composition-root providers. RBT-072 adds the native notification bridge.
// Load the prototype's Plus Jakarta Sans family before rendering app content.
export default function RootLayout() {
  const { fontsLoaded, fontError } = usePlusJakartaSansFonts();
  const [showSplash, setShowSplash] = useState(Platform.OS !== "web");
  const [startupUpdateComplete, setStartupUpdateComplete] = useState(
    Platform.OS === "web",
  );
  const [startupUpdateStatus, setStartupUpdateStatus] = useState("Memuat");
  const [startupBuildLabel, setStartupBuildLabel] =
    useState("PREPROD 0.0.0.000");
  const finishSplash = useCallback(() => setShowSplash(false), []);
  const finishStartupUpdate = useCallback(
    () => setStartupUpdateComplete(true),
    [],
  );

  return (
    <View style={rootLayoutStyles.root}>
      {fontsLoaded || fontError ? (
        <AppProviders>
          <Fragment>
            {Platform.OS !== "web" ? (
              <StartupUpdateBridge
                onComplete={finishStartupUpdate}
                onStatusChange={setStartupUpdateStatus}
                onBuildLabelChange={setStartupBuildLabel}
              />
            ) : null}
            <NotificationBridge />
            <AccountSessionBridge />
            <QueueMembershipBridge />
            <Stack screenOptions={{ headerShown: false }} />
          </Fragment>
        </AppProviders>
      ) : (
        <View style={rootLayoutStyles.loading}>
          <ActivityIndicator size="large" color={brand.primary} />
        </View>
      )}
      <StatusBar style="dark" backgroundColor="#FFFFFF" translucent={false} />
      {showSplash && Platform.OS !== "web" ? (
        <NativeLaunchSplash
          onFinish={finishSplash}
          isReadyToExit={
            Boolean(fontsLoaded || fontError) && startupUpdateComplete
          }
          statusText={startupUpdateStatus}
          buildLabel={startupBuildLabel}
        />
      ) : null}
    </View>
  );
}
