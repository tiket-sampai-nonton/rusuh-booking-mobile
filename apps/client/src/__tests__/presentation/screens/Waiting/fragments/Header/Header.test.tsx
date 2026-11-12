import { fireEvent, render, screen } from "@testing-library/react-native";

const mockPush = jest.fn();
const mockReplace = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

// eslint-disable-next-line import/first
import { Header } from "../../../../../../presentation/screens/Waiting/fragments/Header/index";

describe("Waiting header", () => {
  it("returns users to the home route from its wordmark", () => {
    mockReplace.mockReset();
    render(<Header />);
    fireEvent.press(
      screen.getByRole("button", { name: "Beranda Rusuh Tiket" }),
    );
    expect(mockReplace).toHaveBeenCalledWith("/");
  });
});
