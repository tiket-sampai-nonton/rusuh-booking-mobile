/**
 * RBT-042 — useQueuePolling (presentation seam). Two layers:
 *   1. computeRefetchInterval (pure, no timers): terminal/admitted → false
 *      (poller STOPS); waiting → the jittered adaptive wait; no data → floor.
 *   2. A render test proving ONE poller per queueId (single query key, cancels
 *      on unmount) and that the hook reaches the backend only via the injected
 *      QueueRepository port.
 */
import React from "react";
import { Text } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, render, waitFor } from "@testing-library/react-native";

import type { Container } from "@providers/container";
import { ServiceProvider } from "@providers/service-context";
import type {
  QueueEntry,
  QueueRepository,
  QueueStatus,
} from "@domain/repositories/queue.repository";
import {
  DEFAULT_POLL_MS,
  MAX_JITTER_MS,
} from "@domain/rules/queue-polling";
import {
  computeRefetchInterval,
  isRecoverableConnectionError,
  useQueuePolling,
} from "@presentation/hooks/useQueuePolling";

function entry(status: QueueStatus, nextPollAfterMs = 2000): QueueEntry {
  return { queueId: "q-1", eventId: "evt-1", position: 1, status, nextPollAfterMs };
}

// -- 1. Pure refetch-interval decision (no timers) --------------------------

describe("RBT-042 computeRefetchInterval", () => {
  it("stops polling (false) once the entry is terminal", () => {
    expect(computeRefetchInterval(entry("LEFT"))).toBe(false);
    expect(computeRefetchInterval(entry("MISSED"))).toBe(false);
    expect(computeRefetchInterval(entry("SOLD_OUT"))).toBe(false);
    expect(computeRefetchInterval(entry("ENDED"))).toBe(false);
  });

  it("stops polling (false) once the entry is ADMITTED", () => {
    expect(computeRefetchInterval(entry("ADMITTED"))).toBe(false);
  });

  it("keeps polling on WAITING at the server-honoured adaptive wait", () => {
    const wait = computeRefetchInterval(entry("WAITING", 2000), false, () => 0);
    expect(wait).toBe(2000);
  });

  it("polls at the default fallback before the first entry resolves (no data)", () => {
    const wait = computeRefetchInterval(undefined, false, () => 0);
    expect(wait).toBe(DEFAULT_POLL_MS); // missing hint → 3000 fallback, with 0 jitter
  });

  it("jitter stays bounded while waiting", () => {
    for (let i = 0; i < 300; i++) {
      const wait = computeRefetchInterval(entry("WAITING", 2000));
      expect(typeof wait).toBe("number");
      if (typeof wait === "number") {
        expect(wait).toBeGreaterThanOrEqual(2000);
        expect(wait).toBeLessThan(2000 + MAX_JITTER_MS);
      }
    }
  });
});

describe("RBT-119 connection error classification", () => {
  it("keeps timeouts, network failures, rate limits, and server errors recoverable", () => {
    const timeout = Object.assign(new Error("request failed"), { httpStatus: 408 });
    const rateLimited = Object.assign(new Error("request failed"), { httpStatus: 429 });
    const serverError = Object.assign(new Error("request failed"), { httpStatus: 503 });
    const socketError = Object.assign(new Error("request failed"), { code: "ECONNRESET" });
    const fetchError = new Error("Failed to fetch");

    expect(isRecoverableConnectionError(new Error("fetch failed"))).toBe(true);
    expect(isRecoverableConnectionError(fetchError)).toBe(true);
    expect(isRecoverableConnectionError(timeout)).toBe(true);
    expect(isRecoverableConnectionError(rateLimited)).toBe(true);
    expect(isRecoverableConnectionError(serverError)).toBe(true);
    expect(isRecoverableConnectionError(socketError)).toBe(true);
  });

  it("does not label missing or client validation errors as connection loss", () => {
    const clientError = Object.assign(new Error("invalid queue"), { httpStatus: 400 });

    expect(isRecoverableConnectionError(null)).toBe(false);
    expect(isRecoverableConnectionError(clientError)).toBe(false);
  });
});

// -- 2. One-poller / port-only render test ----------------------------------

class CountingQueueRepository implements QueueRepository {
  getStatusCalls = 0;
  getQueueStatusCalls = 0;
  failQueueStatus = false;
  failNextStatus = false;
  position = 1;
  constructor(public status: QueueStatus) {}
  async join(eventId: string): Promise<QueueEntry> {
    return entry("WAITING");
  }
  async getStatus(queueId: string): Promise<QueueEntry> {
    this.getStatusCalls += 1;
    if (this.failNextStatus) {
      this.failNextStatus = false;
      throw new Error("connection timed out");
    }
    return { ...entry(this.status), queueId, position: this.position };
  }
  async getQueueStatus(): Promise<{ admissionRatePerMin: number }> {
    this.getQueueStatusCalls += 1;
    if (this.failQueueStatus) throw new Error("status unavailable");
    return { admissionRatePerMin: 1200 };
  }
  async leave(queueId: string): Promise<void> {
    void queueId;
  }
}

function makeContainer(repo: QueueRepository): Container {
  // Only queueRepository is exercised; the rest are never touched by the hook.
  return { queueRepository: repo } as unknown as Container;
}

function Harness({
  repo,
  onView,
  eventId = "evt-1",
}: {
  repo: QueueRepository;
  onView: (v: ReturnType<typeof useQueuePolling>) => void;
  eventId?: string;
}): React.ReactElement {
  const view = useQueuePolling("q-1", false, eventId);
  onView(view);
  return <Text>{view.entry?.status ?? "pending"}</Text>;
}

function renderHarness(repo: QueueRepository, onView: (v: any) => void) {
  // ADMITTED/terminal entries settle immediately so the poller stops after the
  // first fetch — no fake timers needed to prove "no request storm".
  const client = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { gcTime: Infinity },
    },
  });
  return render(
    <QueryClientProvider client={client}>
      <ServiceProvider container={makeContainer(repo)}>
        <Harness repo={repo} onView={onView} />
      </ServiceProvider>
    </QueryClientProvider>,
  );
}

describe("RBT-042 useQueuePolling render seam", () => {
  it("reaches the backend only via the injected QueueRepository port", async () => {
    const repo = new CountingQueueRepository("ADMITTED");
    let last: ReturnType<typeof useQueuePolling> | undefined;
    const { getByText } = renderHarness(repo, (v) => (last = v));

    await waitFor(() => expect(getByText("ADMITTED")).toBeTruthy());
    expect(repo.getStatusCalls).toBeGreaterThanOrEqual(1);
    expect(repo.getQueueStatusCalls).toBe(1);
    expect(last?.admissionRatePerMin).toBe(1200);
    expect(last?.isSettled).toBe(true);
  });

  it("keeps queue state available when the optional estimate configuration fails", async () => {
    const repo = new CountingQueueRepository("WAITING");
    repo.failQueueStatus = true;
    let last: ReturnType<typeof useQueuePolling> | undefined;
    const { unmount } = renderHarness(repo, (view) => (last = view));
    await waitFor(() => expect(last?.entry?.status).toBe("WAITING"));
    expect(last?.admissionRatePerMin).toBeUndefined();
    expect(last?.isError).toBe(false);
    unmount();
  });

  it("skips the optional status request when no event ID is available", async () => {
    const repo = new CountingQueueRepository("ADMITTED");
    let last: ReturnType<typeof useQueuePolling> | undefined;
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: Infinity } },
    });
    render(
      <QueryClientProvider client={client}>
        <ServiceProvider container={makeContainer(repo)}>
          <Harness repo={repo} eventId="" onView={(view) => (last = view)} />
        </ServiceProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(last?.entry?.status).toBe("ADMITTED"));
    expect(repo.getQueueStatusCalls).toBe(0);
    expect(last?.admissionRatePerMin).toBeUndefined();
  });

  it("keeps the last position on timeout, then refreshes the same queue after recovery", async () => {
    const repo = new CountingQueueRepository("WAITING");
    let last: ReturnType<typeof useQueuePolling> | undefined;
    const client = new QueryClient({
      defaultOptions: {
        queries: { retry: false, gcTime: Infinity },
        mutations: { gcTime: Infinity },
      },
    });
    render(
      <QueryClientProvider client={client}>
        <ServiceProvider container={makeContainer(repo)}>
          <Harness repo={repo} onView={(view) => (last = view)} />
        </ServiceProvider>
      </QueryClientProvider>,
    );

    await waitFor(() => expect(last?.entry?.status).toBe("WAITING"));
    repo.position = 9;
    repo.failNextStatus = true;
    await act(async () => {
      await client.refetchQueries({ queryKey: ["queue", "q-1", "evt-1"] });
    });

    await waitFor(() => expect(last?.isConnectionLost).toBe(true));
    expect(last?.entry?.position).toBe(1);
    const queueQuery = client.getQueryCache().find({
      queryKey: ["queue", "q-1", "evt-1"],
    });
    const cachedData = queueQuery?.state.data as { entry: QueueEntry } | undefined;
    expect(
      computeRefetchInterval(cachedData?.entry),
    ).not.toBe(false);

    repo.status = "ADMITTED";
    await act(async () => {
      await client.refetchQueries({ queryKey: ["queue", "q-1", "evt-1"] });
    });

    await waitFor(() => expect(last?.entry?.status).toBe("ADMITTED"));
    expect(last?.entry?.position).toBe(9);
    expect(last?.isConnectionLost).toBe(false);
    await waitFor(() => expect(last?.isReconnected).toBe(true));
    await waitFor(() => expect(last?.isReconnected).toBe(false), { timeout: 3500 });
  });

  it("stops after a single fetch for a settled (ADMITTED) entry — no storm", async () => {
    const repo = new CountingQueueRepository("ADMITTED");
    const { unmount } = renderHarness(repo, () => {});

    await waitFor(() => expect(repo.getStatusCalls).toBe(1));
    // Give any errant interval a chance to fire; it must not (poller stopped).
    await new Promise((r) => setTimeout(r, 1200));
    expect(repo.getStatusCalls).toBe(1);
    unmount(); // TanStack cancels the query on unmount (cancel-on-unmount AC).
  });

  it("exposes isSettled=false while WAITING (poller active)", async () => {
    const repo = new CountingQueueRepository("WAITING");
    let last: ReturnType<typeof useQueuePolling> | undefined;
    const { unmount } = renderHarness(repo, (v) => (last = v));
    await waitFor(() => expect(last?.entry?.status).toBe("WAITING"));
    expect(last?.isSettled).toBe(false);
    unmount(); // stop the (active) poller — cancel-on-unmount.
  });

  it("leave() delegates to the port through LeaveQueue", async () => {
    let leaveId: string | undefined;
    const repo = new CountingQueueRepository("ADMITTED");
    repo.leave = async (id: string) => {
      leaveId = id;
    };
    let last: ReturnType<typeof useQueuePolling> | undefined;
    const { unmount } = renderHarness(repo, (v) => (last = v));
    await waitFor(() => expect(last?.isSettled).toBe(true));
    await last!.leave();
    expect(leaveId).toBe("q-1");
    unmount();
  });
});
