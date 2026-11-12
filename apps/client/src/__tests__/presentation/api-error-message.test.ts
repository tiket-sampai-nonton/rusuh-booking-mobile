import { DomainError } from "@domain/errors/domain-error";
import { apiErrorMessage } from "@presentation/utils/api-error-message";

describe("apiErrorMessage", () => {
  it("turns browser fetch and CORS failures into safe connection guidance", () => {
    expect(apiErrorMessage(new TypeError("Failed to fetch"))).toBe(
      "Tidak dapat terhubung ke server. Periksa koneksi internet Anda, lalu coba lagi.",
    );
    expect(apiErrorMessage(new Error("CORS policy blocked the request"))).toBe(
      "Tidak dapat terhubung ke server. Periksa koneksi internet Anda, lalu coba lagi.",
    );
    expect(apiErrorMessage(new Error("Jaringan bermasalah"))).toBe(
      "Tidak dapat terhubung ke server. Periksa koneksi internet Anda, lalu coba lagi.",
    );
  });

  it("uses the mapped domain message instead of raw backend text", () => {
    const error = new DomainError({
      kind: "rate_limited",
      code: "RATE_LIMITED",
      userMessage: "Terlalu banyak permintaan. Coba lagi sebentar.",
    });
    expect(apiErrorMessage(error)).toBe(
      "Terlalu banyak permintaan. Coba lagi sebentar.",
    );
    expect(
      apiErrorMessage(new Error("RATE_LIMITED: raw backend message")),
    ).toBe("Terlalu banyak permintaan. Coba lagi sebentar.");
  });

  it("maps service failures and keeps unknown internals private", () => {
    expect(
      apiErrorMessage({ httpStatus: 400, message: "raw validation" }),
    ).toBe(
      "Permintaan tidak dapat diproses. Periksa informasi lalu coba lagi.",
    );
    expect(
      apiErrorMessage({ httpStatus: 500, message: "raw server error" }),
    ).toBe("Layanan sedang mengalami gangguan. Coba lagi sebentar.");
    expect(
      apiErrorMessage({ httpStatus: 503, message: "upstream failed" }),
    ).toBe("Layanan sedang mengalami gangguan. Coba lagi sebentar.");
    expect(apiErrorMessage(new Error("private stack details"))).toBe(
      "Terjadi kesalahan. Silakan coba lagi.",
    );
  });

  it("maps common HTTP errors and ignores malformed error objects", () => {
    expect(apiErrorMessage({ status: 401 })).toContain("Akses sesi");
    expect(apiErrorMessage({ status: 403 })).toContain("Akses sesi");
    expect(apiErrorMessage({ status: 404 })).toContain("Data tidak ditemukan");
    expect(apiErrorMessage({ status: 409 })).toContain("status terbaru");
    expect(apiErrorMessage({ status: 408 })).toContain("terlalu lama");
    expect(apiErrorMessage({ status: 429 })).toContain("terlalu lama");
    expect(apiErrorMessage(null, "Coba lagi nanti")).toBe("Coba lagi nanti");
    expect(apiErrorMessage("raw backend error", "Coba lagi nanti")).toBe(
      "Coba lagi nanti",
    );
    expect(apiErrorMessage({ userMessage: "Pesan aman" })).toBe("Pesan aman");
  });
});
