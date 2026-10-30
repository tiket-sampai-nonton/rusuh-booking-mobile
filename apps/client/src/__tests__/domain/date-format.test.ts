import {
  formatCountdown,
  formatDateID,
  formatTimeID,
} from "@domain/services/date-format";

describe("formatDateID", () => {
  it("formats an ISO date as DD-MMM-YYYY with Indonesian months", () => {
    expect(formatDateID("2026-12-01T12:00:00.000Z")).toBe("01-Des-2026");
    expect(formatDateID("2026-01-09T00:00:00.000Z")).toBe("09-Jan-2026");
    expect(formatDateID("2025-08-15T16:00:00.000Z")).toBe("15-Agu-2025");
  });

  it("returns empty string for nullish or invalid input", () => {
    expect(formatDateID(undefined)).toBe("");
    expect(formatDateID(null)).toBe("");
    expect(formatDateID("")).toBe("");
    expect(formatDateID("not-a-date")).toBe("");
  });
});

describe("formatTimeID", () => {
  it("formats the clock part as HH:MM WIB", () => {
    expect(formatTimeID("2026-12-01T18:05:00.000Z")).toBe("18:05 WIB");
    expect(formatTimeID("2026-12-01T09:00:00.000Z")).toBe("09:00 WIB");
  });

  it("returns empty string for nullish or invalid input", () => {
    expect(formatTimeID(undefined)).toBe("");
    expect(formatTimeID("nope")).toBe("");
  });
});

describe("formatCountdown", () => {
  it("formats milliseconds as MM:SS", () => {
    expect(formatCountdown(600000)).toBe("10:00");
    expect(formatCountdown(65000)).toBe("01:05");
    expect(formatCountdown(5000)).toBe("00:05");
  });

  it("clamps a negative remaining to 00:00", () => {
    expect(formatCountdown(-1000)).toBe("00:00");
    expect(formatCountdown(0)).toBe("00:00");
  });

  it("handles long durations beyond an hour's worth of minutes", () => {
    expect(formatCountdown(3_660_000)).toBe("61:00");
  });
});
