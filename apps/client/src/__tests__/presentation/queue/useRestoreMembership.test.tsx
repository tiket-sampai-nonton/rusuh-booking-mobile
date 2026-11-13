/**
 * RBT-041 — useRestoreMembership hook (RNTL renderHook).
 *
 * The restore-on-startup seam. Renders inside a ServiceProvider (fake
 * QueueRepository + InMemoryQueueMembership) + a real QueryClientProvider, and
 * asserts:
 *  - an ACTIVE persisted membership RESUMES: navigates once to the waiting
 *    room and exposes the resumed entry;
 *  - a TERMINAL persisted membership is CLEARED and NO navigation happens;
 *  - no persisted membership → no navigation, no resume;
 *  - a re-render does not double-navigate (navigate-once guard).
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

import type { QueueMembershipStorage } from "@domain/queue/queue-membership.port";
import type {
  QueueEntry,
  QueueRepository,
  QueueStatus,
} from "@domain/repositories/queue.repository";
import type { Container } from "@providers/container";
import { createContainer } from "@providers/container";
import { ServiceProvider } from "@providers/service-context";
import { InMemoryQueueMembership } from "@infrastructure/__fixtures__/in-memory-queue-membership";
import {
  useClearQueueMembership,
  useRestoreMembership,
} from "@presentation/hooks/useRestoreMembership";

let mockRouter = { push: jest.fn() };
jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
}));

class FakeQueueRepository implements QueueRepository {
  async claim(_queueId: string, eventId: string): Promise<string> {
    return eventId;
  }
  async heartbeat(_eventId: string): Promise<number | undefined> {
    return undefined;
  }
  public statusToReturn: QueueStatus = "WAITING";
  async join(eventId: string): Promise<QueueEntry> {
    return { queueId: `q-${eventId}`, eventId, position: 5, status: "WAITING" };
  }
  async getStatus(queueId: string): Promise<QueueEntry> {
    return {
      queueId,
      eventId: "evt-1",
      position: 3,
      status: this.statusToReturn,
    };
  }
  async getQueueStatus(): Promise<{ admissionRatePerMin?: number }> {
    return {};
  }
  async leave(_queueId: string): Promise<void> {
    void _queueId;
  }
}

function makeWrapper(repo: QueueRepository, storage: QueueMembershipStorage) {
  const base = createContainer({ useMocks: true });
  const container: Container = {
    ...base,
    queueRepository: repo,
    queueMembership: storage,
  };
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false, gcTime: Infinity },
    },
  });
  return function Wrapper({
    children,
  }: {
    children: React.ReactNode;
  }): React.ReactElement {
    return (
      <QueryClientProvider client={queryClient}>
        <ServiceProvider container={container}>{children}</ServiceProvider>
      </QueryClientProvider>
    );
  };
}

describe("useRestoreMembership", () => {
  beforeEach(() => {
    mockRouter = { push: jest.fn() };
  });

  it("resumes an ACTIVE membership and navigates once to the waiting room", async () => {
    const initialRouter = mockRouter;
    const repo = new FakeQueueRepository();
    repo.statusToReturn = "WAITING";
    const storage = new InMemoryQueueMembership();
    await storage.save({ eventId: "evt-1", queueId: "q-evt-1" });

    const { result, rerender } = renderHook(() => useRestoreMembership(), {
      wrapper: makeWrapper(repo, storage),
    });

    await waitFor(() => expect(result.current.resumed).not.toBeNull());
    expect(result.current.resumed?.entry.status).toBe("WAITING");
    expect(mockRouter.push).toHaveBeenCalledWith(
      "/waiting/evt-1?queueId=q-evt-1",
    );
    // Membership still present (active slot is not cleared).
    expect(await storage.load()).not.toBeNull();

    // A new router reference re-runs the effect; the queue-id guard still prevents duplicate navigation.
    const nextRouter = { push: jest.fn() };
    mockRouter = nextRouter;
    rerender({});
    expect(initialRouter.push).toHaveBeenCalledTimes(1);
    expect(nextRouter.push).not.toHaveBeenCalled();
  });

  it("clears a TERMINAL membership and does NOT navigate", async () => {
    const repo = new FakeQueueRepository();
    repo.statusToReturn = "ENDED";
    const storage = new InMemoryQueueMembership();
    await storage.save({ eventId: "evt-1", queueId: "q-evt-1" });

    const { result } = renderHook(() => useRestoreMembership(), {
      wrapper: makeWrapper(repo, storage),
    });

    await waitFor(() => expect(result.current.isRestoring).toBe(false));
    expect(result.current.resumed).toBeNull();
    expect(await storage.load()).toBeNull();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("leaves a CLAIMED entry for checkout-session recovery instead of reopening waiting", async () => {
    const repo = new FakeQueueRepository();
    repo.statusToReturn = "CLAIMED";
    const storage = new InMemoryQueueMembership();
    await storage.save({ eventId: "evt-1", queueId: "q-evt-1" });

    const { result } = renderHook(() => useRestoreMembership(), {
      wrapper: makeWrapper(repo, storage),
    });

    await waitFor(() =>
      expect(result.current.resumed?.entry.status).toBe("CLAIMED"),
    );
    expect(mockRouter.push).not.toHaveBeenCalled();
    expect(await storage.load()).toEqual({
      eventId: "evt-1",
      queueId: "q-evt-1",
    });
  });

  it("does nothing when no membership is persisted", async () => {
    const repo = new FakeQueueRepository();
    const storage = new InMemoryQueueMembership();

    const { result } = renderHook(() => useRestoreMembership(), {
      wrapper: makeWrapper(repo, storage),
    });

    await waitFor(() => expect(result.current.isRestoring).toBe(false));
    expect(result.current.resumed).toBeNull();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });

  it("does not restore an in-flight queue result after the membership is cleared", async () => {
    const repo = new FakeQueueRepository();
    let resolveStatus!: (entry: QueueEntry) => void;
    const status = new Promise<QueueEntry>((resolve) => {
      resolveStatus = resolve;
    });
    const getStatus = jest.spyOn(repo, "getStatus").mockReturnValue(status);
    const storage = new InMemoryQueueMembership();
    await storage.save({ eventId: "evt-1", queueId: "q-evt-1" });
    const { result } = renderHook(
      () => ({
        restore: useRestoreMembership(),
        clear: useClearQueueMembership(),
      }),
      { wrapper: makeWrapper(repo, storage) },
    );

    await waitFor(() => expect(getStatus).toHaveBeenCalled());
    await act(async () => result.current.clear());
    await act(async () => {
      resolveStatus({
        queueId: "q-evt-1",
        eventId: "evt-1",
        position: 3,
        status: "WAITING",
      });
      await status;
    });
    expect(result.current.restore.resumed).toBeNull();
    expect(await storage.load()).toBeNull();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
