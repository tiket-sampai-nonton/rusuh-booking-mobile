import { render, screen } from "@testing-library/react-native";

import { BrandMark } from "../../../../presentation/components/BrandMark/index";

describe("BrandMark", () => {
  it("renders the wordmark and forwards its test identifier", () => {
    render(<BrandMark testID="brand-mark" />);
    expect(screen.getByTestId("brand-mark")).toBeTruthy();
    expect(screen.getByText("Rusuh Tiket")).toBeTruthy();
  });

  it("accepts a custom wordmark color", () => {
    render(<BrandMark color="#ff0000" />);
    expect(screen.getByText("Rusuh Tiket")).toBeTruthy();
  });
});
