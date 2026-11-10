import { fireEvent, render, screen } from "@testing-library/react-native";

import { IMAGE_FALLBACK } from "@presentation/constants/image-fallback";
import { CachedImage } from "@presentation/components/design-system/CachedImage";

describe("CachedImage", () => {
  it("shows the bundled fallback after the remote image fails", () => {
    render(
      <CachedImage
        source={{ uri: "https://images.example.test/event.jpg" }}
        testID="event-image"
      />,
    );

    const image = screen.getByTestId("event-image");
    expect(image.props.source).toEqual({
      uri: "https://images.example.test/event.jpg",
    });

    fireEvent(image, "error", { nativeEvent: { error: "404" } });

    expect(screen.getByTestId("event-image").props.source).toBe(IMAGE_FALLBACK);
  });

  it("retries when the source changes after an image error", () => {
    const { rerender } = render(
      <CachedImage
        source={{ uri: "https://images.example.test/missing.jpg" }}
        testID="image"
      />,
    );
    fireEvent(screen.getByTestId("image"), "error", {
      nativeEvent: { error: "404" },
    });
    expect(screen.getByTestId("image").props.source).toBe(IMAGE_FALLBACK);

    const nextSource = { uri: "https://images.example.test/available.jpg" };
    rerender(<CachedImage source={nextSource} testID="image" />);

    expect(screen.getByTestId("image").props.source).toEqual(nextSource);
  });
});
