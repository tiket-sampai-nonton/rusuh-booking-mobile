import { render, screen } from "@testing-library/react-native";
import { useFonts } from "expo-font";
import { Text } from "react-native";

jest.mock("expo-font", () => ({ useFonts: jest.fn() }));

// eslint-disable-next-line import/first
import {
  plusJakartaSansFontForWeight,
  plusJakartaSansFonts,
  usePlusJakartaSansFonts,
} from "../../../presentation/theme/fonts";

function FontState() {
  const { fontsLoaded, fontError } = usePlusJakartaSansFonts();
  let status = "loading";
  if (fontError) status = "error";
  else if (fontsLoaded) status = "loaded";
  return <Text>{status}</Text>;
}

describe("Plus Jakarta Sans font helpers", () => {
  const mockUseFonts = jest.mocked(useFonts);

  afterEach(() => jest.clearAllMocks());

  it("maps supported weights and falls back for unknown weights", () => {
    expect(plusJakartaSansFontForWeight("400")).toBe(
      plusJakartaSansFonts.regular,
    );
    expect(plusJakartaSansFontForWeight("500")).toBe(
      plusJakartaSansFonts.medium,
    );
    expect(plusJakartaSansFontForWeight("600")).toBe(
      plusJakartaSansFonts.semiBold,
    );
    expect(plusJakartaSansFontForWeight("700")).toBe(plusJakartaSansFonts.bold);
    expect(plusJakartaSansFontForWeight("900")).toBe(
      plusJakartaSansFonts.extraBold,
    );
    expect(plusJakartaSansFontForWeight(800)).toBe(
      plusJakartaSansFonts.extraBold,
    );
  });

  it("loads the bundled Plus Jakarta Sans weights and reports load states", () => {
    mockUseFonts.mockReturnValueOnce([false, null]);
    const loading = render(<FontState />);
    expect(screen.getByText("loading")).toBeTruthy();
    expect(mockUseFonts).toHaveBeenLastCalledWith(
      expect.objectContaining({
        [plusJakartaSansFonts.regular]: expect.anything(),
        [plusJakartaSansFonts.medium]: expect.anything(),
        [plusJakartaSansFonts.semiBold]: expect.anything(),
        [plusJakartaSansFonts.bold]: expect.anything(),
        [plusJakartaSansFonts.extraBold]: expect.anything(),
      }),
    );

    loading.unmount();
    mockUseFonts.mockReturnValueOnce([true, null]);
    const loaded = render(<FontState />);
    expect(screen.getByText("loaded")).toBeTruthy();
    loaded.unmount();
    mockUseFonts.mockReturnValueOnce([false, new Error("font unavailable")]);
    render(<FontState />);
    expect(screen.getByText("error")).toBeTruthy();
  });
});
