import { fireEvent, render, screen } from "@testing-library/react-native";

import { DetailError } from "../../../../../../../presentation/screens/EventDetail/fragments/DetailStates/DetailError/index";

describe("DetailError", () => {
  it("shows the supplied message and returns on request", () => {
    const onBack = jest.fn();
    render(<DetailError message="Tidak tersedia" onBack={onBack} />);
    expect(screen.getByText("Tidak tersedia")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Kembali ke beranda" }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("shows a fallback for an empty error", () => {
    render(<DetailError onBack={jest.fn()} />);
    expect(screen.getByText("Event tidak ditemukan.")).toBeTruthy();
  });
});
