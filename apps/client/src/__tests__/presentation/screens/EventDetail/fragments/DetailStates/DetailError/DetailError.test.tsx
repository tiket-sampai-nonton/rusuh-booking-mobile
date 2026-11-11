import { fireEvent, render, screen } from "@testing-library/react-native";

import { DetailError } from "../../../../../../../presentation/screens/EventDetail/fragments/DetailStates/DetailError/index";

describe("DetailError", () => {
  it("maps the supplied API code and exposes retry and back actions", () => {
    const onBack = jest.fn();
    const onRetry = jest.fn();
    render(
      <DetailError
        error={new Error("NOT_FOUND: raw backend detail")}
        onBack={onBack}
        onRetry={onRetry}
      />,
    );
    expect(screen.getByText("Data yang diminta tidak ditemukan.")).toBeTruthy();
    fireEvent.press(
      screen.getByRole("button", { name: "Coba muat event lagi" }),
    );
    expect(onRetry).toHaveBeenCalledTimes(1);
    fireEvent.press(screen.getByRole("button", { name: "Kembali ke beranda" }));
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("shows a fallback for an empty error", () => {
    render(<DetailError onBack={jest.fn()} onRetry={jest.fn()} />);
    expect(
      screen.getByText("Terjadi kesalahan. Silakan coba lagi."),
    ).toBeTruthy();
  });
});
