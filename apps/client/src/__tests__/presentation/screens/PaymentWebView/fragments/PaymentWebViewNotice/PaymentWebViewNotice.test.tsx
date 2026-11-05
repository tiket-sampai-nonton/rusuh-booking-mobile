import { render, screen } from "@testing-library/react-native";

import { PaymentWebViewNotice } from "../../../../../../presentation/screens/PaymentWebView/fragments/PaymentWebViewNotice/index";

describe("PaymentWebViewNotice", () => {
  it.each([
    ["web", "paywv-web", /dibuka langsung di halaman ini/],
    ["error", "paywv-error", /Gagal membuka halaman pembayaran/],
    ["loading", "paywv-loading", /Membuka pembayaran/],
  ] as const)("renders the %s state", (variant, testID, message) => {
    render(<PaymentWebViewNotice variant={variant} />);

    expect(screen.getByTestId(testID)).toBeTruthy();
    expect(screen.getByText(message)).toBeTruthy();
  });
});
