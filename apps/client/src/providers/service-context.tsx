/**
 * ServiceContext — exposes the DI {@link Container} to presentation hooks
 * (ARCHITECTURE §3, §4.3). Hooks call `useServices()` and name no concrete
 * adapter; the composition root decides what is bound.
 */
import React, { createContext, useContext, useMemo } from "react";

import type { Container } from "@providers/container";
import { createContainer } from "@providers/container";

const ServiceContext = createContext<Container | null>(null);

export interface ServiceProviderProps {
  /** Override the container (tests inject mocks). Omitted → `createContainer()`. */
  readonly container?: Container;
  readonly children: React.ReactNode;
}

/** Provides the container to the subtree. */
export function ServiceProvider({
  container,
  children,
}: ServiceProviderProps): React.ReactElement {
  const value = useMemo(() => container ?? createContainer(), [container]);
  return (
    <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>
  );
}

/** Read the bound container. Throws if used outside a {@link ServiceProvider}. */
export function useServices(): Container {
  const ctx = useContext(ServiceContext);
  if (ctx === null) {
    throw new Error("useServices must be used within a ServiceProvider");
  }
  return ctx;
}
