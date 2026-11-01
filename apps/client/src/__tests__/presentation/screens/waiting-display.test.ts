/** RBT-043 — pure waiting-room display helpers. */
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
  it("is 'Siap!' at the front", () => {
    expect(etaText(0)).toBe("Siap!");
    expect(etaText(-3)).toBe("Siap!");
  });
  it("is '~1 mnt' for a small queue and '~N mnt' beyond the rate", () => {
    expect(etaText(5)).toBe("~1 mnt");
    expect(etaText(3000)).toBe("~3 mnt");
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
  it("returns verbatim copy per zone and defaults to GUARANTEED", () => {
    expect(zoneCopy("GUARANTEED")).toBe(ZONE_COPY.GUARANTEED);
    expect(zoneCopy("POSSIBLE").label).toBe("Masih mungkin.");
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
  it("titles sold-out vs ended", () => {
    expect(terminalTitle("SOLD_OUT")).toBe("Tiket habis");
    expect(terminalTitle("ENDED")).toBe("Antrean berakhir");
    expect(terminalTitle("MISSED")).toBe("Antrean berakhir");
  });
  it("bodies sold-out vs ended", () => {
    expect(terminalBody("SOLD_OUT")).toMatch(/Cari event lain/);
    expect(terminalBody("ENDED")).toMatch(/Masuk antrean lagi/);
  });
  it("maps claim-error state to title + body", () => {
    expect(claimErrorTitle("EVENT_SOLD_OUT")).toBe("Tiket habis");
    expect(claimErrorTitle("TURN_MISSED")).toBe("Antrean berakhir");
    expect(claimErrorTitle("UNKNOWN")).toBe("Antrean berakhir");
    expect(claimErrorBody("EVENT_SOLD_OUT")).toMatch(/Cari event lain/);
    expect(claimErrorBody("TURN_MISSED")).toMatch(/Giliranmu terlewat/);
    expect(claimErrorBody("UNKNOWN")).toMatch(/Giliranmu terlewat/);
  });
});

describe("COPY constants match the prototype verbatim", () => {
  it("has the exact Bahasa strings", () => {
    expect(COPY.positionLabel).toBe("Posisimu");
    expect(COPY.persistenceSub).toBe(
      "Posisimu tersimpan aman di server — refresh atau tutup-buka tab tidak akan menghapus antreanmu.",
    );
    expect(COPY.footnote).toBe(
      "Antrean First-Come-First-Served. Token antrean diterbitkan & divalidasi server. Polling adaptif mengikuti nextPollAfterMs dari server.",
    );
  });
});
