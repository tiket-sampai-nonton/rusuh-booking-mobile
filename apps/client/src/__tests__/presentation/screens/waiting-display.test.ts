/** RBT-043 — pure waiting-room display helpers (Bahasa Indonesia copy). */
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
  it("uses Indonesian minute wording for the estimate", () => {
    expect(etaText(5)).toBe("~1 menit");
    expect(etaText(3000)).toBe("~3 menit");
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
    expect(zoneCopy("POSSIBLE").label).toBe("Zona Cadangan");
    expect(zoneCopy("NOT_ENOUGH").icon).toBe("alert");
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
  it("titles sold-out and ended states in Indonesian", () => {
    expect(terminalTitle("SOLD_OUT")).toBe("Tiket Habis");
    expect(terminalTitle("ENDED")).toBe("Penjualan Berakhir");
    expect(terminalTitle("MISSED")).toBe("Penjualan Berakhir");
  });
  it("describes sold-out and ended states in Indonesian", () => {
    expect(terminalBody("SOLD_OUT")).toMatch(/semua tiket/i);
    expect(terminalBody("ENDED")).toMatch(/masa penjualan/i);
  });
  it("maps claim-error state to Indonesian title and body", () => {
    expect(claimErrorTitle("EVENT_SOLD_OUT")).toBe("Tiket Habis");
    expect(claimErrorTitle("TURN_MISSED")).toBe("Giliran Berakhir");
    expect(claimErrorTitle("UNKNOWN")).toBe("Giliran Berakhir");
    expect(claimErrorBody("EVENT_SOLD_OUT")).toMatch(/tiket habis/i);
    expect(claimErrorBody("TURN_MISSED")).toMatch(/belum memilih tiket/i);
    expect(claimErrorBody("UNKNOWN")).toMatch(/belum memilih tiket/i);
  });
});

describe("COPY constants use Indonesian wording", () => {
  it("uses Indonesian queue labels and explains persisted positions", () => {
    expect(COPY.positionLabel).toBe("Posisi Anda");
    expect(COPY.persistenceSub).toBe(
      "Posisi Anda tersimpan dengan aman di server. Memuat ulang atau menutup halaman tidak akan menghapus antrean Anda.",
    );
    expect(COPY.footnote).toBe(
      "Antrean dilayani sesuai urutan kedatangan. Token antrean diterbitkan dan divalidasi server. Pembaruan mengikuti jadwal dari server.",
    );
  });
});
