/** RBT-043 — pure waiting-room display helpers (V2 English copy). */
import {
  claimErrorBody,
  claimErrorTitle,
  COPY,
  etaText,
  formatCount,
  peopleAhead,
  ringProgress,
  terminalBody,
  terminalTitle,
  zoneCopy,
  ZONE_COPY,
} from "@presentation/screens/Waiting/display";

describe("formatCount", () => {
  it("groups with the id-ID locale and floors to a non-negative integer", () => {
    expect(formatCount(0)).toBe("0");
    expect(formatCount(1234)).toMatch(/1.234/); // id-ID uses "." as thousands sep
    expect(formatCount(-5)).toBe("0");
    expect(formatCount(Number.NaN)).toBe("0");
  });
});

describe("peopleAhead", () => {
  it("is position - 1, never negative", () => {
    expect(peopleAhead(42)).toBe(41);
    expect(peopleAhead(1)).toBe(0);
    expect(peopleAhead(0)).toBe(0);
  });
});

describe("etaText", () => {
  it("is 'Ready!' at the front", () => {
    expect(etaText(0)).toBe("Ready!");
    expect(etaText(-3)).toBe("Ready!");
  });
  it("is '~1 min' for a small queue and '~N min' beyond the rate", () => {
    // V2 uses 'min' not 'mnt'
    expect(etaText(5)).toBe("~1 min");
    expect(etaText(3000)).toBe("~3 min");
  });
});

describe("ringProgress", () => {
  it("is full at the front and monotonic-decreasing further back, clamped 0..1", () => {
    expect(ringProgress(0)).toBe(1);
    const near = ringProgress(5);
    const far = ringProgress(500);
    expect(near).toBeGreaterThan(far);
    expect(far).toBeGreaterThanOrEqual(0);
    expect(near).toBeLessThanOrEqual(1);
  });
});

describe("zoneCopy", () => {
  it("returns V2 English copy per zone and defaults to GUARANTEED", () => {
    expect(zoneCopy("GUARANTEED")).toBe(ZONE_COPY.GUARANTEED);
    // V2: "Possible Zone" instead of Bahasa "Masih mungkin."
    expect(zoneCopy("POSSIBLE").label).toBe("Possible Zone");
    expect(zoneCopy("NOT_ENOUGH").icon).toBe("🔴");
    expect(zoneCopy(undefined)).toBe(ZONE_COPY.GUARANTEED);
  });
  it("carries an icon + label + body for every zone (never color-only)", () => {
    for (const z of ["GUARANTEED", "POSSIBLE", "NOT_ENOUGH"] as const) {
      const c = ZONE_COPY[z];
      expect(c.icon.length).toBeGreaterThan(0);
      expect(c.label.length).toBeGreaterThan(0);
      expect(c.body.length).toBeGreaterThan(0);
    }
  });
});

describe("terminal + claim-error copy", () => {
  it("titles sold-out vs ended (V2 English)", () => {
    // V2: "Sold Out" and "Sale Ended" instead of Bahasa
    expect(terminalTitle("SOLD_OUT")).toBe("Sold Out");
    expect(terminalTitle("ENDED")).toBe("Sale Ended");
    expect(terminalTitle("MISSED")).toBe("Sale Ended");
  });
  it("bodies sold-out vs ended (V2 English)", () => {
    // V2 English phrases
    expect(terminalBody("SOLD_OUT")).toMatch(/all tickets/i);
    expect(terminalBody("ENDED")).toMatch(/sale period/i);
  });
  it("maps claim-error state to title + body (V2 English)", () => {
    // V2: "Sold Out" and "Turn Expired" instead of Bahasa
    expect(claimErrorTitle("EVENT_SOLD_OUT")).toBe("Sold Out");
    expect(claimErrorTitle("TURN_MISSED")).toBe("Turn Expired");
    expect(claimErrorTitle("UNKNOWN")).toBe("Turn Expired");
    // V2 English body copy
    expect(claimErrorBody("EVENT_SOLD_OUT")).toMatch(/tickets sold out/i);
    expect(claimErrorBody("TURN_MISSED")).toMatch(/didn't proceed/i);
    expect(claimErrorBody("UNKNOWN")).toMatch(/didn't proceed/i);
  });
});

describe("COPY constants match the V2 prototype verbatim", () => {
  it("has the exact V2 English strings", () => {
    // V2 uses English labels
    expect(COPY.positionLabel).toBe("Your Position");
    expect(COPY.persistenceSub).toBe(
      "Your position is safely stored on the server — refreshing or closing/reopening the tab won't remove you from the queue.",
    );
    expect(COPY.footnote).toBe(
      "First-Come-First-Served queue. Queue tokens are issued & validated by the server. Adaptive polling follows nextPollAfterMs from server.",
    );
  });
});
