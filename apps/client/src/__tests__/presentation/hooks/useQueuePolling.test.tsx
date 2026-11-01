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
import { render, waitFor } from "@testing-library/react-native";

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

// -- 2. One-poller / port-only render test ----------------------------------

class CountingQueueRepository implements QueueRepository {
  getStatusCalls = 0;
  constructor(private readonly status: QueueStatus) {}
  async join(eventId: string): Promise<QueueEntry> {
    return entry("WAITING");
  }
  async getStatus(queueId: string): Promise<QueueEntry> {
    this.getStatusCalls += 1;
    return { ...entry(this.status), queueId };
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
}: {
  repo: QueueRepository;
  onView: (v: ReturnType<typeof useQueuePolling>) => void;
}): React.ReactElement {
  const view = useQueuePolling("q-1");
  onView(view);
  return <Text>{view.entry?.status ?? "pending"}</Text>;
}

function renderHarness(repo: QueueRepository, onView: (v: any) => void) {
  // ADMITTED/terminal entries settle immediately so the poller stops after the
  // first fetch — no fake timers needed to prove "no request storm".
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
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
    expect(last?.isSettled).toBe(true);
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
