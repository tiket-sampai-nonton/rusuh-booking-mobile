import { render, screen } from "@testing-library/react-native";
import { useFonts } from "expo-font";
import { Text } from "react-native";

jest.mock("expo-font", () => ({ useFonts: jest.fn() }));
jest.mock("@expo-google-fonts/inter", () => ({
  Inter_400Regular: "regular-asset",
  Inter_500Medium: "medium-asset",
  Inter_600SemiBold: "semibold-asset",
  Inter_700Bold: "bold-asset",
  Inter_900Black: "black-asset",
}));

// eslint-disable-next-line import/first
import { interFontForWeight, interFonts, useInterFonts } from "../../../presentation/theme/fonts";

function FontState() {
  const { fontsLoaded, fontError } = useInterFonts();
  let status = "loading";
  if (fontError) status = "error";
  else if (fontsLoaded) status = "loaded";
  return <Text>{status}</Text>;
}

describe("Inter font helpers", () => {
  const mockUseFonts = jest.mocked(useFonts);

  afterEach(() => jest.clearAllMocks());

  it("maps supported weights and falls back for unknown weights", () => {
    expect(interFontForWeight("400")).toBe(interFonts.regular);
    expect(interFontForWeight("500")).toBe(interFonts.medium);
    expect(interFontForWeight("600")).toBe(interFonts.semiBold);
    expect(interFontForWeight("700")).toBe(interFonts.bold);
    expect(interFontForWeight("900")).toBe(interFonts.black);
    expect(interFontForWeight(800)).toBe(interFonts.regular);
  });

  it("passes all Inter assets to Expo and reports loading, loaded, and error states", () => {
    mockUseFonts.mockReturnValueOnce([false, null]);
    const loading = render(<FontState />);
    expect(screen.getByText("loading")).toBeTruthy();
    expect(mockUseFonts).toHaveBeenLastCalledWith({
      Inter_400Regular: "regular-asset",
      Inter_500Medium: "medium-asset",
      Inter_600SemiBold: "semibold-asset",
      Inter_700Bold: "bold-asset",
      Inter_900Black: "black-asset",
    });

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
