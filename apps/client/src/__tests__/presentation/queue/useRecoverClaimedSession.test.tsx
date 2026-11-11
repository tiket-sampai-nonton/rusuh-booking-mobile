/**
 * useRecoverClaimedSession — resume a CLAIMED queue entry via
 * GET /booking-sessions/current (200 → session, 404 → expired, failure → error).
 */
import { act, renderHook, waitFor } from "@testing-library/react-native";
import React from "react";

import { mapError } from "@domain/errors/error-mapper";
import type { BookingRepository } from "@domain/repositories/booking.repository";
import type { Container } from "@providers/container";
import { createContainer } from "@providers/container";
import { ServiceProvider } from "@providers/service-context";
import { useRecoverClaimedSession } from "@presentation/hooks/useRecoverClaimedSession";

function setup(
  getCurrentSession: jest.Mock,
  eventId: string | undefined = "evt-1",
  enabled = true,
) {
  const container: Container = {
    ...createContainer({ useMocks: true }),
    bookingRepository: { getCurrentSession } as unknown as BookingRepository,
  };
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ServiceProvider container={container}>{children}</ServiceProvider>
  );
  return renderHook(() => useRecoverClaimedSession(eventId, enabled), {
    wrapper,
  });
}

describe("useRecoverClaimedSession", () => {
  it("returns the live session id", async () => {
    const get = jest.fn().mockResolvedValue({ sessionId: "sess-1" });
    const { result } = setup(get);
    await waitFor(() => expect(result.current.sessionId).toBe("sess-1"));
    expect(get).toHaveBeenCalledWith("evt-1");
  });

  it("reports expired when there is no session (404)", async () => {
    const { result } = setup(jest.fn().mockResolvedValue(null));
    await waitFor(() => expect(result.current.state).toBe("expired"));
    expect(result.current.sessionId).toBeUndefined();
  });

  it("reports expired when the BE answers SESSION_EXPIRED", async () => {
    const get = jest
      .fn()
      .mockRejectedValue(mapError({ code: "SESSION_EXPIRED" }));
    const { result } = setup(get);
    await waitFor(() => expect(result.current.state).toBe("expired"));
  });

  it("reports error on failure and retry looks the session up again", async () => {
    const get = jest
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValueOnce({ sessionId: "sess-2" });
    const { result } = setup(get);
    await waitFor(() => expect(result.current.state).toBe("error"));
    act(() => result.current.retry());
    await waitFor(() => expect(result.current.sessionId).toBe("sess-2"));
    expect(get).toHaveBeenCalledTimes(2);
  });

  it("does nothing when disabled or without an event id", () => {
    const get = jest.fn();
    setup(get, "evt-1", false);
    setup(get, "", true);
    expect(get).not.toHaveBeenCalled();
  });
});
