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

  it("records session, booking (with amount) and payment method (with attempt)", () => {
    useSessionStore.getState().setSession("sess-1");
    useSessionStore.getState().setBooking("bk-1", 90000000);
    useSessionStore.getState().setPaymentMethod("QRIS", "pay-1");
    const s = useSessionStore.getState();
    expect(s.sessionId).toBe("sess-1");
    expect(s.bookingId).toBe("bk-1");
    expect(s.amountMinor).toBe(90000000);
    expect(s.paymentMethod).toBe("QRIS");
    expect(s.attemptId).toBe("pay-1");
  });

  it("reset clears everything", () => {
    const st = useSessionStore.getState();
    st.setQueue("evt-1", "q-1", "WAITING");
    st.setSession("sess-1");
    st.setBooking("bk-1", 90000000);
    st.setPaymentMethod("GOPAY", "pay-1");
    st.reset();
    const s = useSessionStore.getState();
    expect(s.eventId).toBeUndefined();
    expect(s.queueId).toBeUndefined();
    expect(s.queueStatus).toBeUndefined();
    expect(s.sessionId).toBeUndefined();
    expect(s.bookingId).toBeUndefined();
    expect(s.amountMinor).toBeUndefined();
    expect(s.paymentMethod).toBeUndefined();
    expect(s.attemptId).toBeUndefined();
  });
});
