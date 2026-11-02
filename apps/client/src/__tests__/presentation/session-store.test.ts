import { useSessionStore } from "@presentation/stores/session-store";

describe("presentation/session-store", () => {
  beforeEach(() => useSessionStore.getState().reset());

  it("records the funnel handoff ids across stages", () => {
    const s = useSessionStore.getState();
    s.setQueue("evt-1", "q-1", "WAITING");
    expect(useSessionStore.getState().eventId).toBe("evt-1");
    expect(useSessionStore.getState().queueId).toBe("q-1");

    s.setQueueStatus("ADMITTED");
    expect(useSessionStore.getState().queueStatus).toBe("ADMITTED");

    s.setSession("sess-1");
    expect(useSessionStore.getState().sessionId).toBe("sess-1");

    s.setBooking("b-1", 4500000);
    expect(useSessionStore.getState().bookingId).toBe("b-1");
    expect(useSessionStore.getState().amountMinor).toBe(4500000);

    s.setPaymentMethod("QRIS", "att-1");
    expect(useSessionStore.getState().paymentMethod).toBe("QRIS");
    expect(useSessionStore.getState().attemptId).toBe("att-1");

    s.setOrderDetail("3171********1234", 2);
    expect(useSessionStore.getState().buyerNikMasked).toBe("3171********1234");
    expect(useSessionStore.getState().ticketCount).toBe(2);
  });

  it("stores only a MASKED buyer NIK (SECURITY §3)", () => {
    useSessionStore.getState().setOrderDetail("3171********1234", 1);
    const state = useSessionStore.getState();
    expect(state.buyerNikMasked).toMatch(/\*/);
    expect(state).not.toHaveProperty("buyerNik");
  });

  it("reset clears every field (terminal: success/expiry/cancel)", () => {
    const s = useSessionStore.getState();
    s.setQueue("evt-1", "q-1", "WAITING");
    s.setSession("sess-1");
    s.setBooking("b-1", 1);
    s.reset();
    const after = useSessionStore.getState();
    expect(after.eventId).toBeUndefined();
    expect(after.queueId).toBeUndefined();
    expect(after.sessionId).toBeUndefined();
    expect(after.bookingId).toBeUndefined();
    expect(after.amountMinor).toBeUndefined();
    expect(after.paymentMethod).toBeUndefined();
    expect(after.attemptId).toBeUndefined();
    expect(after.buyerNikMasked).toBeUndefined();
    expect(after.ticketCount).toBeUndefined();
  });
});
