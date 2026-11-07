import { fireEvent, render, screen } from "@testing-library/react-native";

const mockPush = jest.fn();
jest.mock("expo-router", () => ({ useRouter: () => ({ push: mockPush }) }));

// eslint-disable-next-line import/first
import {
  HistoryEmpty,
  HistoryError,
  HistoryLoading,
} from "../../../../../../presentation/screens/History/fragments/HistoryStates/index";

describe("History states", () => {
  beforeEach(() => mockPush.mockReset());

  it("renders the loading placeholder", () => {
    render(<HistoryLoading />);
    expect(screen.getByTestId("history-loading")).toBeTruthy();
    expect(screen.getByTestId("history-v2-loader")).toBeTruthy();
  });

  it("provides a browse action from the empty state", () => {
    render(<HistoryEmpty />);
    expect(screen.getByText("Belum Ada Arsip")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Jelajahi event" }));
    expect(mockPush).toHaveBeenCalledWith("/browse");
  });

  it("shows the fallback and a supplied error message", () => {
    const { rerender } = render(<HistoryError />);
    expect(
      screen.getByText("Terjadi kesalahan. Silakan coba lagi."),
    ).toBeTruthy();
    rerender(<HistoryError message="Layanan tidak tersedia" />);
    expect(screen.getByText("Layanan tidak tersedia")).toBeTruthy();
  });
});
