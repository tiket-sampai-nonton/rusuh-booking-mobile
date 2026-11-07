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

  it("shows a supplied error message", () => {
    render(<HomeError message="Koneksi terputus" />);
    expect(screen.getByTestId("home-error")).toBeTruthy();
    expect(screen.getByText("Koneksi terputus")).toBeTruthy();
  });

  it("shows the fallback error message when none is supplied", () => {
    render(<HomeError />);
    expect(
      screen.getByText("Terjadi kesalahan. Silakan coba lagi."),
    ).toBeTruthy();
  });
});
