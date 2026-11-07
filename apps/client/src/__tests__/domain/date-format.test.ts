import {
  formatCountdown,
  formatDateID,
  formatTimeID,
} from "@domain/services/date-format";

describe("formatDateID", () => {
  it("formats an ISO timestamp as DD MMM YYYY with Indonesian months", () => {
    expect(formatDateID("2026-12-01T12:00:00.000Z")).toBe("01 Des 2026");
    expect(formatDateID("2025-08-15T16:00:00.000Z")).toBe("15 Agu 2025");
    expect(formatDateID("2027-01-10T13:00:00.000Z")).toBe("10 Jan 2027");
  });

  it("returns an empty string for missing or invalid input", () => {
    expect(formatDateID(undefined)).toBe("");
    expect(formatDateID(null)).toBe("");
    expect(formatDateID("")).toBe("");
    expect(formatDateID("not-a-date")).toBe("");
  });
});

describe("formatTimeID", () => {
  it("formats the clock part as HH:MM WIB (UTC-based)", () => {
    expect(formatTimeID("2026-12-01T12:05:00.000Z")).toBe("12:05 WIB");
    expect(formatTimeID("2026-12-01T09:00:00.000Z")).toBe("09:00 WIB");
  });

  it("returns an empty string for missing or invalid input", () => {
    expect(formatTimeID(undefined)).toBe("");
    expect(formatTimeID("nope")).toBe("");
  });
});

describe("formatCountdown", () => {
  it("formats remaining milliseconds as MM:SS", () => {
    expect(formatCountdown(0)).toBe("00:00");
    expect(formatCountdown(65_000)).toBe("01:05");
    expect(formatCountdown(600_000)).toBe("10:00");
  });

  it("clamps a negative value to 00:00", () => {
    expect(formatCountdown(-5000)).toBe("00:00");
  });
});
