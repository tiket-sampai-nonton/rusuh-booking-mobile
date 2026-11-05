import { cleanup, fireEvent, render, screen } from "@testing-library/react-native";
import { Animated, Platform } from "react-native";

import { Lightbox } from "../../../../../../presentation/screens/EventDetail/fragments/Lightbox/index";

describe("Lightbox", () => {
  const originalPlatform = Platform.OS;
  const images = ["https://example.com/one.jpg", "https://example.com/two.jpg", "https://example.com/three.jpg"];
  let keydownHandler: ((event: KeyboardEvent) => void) | undefined;
  let addEventListenerDescriptor: PropertyDescriptor | undefined;
  let removeEventListenerDescriptor: PropertyDescriptor | undefined;

  beforeEach(() => {
    jest.spyOn(Animated, "timing").mockReturnValue({ start: jest.fn(), stop: jest.fn(), reset: jest.fn() } as never);
    addEventListenerDescriptor = Object.getOwnPropertyDescriptor(window, "addEventListener");
    removeEventListenerDescriptor = Object.getOwnPropertyDescriptor(window, "removeEventListener");
  });

  afterEach(() => {
    cleanup();
    Object.defineProperty(Platform, "OS", { configurable: true, value: originalPlatform });
    jest.restoreAllMocks();
    if (addEventListenerDescriptor) Object.defineProperty(window, "addEventListener", addEventListenerDescriptor);
    else Reflect.deleteProperty(window, "addEventListener");
    if (removeEventListenerDescriptor) Object.defineProperty(window, "removeEventListener", removeEventListenerDescriptor);
    else Reflect.deleteProperty(window, "removeEventListener");
    keydownHandler = undefined;
  });

  it("closes and wraps previous/next navigation", () => {
    const onClose = jest.fn();
    const onNavigate = jest.fn();
    render(<Lightbox images={images} currentIndex={0} visible onClose={onClose} onNavigate={onNavigate} />);

    expect(screen.getByText("1 / 3")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Gambar sebelumnya" }));
    expect(onNavigate).toHaveBeenLastCalledWith(2);
    fireEvent.press(screen.getByRole("button", { name: "Gambar selanjutnya" }));
    expect(onNavigate).toHaveBeenLastCalledWith(1);
    fireEvent.press(screen.getByRole("button", { name: "Tutup galeri foto" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("omits image navigation for a single image and responds to web keyboard controls", () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "web" });
    Object.defineProperty(window, "addEventListener", {
      configurable: true,
      value: jest.fn((_type: string, listener: (event: KeyboardEvent) => void) => { keydownHandler = listener; }),
    });
    Object.defineProperty(window, "removeEventListener", { configurable: true, value: jest.fn() });
    const onClose = jest.fn();
    const onNavigate = jest.fn();
    render(<Lightbox images={[images[0]]} currentIndex={0} visible onClose={onClose} onNavigate={onNavigate} />);

    expect(screen.queryByRole("button", { name: "Gambar sebelumnya" })).toBeNull();
    keydownHandler?.({ key: "Escape" } as KeyboardEvent);
    expect(onClose).toHaveBeenCalledTimes(1);
    keydownHandler?.({ key: "ArrowLeft" } as KeyboardEvent);
    keydownHandler?.({ key: "ArrowRight" } as KeyboardEvent);
    expect(onNavigate).toHaveBeenNthCalledWith(1, 0);
    expect(onNavigate).toHaveBeenNthCalledWith(2, 0);
  });

  it("does not show a hidden lightbox", () => {
    render(<Lightbox images={images} currentIndex={1} visible={false} onClose={jest.fn()} onNavigate={jest.fn()} />);
    expect(screen.queryByText("2 / 3")).toBeNull();
  });
});
