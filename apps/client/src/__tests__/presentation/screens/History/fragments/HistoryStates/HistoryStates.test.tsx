import { fireEvent, render, screen } from "@testing-library/react-native";

const mockNavigate = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ navigate: mockNavigate }),
}));

// eslint-disable-next-line import/first
import {
  HistoryEmpty,
  HistoryError,
  HistoryLoading,
} from "../../../../../../presentation/screens/History/fragments/HistoryStates/index";

describe("History states", () => {
  beforeEach(() => mockNavigate.mockReset());

  it("renders the loading placeholder", () => {
    render(<HistoryLoading />);
    expect(screen.getByTestId("history-loading")).toBeTruthy();
    expect(screen.getByTestId("history-v2-loader")).toBeTruthy();
  });

  it("provides a browse action from the empty state", () => {
    render(<HistoryEmpty />);
    expect(screen.getByText("Belum Ada Arsip")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Jelajahi event" }));
    expect(mockNavigate).toHaveBeenCalledWith("/browse");
  });

  it("shows the fallback and a supplied error message", () => {
    const props = { onRetry: jest.fn(), isRetrying: false };
    const { rerender } = render(<HistoryError {...props} />);
    expect(
      screen.getByText("Terjadi kesalahan. Silakan coba lagi."),
    ).toBeTruthy();
    rerender(
      <HistoryError {...props} error={new TypeError("Failed to fetch")} />,
    );
    expect(
      screen.getByText(
        "Tidak dapat terhubung ke server. Periksa koneksi internet Anda, lalu coba lagi.",
      ),
    ).toBeTruthy();
  });
});
