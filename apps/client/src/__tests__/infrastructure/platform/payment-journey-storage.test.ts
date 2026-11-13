import {
  InMemoryPaymentJourneyStorage,
  PlatformPaymentJourneyStorage,
} from "@infrastructure/platform/payment-journey-storage";

function installLocalStorage(initial?: string) {
  const values = new Map<string, string>();
  if (initial) values.set("rusuh.payment.booking-reference", initial);
  const storage = {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: storage,
  });
  return { storage, values };
}

describe("PaymentJourneyStorage", () => {
  afterEach(() => {
    Reflect.deleteProperty(globalThis, "localStorage");
  });

  it("persists only the booking and event references for web restoration", async () => {
    const { values } = installLocalStorage();
    const storage = new PlatformPaymentJourneyStorage("web");

    await storage.save({ bookingId: "booking-1", eventId: "event-1" });

    expect(await storage.load()).toEqual({
      bookingId: "booking-1",
      eventId: "event-1",
    });
    expect([...values.values()][0]).not.toContain("nik");
    expect([...values.values()][0]).not.toContain("email");
  });

  it("reads legacy plain booking references without inventing event data", async () => {
    installLocalStorage("booking-legacy");
    const storage = new PlatformPaymentJourneyStorage("web");

    expect(await storage.load()).toEqual({ bookingId: "booking-legacy" });
  });

  it("keeps the memory adapter aligned with the port", async () => {
    const storage = new InMemoryPaymentJourneyStorage();
    await storage.save({ bookingId: "booking-1", eventId: "event-1" });
    expect(await storage.load()).toEqual({
      bookingId: "booking-1",
      eventId: "event-1",
    });
    await storage.clear();
    expect(await storage.load()).toBeNull();
  });
});
