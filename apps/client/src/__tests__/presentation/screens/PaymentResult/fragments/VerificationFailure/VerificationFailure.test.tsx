import { fireEvent, render, screen } from "@testing-library/react-native";

import { VerificationFailure } from "../../../../../../presentation/screens/PaymentResult/fragments/VerificationFailure/index";

describe("VerificationFailure", () => {
  it("explains the missing-attempt case and returns to payment", () => {
    const onReturn = jest.fn();
    render(<VerificationFailure missingAttemptId onReturn={onReturn} />);

    expect(screen.getByTestId("payment-result-error").props.children).toMatch(/ID percobaan pembayaran tidak tersedia/);
    fireEvent.press(screen.getByTestId("payment-result-return"));
    expect(onReturn).toHaveBeenCalledTimes(1);
  });

  it("explains a verification error", () => {
    render(<VerificationFailure missingAttemptId={false} onReturn={jest.fn()} />);

    expect(screen.getByTestId("payment-result-error").props.children).toMatch(/Gagal memeriksa status pembayaran/);
  });
});
