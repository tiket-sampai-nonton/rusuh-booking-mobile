import { render, screen } from "@testing-library/react-native";

import {
  HomeError,
  HomeLoading,
} from "../../../../../../presentation/screens/Home/fragments/HomeStates/index";

describe("Home states", () => {
  it("shows the loading state", () => {
    render(<HomeLoading />);
    expect(screen.getByTestId("home-loading")).toBeTruthy();
    expect(screen.getByLabelText("Memuat event")).toBeTruthy();
  });

  it("shows safe connection guidance for a network error", () => {
    render(
      <HomeError
        error={new TypeError("Failed to fetch")}
        onRetry={jest.fn()}
        isRetrying={false}
      />,
    );
    expect(screen.getByTestId("home-error")).toBeTruthy();
    expect(
      screen.getByText(
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda, lalu coba lagi.",
      ),
    ).toBeTruthy();
  });

  it("shows the fallback error message when none is supplied", () => {
    render(<HomeError onRetry={jest.fn()} isRetrying={false} />);
    expect(
      screen.getByText("Terjadi kesalahan. Silakan coba lagi."),
    ).toBeTruthy();
  });
});
