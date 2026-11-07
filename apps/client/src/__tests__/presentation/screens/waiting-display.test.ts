/** RBT-043 — pure waiting-room display helpers (Bahasa Indonesia copy). */
import {
  claimErrorBody,
  claimErrorTitle,
  COPY,
  etaMinutesSeconds,
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
    expect(formatCount(Number.NaN)).toBe("—");
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
  it("uses Indonesian minute wording for the estimate", () => {
    expect(etaText(5, 1400)).toBe("~1 mnt");
    expect(etaText(3000, 1400)).toBe("~3 mnt");
  });
  it("does not invent an estimate when the server rate is missing or invalid", () => {
    expect(etaText(3000)).toBe("Belum tersedia");
    expect(etaText(3000, 0)).toBe("Belum tersedia");
    expect(etaText(3000, Number.NaN)).toBe("Belum tersedia");
    expect(etaMinutesSeconds(3000)).toBeUndefined();
  });
  it("uses server-provided admission rate for minute/second estimates", () => {
    expect(etaMinutesSeconds(3000, 1000)).toEqual({ minutes: 3, seconds: 0 });
    expect(etaMinutesSeconds(500, 1000)).toEqual({ minutes: 0, seconds: 30 });
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
  it("returns Indonesian copy per zone and defaults to GUARANTEED", () => {
    expect(zoneCopy("GUARANTEED")).toBe(ZONE_COPY.GUARANTEED);
    expect(zoneCopy("POSSIBLE").label).toBe("Zona kemungkinan");
    expect(zoneCopy("NOT_ENOUGH").icon).toBe("alert");
    expect(zoneCopy(undefined).label).toBe("Status tiket belum tersedia");
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
  it("titles sold-out and ended states in Indonesian", () => {
    expect(terminalTitle("SOLD_OUT")).toBe("Tiket Habis");
    expect(terminalTitle("ENDED")).toBe("Penjualan Berakhir");
    expect(terminalTitle("MISSED")).toBe("Penjualan Berakhir");
  });
  it("describes sold-out and ended states in Indonesian", () => {
    expect(terminalBody("SOLD_OUT")).toMatch(/tiket.*habis/i);
    expect(terminalBody("ENDED")).toMatch(/masa penjualan/i);
  });
  it("maps claim-error state to Indonesian title and body", () => {
    expect(claimErrorTitle("EVENT_SOLD_OUT")).toBe("Tiket Habis");
    expect(claimErrorTitle("TURN_MISSED")).toBe("Giliran Berakhir");
    expect(claimErrorTitle("UNKNOWN")).toBe("Gagal menghubungkan");
    expect(claimErrorBody("EVENT_SOLD_OUT")).toMatch(/tiketnya habis/i);
    expect(claimErrorBody("TURN_MISSED")).toMatch(/waktu.*memilih tiket/i);
    expect(claimErrorBody("UNKNOWN")).toMatch(/periksa koneksi/i);
  });
});

describe("COPY constants use Indonesian wording", () => {
  it("uses Indonesian queue labels and explains persisted positions", () => {
    expect(COPY.positionLabel).toBe("Posisimu");
    expect(COPY.persistenceSub).toBe(
      "Posisimu tersimpan. Kalau halaman tertutup, buka lagi tautan antrean ini untuk melanjutkan.",
    );
    expect(COPY.footnote).toBe(
      "Antrean berjalan sesuai urutan bergabung. Posisi diperbarui otomatis.",
    );
    expect(COPY.longWaitWarningText).not.toMatch(/10 menit/i);
  });
});
