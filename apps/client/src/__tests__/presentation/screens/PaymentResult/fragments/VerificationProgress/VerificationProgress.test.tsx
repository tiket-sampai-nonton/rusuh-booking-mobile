import { render, screen } from "@testing-library/react-native";

import { VerificationProgress } from "../../../../../../presentation/screens/PaymentResult/fragments/VerificationProgress/index";

describe("VerificationProgress", () => {
  it("shows the server verification state", () => {
    render(<VerificationProgress isPaid={false} />);

    expect(screen.getByTestId("payment-result-spinner")).toBeTruthy();
    expect(screen.getByText("Memverifikasi pembayaran kamu…")).toBeTruthy();
  });

  it("announces success while the authoritative route is opening", () => {
    render(<VerificationProgress isPaid />);

    expect(screen.getByText("Pembayaran berhasil — mengalihkan…")).toBeTruthy();
  });
});
