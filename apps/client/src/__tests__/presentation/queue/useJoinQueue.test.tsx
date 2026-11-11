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
import type { BookingRepository } from "@domain/repositories/booking.repository";
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
  public joinStatus: QueueEntry["status"] = "WAITING";
  async join(eventId: string): Promise<QueueEntry> {
    this.joinCalls.push(eventId);
    if (this.joinError) throw this.joinError;
    return {
      queueId: `q-${eventId}`,
      eventId,
      position: 5,
      status: this.joinStatus,
    };
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

function makeWrapper(
  repo: QueueRepository,
  storage: QueueMembershipStorage,
  bookings?: Pick<BookingRepository, "getCurrentSession">,
) {
  const base = createContainer({ useMocks: true });
  const container: Container = {
    ...base,
    queueRepository: repo,
    queueMembership: storage,
    ...(bookings && { bookingRepository: bookings as BookingRepository }),
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

  describe("join returns an already CLAIMED entry", () => {
    function joinClaimed(session: { sessionId: string } | null | Error) {
      const repo = new FakeQueueRepository();
      repo.joinStatus = "CLAIMED";
      const getCurrentSession = jest.fn(async () => {
        if (session instanceof Error) throw session;
        return session as never;
      });
      const hook = renderHook(() => useJoinQueue(), {
        wrapper: makeWrapper(repo, new InMemoryQueueMembership(), {
          getCurrentSession,
        }),
      });
      hook.result.current.mutate("evt-9");
      return { hook, getCurrentSession };
    }

    it("goes straight to checkout when the session is still alive", async () => {
      const { getCurrentSession } = joinClaimed({ sessionId: "sess-7" });
      await waitFor(() =>
        expect(mockRouter.push).toHaveBeenCalledWith("/checkout/sess-7"),
      );
      expect(getCurrentSession).toHaveBeenCalledWith("evt-9");
      expect(mockRouter.push).toHaveBeenCalledTimes(1);
    });

    it.each([
      ["no live session (404)", null],
      ["lookup failure", new Error("network")],
    ])("falls back to the waiting room on %s", async (_name, session) => {
      joinClaimed(session);
      await waitFor(() =>
        expect(mockRouter.push).toHaveBeenCalledWith(
          "/waiting/evt-9?queueId=q-evt-9",
        ),
      );
    });
  });
});
