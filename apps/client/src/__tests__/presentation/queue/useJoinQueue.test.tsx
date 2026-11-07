/**
 * RBT-041 — useJoinQueue hook (RNTL renderHook).
 *
 * Renders the hook inside a ServiceProvider (fake QueueRepository +
 * InMemoryQueueMembership) + a real QueryClientProvider, and asserts:
 *  - a join reaches the backend only via the injected QueueRepository port;
 *  - on success the membership is PERSISTED through the storage port;
 *  - on success it navigates to `/waiting/<eventId>?queueId=<id>`;
 *  - a join failure surfaces the error and navigates NOWHERE.
 */
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

import type { QueueMembershipStorage } from "@domain/queue/queue-membership.port";
import type {
  QueueEntry,
  QueueRepository,
} from "@domain/repositories/queue.repository";
import type { Container } from "@providers/container";
import { createContainer } from "@providers/container";
import { ServiceProvider } from "@providers/service-context";
import { InMemoryQueueMembership } from "@infrastructure/__fixtures__/in-memory-queue-membership";
import { useJoinQueue } from "@presentation/hooks/useJoinQueue";

const mockRouter = { push: jest.fn() };
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
  public joinCalls: string[] = [];
  public joinError: Error | null = null;
  async join(eventId: string): Promise<QueueEntry> {
    this.joinCalls.push(eventId);
    if (this.joinError) throw this.joinError;
    return { queueId: `q-${eventId}`, eventId, position: 5, status: "WAITING" };
  }
  async getStatus(queueId: string): Promise<QueueEntry> {
    return { queueId, eventId: "evt-1", position: 1, status: "WAITING" };
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
      mutations: { retry: false, gcTime: Infinity },
      queries: { retry: false, gcTime: Infinity },
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

describe("useJoinQueue", () => {
  beforeEach(() => mockRouter.push.mockReset());

  it("joins via the port, persists the membership, and routes to the waiting room", async () => {
    const repo = new FakeQueueRepository();
    const storage = new InMemoryQueueMembership();
    const { result } = renderHook(() => useJoinQueue(), {
      wrapper: makeWrapper(repo, storage),
    });

    result.current.mutate("evt-9");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(repo.joinCalls).toEqual(["evt-9"]);
    expect(await storage.load()).toEqual({
      eventId: "evt-9",
      queueId: "q-evt-9",
    });
    expect(mockRouter.push).toHaveBeenCalledWith(
      "/waiting/evt-9?queueId=q-evt-9",
    );
  });

  it("surfaces the error and navigates nowhere when the join fails", async () => {
    const repo = new FakeQueueRepository();
    repo.joinError = new Error("join rejected");
    const storage = new InMemoryQueueMembership();
    const { result } = renderHook(() => useJoinQueue(), {
      wrapper: makeWrapper(repo, storage),
    });

    result.current.mutate("evt-9");

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe("join rejected");
    expect(await storage.load()).toBeNull();
    expect(mockRouter.push).not.toHaveBeenCalled();
  });
});
