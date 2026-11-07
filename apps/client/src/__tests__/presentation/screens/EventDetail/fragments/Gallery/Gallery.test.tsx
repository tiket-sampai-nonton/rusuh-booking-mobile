import { fireEvent, render, screen } from "@testing-library/react-native";
import { Platform } from "react-native";

const mockResponsive = { isDesktop: false };
jest.mock("@presentation/hooks/useResponsive", () => ({
  useResponsive: () => mockResponsive,
}));

// eslint-disable-next-line import/first
import { Gallery } from "../../../../../../presentation/screens/EventDetail/fragments/Gallery/index";

describe("Gallery", () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: originalPlatform,
    });
  });

  it("shows the empty state", () => {
    render(<Gallery images={[]} />);
    expect(screen.getByText("Galeri belum tersedia.")).toBeTruthy();
  });

  it("opens the requested image and handles hover styling on web", () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "web" });
    const onImagePress = jest.fn();
    render(
      <Gallery
        images={["https://example.com/one.jpg", "https://example.com/two.jpg"]}
        onImagePress={onImagePress}
      />,
    );

    const firstImage = screen.getByRole("button", { name: "Lihat gambar 1" });
    fireEvent(firstImage, "hoverIn");
    fireEvent(firstImage, "hoverOut");
    fireEvent.press(firstImage);
    expect(onImagePress).toHaveBeenCalledWith(0);
    expect(screen.getByRole("button", { name: "Lihat gambar 2" })).toBeTruthy();
  });

  it("allows gallery items without a callback", () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" });
    render(<Gallery images={["https://example.com/one.jpg"]} />);
    expect(() =>
      fireEvent.press(screen.getByRole("button", { name: "Lihat gambar 1" })),
    ).not.toThrow();
  });

  it("uses the four-column desktop grid", () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "web" });
    mockResponsive.isDesktop = true;
    render(<Gallery images={["one.jpg"]} />);
    expect(screen.getByRole("button", { name: "Lihat gambar 1" })).toBeTruthy();
    mockResponsive.isDesktop = false;
  });
});
