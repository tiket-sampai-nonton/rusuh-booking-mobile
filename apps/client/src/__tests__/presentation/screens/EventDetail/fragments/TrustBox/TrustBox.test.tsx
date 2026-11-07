import { render, screen } from "@testing-library/react-native";

import { TrustBox } from "../../../../../../presentation/screens/EventDetail/fragments/TrustBox/index";

describe("TrustBox", () => {
  it("renders the ticket purchase guarantees", () => {
    render(<TrustBox />);
    expect(screen.getByText("Tiket resmi & terverifikasi")).toBeTruthy();
    expect(screen.getByText("Antrean mengikuti urutan bergabung")).toBeTruthy();
    expect(
      screen.getByText("Tiket elektronik langsung ke pintu masuk"),
    ).toBeTruthy();
    expect(
      screen.getByText("Pengembalian dana sesuai ketentuan penyelenggara"),
    ).toBeTruthy();
  });
});
