import type { EventStatus } from "@domain/repositories/event.repository";
import { ctaFor } from "@domain/rules/event-detail-cta";

describe("ctaFor — status-driven event-detail CTA", () => {
  it("AVAILABLE → enabled 'Masuk Antrean' primary CTA", () => {
    const cta = ctaFor("AVAILABLE");
    expect(cta.enabled).toBe(true);
    expect(cta.label).toBe("Masuk Antrean");
    expect(cta.intent).toBe("join");
  });

  it("SOLD_OUT → disabled 'Tiket Habis'", () => {
    const cta = ctaFor("SOLD_OUT");
    expect(cta.enabled).toBe(false);
    expect(cta.label).toBe("Tiket Habis");
    expect(cta.intent).toBe("soldout");
  });

  it("NOT_STARTED → disabled 'Belum Dibuka'", () => {
    const cta = ctaFor("NOT_STARTED");
    expect(cta.enabled).toBe(false);
    expect(cta.label).toBe("Belum Dibuka");
    expect(cta.intent).toBe("soon");
  });

  it("CLOSED → disabled 'Penjualan Ditutup'", () => {
    const cta = ctaFor("CLOSED");
    expect(cta.enabled).toBe(false);
    expect(cta.label).toBe("Penjualan Ditutup");
    expect(cta.intent).toBe("closed");
  });

  it("CANCELLED → disabled 'Event Dibatalkan'", () => {
    expect(ctaFor("CANCELLED")).toEqual({
      enabled: false,
      label: "Event Dibatalkan",
      intent: "closed",
    });
  });

  it("treats an unknown status defensively as disabled", () => {
    const cta = ctaFor("WAT" as EventStatus);
    expect(cta.enabled).toBe(false);
    expect(cta.label).toBe("Penjualan Ditutup");
  });

  it("maps every known status to a non-empty label", () => {
    const statuses: EventStatus[] = [
      "AVAILABLE",
      "SOLD_OUT",
      "NOT_STARTED",
      "CLOSED",
      "CANCELLED",
    ];
    for (const s of statuses) {
      expect(ctaFor(s).label.length).toBeGreaterThan(0);
    }
  });
});
