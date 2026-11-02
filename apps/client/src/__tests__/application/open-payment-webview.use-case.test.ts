import { OpenPaymentWebView } from "@application/payment/open-payment-webview.use-case";
import { DomainError } from "@domain/errors/domain-error";
import { MockPaymentRepository } from "@infrastructure/__fixtures__/mock-payment.repository";

describe("OpenPaymentWebView (RBT-062) + mock page-token exchange", () => {
  it("mints a one-time token + WebView URL, then exchanges it once", async () => {
    const repo = new MockPaymentRepository();
    const uc = new OpenPaymentWebView(repo);
    const token = await uc.createToken("bk-1");
    expect(token.pageToken).toMatch(/^pgt_bk-1_/);
    expect(token.pageUrl).toContain("/payment/bk-1");
    expect(token.pageUrl).toContain(token.pageToken); // URL carries the token
    // First exchange succeeds (token live).
    await expect(uc.exchange(token.pageToken)).resolves.toBeUndefined();
  });

  it("rejects a reused (consumed) or unknown token as PAYMENT_PAGE_TOKEN_INVALID", async () => {
    const repo = new MockPaymentRepository();
    const uc = new OpenPaymentWebView(repo);
    const token = await uc.createToken("bk-1");
    await uc.exchange(token.pageToken); // consume
    await expect(uc.exchange(token.pageToken)).rejects.toBeInstanceOf(DomainError);
    await expect(uc.exchange("never-minted")).rejects.toMatchObject({
      code: "PAYMENT_PAGE_TOKEN_INVALID",
    });
  });
});
