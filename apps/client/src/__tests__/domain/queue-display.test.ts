import {
  etaText,
  isAdmitted,
  isTerminal,
  phaseFor,
  pollIntervalMs,
  terminalMessage,
  zoneCopy,
} from "@domain/rules/queue-display";
import type { QueueStatus } from "@domain/repositories/queue.repository";

describe("phaseFor / isAdmitted / isTerminal", () => {
  it("maps WAITING to the waiting phase", () => {
    expect(phaseFor("WAITING")).toBe("waiting");
    expect(isAdmitted("WAITING")).toBe(false);
    expect(isTerminal("WAITING")).toBe(false);
  });

  it("maps ADMITTED and CLAIMED to the admitted phase", () => {
    expect(phaseFor("ADMITTED")).toBe("admitted");
    expect(phaseFor("CLAIMED")).toBe("admitted");
    expect(isAdmitted("ADMITTED")).toBe(true);
    expect(isAdmitted("CLAIMED")).toBe(true);
  });

  it("maps every terminal status to the terminal phase", () => {
    const terminals: QueueStatus[] = [
      "MISSED",
      "LEFT",
      "SOLD_OUT",
      "CLOSED",
      "COMPLETED",
      "ENDED",
    ];
    for (const s of terminals) {
      expect(phaseFor(s)).toBe("terminal");
      expect(isTerminal(s)).toBe(true);
      expect(isAdmitted(s)).toBe(false);
    }
  });
});

describe("terminalMessage", () => {
  it("returns the right Bahasa copy per terminal status", () => {
    expect(terminalMessage("SOLD_OUT")).toMatch(/habis terjual/i);
    expect(terminalMessage("MISSED")).toMatch(/terlewat/i);
    expect(terminalMessage("CLOSED")).toMatch(/berakhir/i);
    expect(terminalMessage("ENDED")).toMatch(/berakhir/i);
    expect(terminalMessage("LEFT")).toMatch(/keluar/i);
    expect(terminalMessage("COMPLETED")).toMatch(/selesai/i);
  });

  it("falls back for a non-terminal status (defensive)", () => {
    expect(terminalMessage("WAITING")).toBe("Antrean berakhir.");
  });
});

describe("zoneCopy", () => {
  it("returns copy for each zone with the right tone", () => {
    expect(zoneCopy("GUARANTEED")?.tone).toBe("ok");
    expect(zoneCopy("POSSIBLE")?.tone).toBe("warn");
    expect(zoneCopy("NOT_ENOUGH")?.tone).toBe("error");
    expect(zoneCopy("GUARANTEED")?.label).toBe("Zona Aman");
  });

  it("returns null when there is no zone hint", () => {
    expect(zoneCopy(undefined)).toBeNull();
  });
});

describe("pollIntervalMs", () => {
  it("honours a valid server nextPollAfterMs (clamped to [1s,15s])", () => {
    expect(pollIntervalMs({ position: 5, nextPollAfterMs: 2000 })).toBe(2000);
    expect(pollIntervalMs({ position: 5, nextPollAfterMs: 500 })).toBe(1000);
    expect(pollIntervalMs({ position: 5, nextPollAfterMs: 99999 })).toBe(15000);
  });

  it("falls back on position when the server gives no hint", () => {
    expect(pollIntervalMs({ position: 100 })).toBe(8000);
    expect(pollIntervalMs({ position: 25 })).toBe(4000);
    expect(pollIntervalMs({ position: 3 })).toBe(2000);
  });

  it("ignores a non-positive server hint and uses the fallback", () => {
    expect(pollIntervalMs({ position: 3, nextPollAfterMs: 0 })).toBe(2000);
  });
});

describe("etaText", () => {
  it("renders seconds for a short queue", () => {
    expect(etaText(5)).toBe("± 15 detik");
  });

  it("renders minutes for a long queue", () => {
    expect(etaText(40)).toBe("± 2 menit");
  });

  it("says 'Sekarang' at the front", () => {
    expect(etaText(0)).toBe("Sekarang");
    expect(etaText(-1)).toBe("Sekarang");
  });
});
