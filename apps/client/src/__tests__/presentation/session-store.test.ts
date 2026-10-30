import { useSessionStore } from "@presentation/stores/session-store";

describe("session-store", () => {
  beforeEach(() => useSessionStore.getState().reset());

  it("records a queue join", () => {
    useSessionStore.getState().setQueue("evt-1", "q-1", "WAITING");
    const s = useSessionStore.getState();
    expect(s.eventId).toBe("evt-1");
    expect(s.queueId).toBe("q-1");
    expect(s.queueStatus).toBe("WAITING");
  });

  it("updates the queue status", () => {
    useSessionStore.getState().setQueue("evt-1", "q-1", "WAITING");
    useSessionStore.getState().setQueueStatus("ADMITTED");
    expect(useSessionStore.getState().queueStatus).toBe("ADMITTED");
  });

  it("records session, booking and payment method", () => {
    useSessionStore.getState().setSession("sess-1");
    useSessionStore.getState().setBooking("bk-1");
    useSessionStore.getState().setPaymentMethod("QRIS");
    const s = useSessionStore.getState();
    expect(s.sessionId).toBe("sess-1");
    expect(s.bookingId).toBe("bk-1");
    expect(s.paymentMethod).toBe("QRIS");
  });

  it("reset clears everything", () => {
    const st = useSessionStore.getState();
    st.setQueue("evt-1", "q-1", "WAITING");
    st.setSession("sess-1");
    st.setBooking("bk-1");
    st.setPaymentMethod("GOPAY");
    st.reset();
    const s = useSessionStore.getState();
    expect(s.eventId).toBeUndefined();
    expect(s.queueId).toBeUndefined();
    expect(s.queueStatus).toBeUndefined();
    expect(s.sessionId).toBeUndefined();
    expect(s.bookingId).toBeUndefined();
    expect(s.paymentMethod).toBeUndefined();
  });
});
