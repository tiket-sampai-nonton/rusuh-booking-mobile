import { isAllowedOrigin, isExternalScheme, parseBridgeMessage } from "./bridge";

describe("parseBridgeMessage", () => {
  it("menerima event yang valid", () => {
    expect(parseBridgeMessage('{"type":"PAYMENT_SUCCESS","bookingId":"b1"}')).toEqual({
      type: "PAYMENT_SUCCESS",
      bookingId: "b1",
    });
  });

  it.each(["not json", "null", '{"type":"HACK","bookingId":"b1"}', '{"type":"CLOSE"}', '{"type":"CLOSE","bookingId":""}'])(
    "menolak %s",
    (raw) => {
      expect(parseBridgeMessage(raw)).toBeNull();
    },
  );
});

describe("aturan WebView", () => {
  it("mengenali deeplink e-wallet", () => {
    expect(isExternalScheme("gojek://pay?x=1")).toBe(true);
    expect(isExternalScheme("https://rusuh.example/pay/b1")).toBe(false);
  });

  it("hanya origin aplikasi yang diizinkan", () => {
    expect(isAllowedOrigin("https://rusuh.example/pay/b1", "https://rusuh.example")).toBe(true);
    expect(isAllowedOrigin("https://evil.example/pay/b1", "https://rusuh.example")).toBe(false);
    expect(isAllowedOrigin("bukan-url", "https://rusuh.example")).toBe(false);
  });
});
