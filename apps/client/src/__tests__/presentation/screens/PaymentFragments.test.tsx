import { fireEvent, render, screen } from "@testing-library/react-native";

import { PaymentBar } from "@presentation/screens/Payment/fragments/PaymentBar";
import { PaymentSummary } from "@presentation/screens/Payment/fragments/PaymentSummary";

describe("PaymentBar (RBT-060)", () => {
  it("renders total + fires onPay when enabled", () => {
    const onPay = jest.fn();
    render(
      <PaymentBar
        amountMinor={450000}
        canPay
        pending={false}
        expired={false}
        onPay={onPay}
        bottomInset={0}
      />,
    );
    fireEvent.press(screen.getByTestId("pay-now"));
    expect(onPay).toHaveBeenCalledTimes(1);
  });

  it("shows the error message and disables pay (line 20)", () => {
    render(
      <PaymentBar
        amountMinor={0}
        canPay={false}
        pending={false}
        expired={false}
        errorMessage="Pembayaran gagal dibuat"
        onPay={jest.fn()}
        bottomInset={8}
      />,
    );
    expect(screen.getByText("Pembayaran gagal dibuat")).toBeTruthy();
    expect(
      screen.getByTestId("pay-now").props.accessibilityState.disabled,
    ).toBe(true);
  });

  it("shows 'Memproses…' while pending and 'Waktu habis' when expired (line 42)", () => {
    const { rerender } = render(
      <PaymentBar
        amountMinor={0}
        canPay
        pending
        expired={false}
        onPay={jest.fn()}
        bottomInset={0}
      />,
    );
    expect(screen.getByText("Memproses…")).toBeTruthy();
    rerender(
      <PaymentBar
        amountMinor={0}
        canPay={false}
        pending={false}
        expired
        onPay={jest.fn()}
        bottomInset={0}
      />,
    );
    expect(screen.getByText("Waktu habis")).toBeTruthy();
  });
});

describe("PaymentSummary (RBT-060)", () => {
  it("renders the total with no fee line", () => {
    render(<PaymentSummary bookingId="bk-1" amountMinor={450000} />);
    expect(screen.getByTestId("payment-total").props.children).toBe(
      "Rp 450.000",
    );
    expect(screen.queryByText(/biaya layanan/i)).toBeNull();
  });
});
