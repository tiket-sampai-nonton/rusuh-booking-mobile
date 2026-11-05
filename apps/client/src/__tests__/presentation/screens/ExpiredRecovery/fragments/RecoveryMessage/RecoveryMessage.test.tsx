import { render, screen } from "@testing-library/react-native";

import { RecoveryMessage } from "../../../../../../presentation/screens/ExpiredRecovery/fragments/RecoveryMessage/index";

describe("RecoveryMessage", () => {
  it("renders the payment recovery title and message", () => {
    render(<RecoveryMessage reason="payment" title="Pembayaran Timeout" body="Coba lagi." />);

    expect(screen.getByTestId("expired-title").props.children).toBe("Pembayaran Timeout");
    expect(screen.getByText("Coba lagi.")).toBeTruthy();
  });

  it("renders the hold reason with its timer icon variant", () => {
    render(<RecoveryMessage reason="hold" title="Pemesanan Kedaluwarsa" body="Sesi berakhir." />);

    expect(screen.getByTestId("expired-title").props.children).toBe("Pemesanan Kedaluwarsa");
    expect(screen.getByText("Sesi berakhir.")).toBeTruthy();
  });
});
