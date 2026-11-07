import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import React, { type ReactNode } from "react";

import type {
  EventDetail,
  EventRepository,
} from "@domain/repositories/event.repository";
import { createContainer } from "@providers/container";
import { ServiceProvider } from "@providers/service-context";
import { useEventDetail } from "@presentation/hooks/useEventDetail";

const detail: EventDetail = {
  id: "evt-1",
  slug: "e",
  name: "Rusuh Fest 2026",
  salesStartsAt: "2026-11-01T00:00:00.000Z",
  salesEndsAt: "2026-11-30T23:59:59.000Z",
  status: "AVAILABLE",
  minPriceMinor: 45000000,
};

function wrapper(eventRepository: EventRepository) {
  const base = createContainer({ useMocks: true });
  const container = { ...base, eventRepository };
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { gcTime: Infinity },
    },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ServiceProvider container={container}>{children}</ServiceProvider>
      </QueryClientProvider>
    );
  };
}

describe("useEventDetail", () => {
  it("resolves the event detail via the use case", async () => {
    const repo: EventRepository = {
      listEvents: async () => [],
      getEventDetail: async () => detail,
    };
    const { result } = renderHook(() => useEventDetail("evt-1"), {
      wrapper: wrapper(repo),
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(detail);
  });

  it("surfaces an error when the fetch fails", async () => {
    const repo: EventRepository = {
      listEvents: async () => [],
      getEventDetail: async () => {
        throw new Error("not found");
      },
    };
    const { result } = renderHook(() => useEventDetail("nope"), {
      wrapper: wrapper(repo),
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("not found");
  });

  it("stays idle for an empty event id", async () => {
    const repo: EventRepository = {
      listEvents: async () => [],
      getEventDetail: async () => detail,
    };
    const { result } = renderHook(() => useEventDetail(""), {
      wrapper: wrapper(repo),
    });
    // `enabled: false` → the query never fetches.
    expect(result.current.fetchStatus).toBe("idle");
    expect(result.current.data).toBeUndefined();
  });
});
