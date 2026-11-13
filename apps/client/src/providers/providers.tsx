/**
 * providers.tsx — composition of the app-wide providers (ARCHITECTURE §3, §11.7).
 *
 * Composes toast, server-data (TanStack `QueryClientProvider`), and DI
 * `ServiceProvider` providers inside a `SafeAreaProvider` so app routes share
 * toast feedback and can read `useSafeAreaInsets()` on native + web.
 *
 * TanStack landed in RBT-010; `createQueryClient()` now returns a real client.
 * The `queryClient` prop lets tests inject a retry-disabled client for
 * deterministic error-state assertions.
 */
import React, { useEffect, useMemo } from "react";
import {
  onlineManager,
  QueryClientProvider,
  type QueryClient,
} from "@tanstack/react-query";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { createContainer, type Container } from "@providers/container";
import { createQueryClient } from "@providers/query-client";
import { ServiceProvider } from "@providers/service-context";
import { ToastProvider } from "@presentation/components/design-system/Toast";
import { NativeStatusBarBackdrop } from "@presentation/components/NativeStatusBarBackdrop";

export interface AppProvidersProps {
  /** Override the container (tests inject mocks). */
  readonly container?: Container;
  /** Override the TanStack QueryClient (tests inject a retry-disabled client). */
  readonly queryClient?: QueryClient;
  readonly children: React.ReactNode;
}

/**
 * Wrap the subtree with the composition-root providers.
 *
 * Order (outer → inner): SafeAreaProvider → QueryClientProvider → ToastProvider
 * → ServiceProvider. TODO(RBT-003): add ThemeProvider once the theme lands.
 */
export function AppProviders({
  container,
  queryClient,
  children,
}: AppProvidersProps): React.ReactElement {
  const client = useMemo(
    () => queryClient ?? createQueryClient(),
    [queryClient],
  );
  const services = useMemo(() => container ?? createContainer(), [container]);

  useEffect(() => {
    onlineManager.setEventListener((setOnline) => {
      let active = true;
      let receivedNetworkEvent = false;
      const update = (isOnline: boolean | null): void => {
        if (active && isOnline !== null) setOnline(isOnline);
      };
      const unsubscribe = services.connectivity.subscribe((isOnline) => {
        receivedNetworkEvent = true;
        update(isOnline);
      });
      void services.connectivity
        .getIsOnline()
        .then((isOnline) => {
          if (!receivedNetworkEvent) update(isOnline);
        })
        .catch(() => undefined);
      return () => {
        active = false;
        unsubscribe();
      };
    });
    return () => {
      onlineManager.setEventListener(() => () => undefined);
    };
  }, [services.connectivity]);

  const serviceTree = (
    <ToastProvider>
      <ServiceProvider container={services}>{children}</ServiceProvider>
    </ToastProvider>
  );
  return (
    <SafeAreaProvider>
      <NativeStatusBarBackdrop />
      <QueryClientProvider client={client}>{serviceTree}</QueryClientProvider>
    </SafeAreaProvider>
  );
}
