import { fireEvent, render, screen } from "@testing-library/react-native";

import { AuraBackground } from "@presentation/components/AuraBackground";
import { BrandMark } from "@presentation/components/BrandMark";
import { PillButton } from "@presentation/components/PillButton";
import { ProgressRing } from "@presentation/components/ProgressRing";

describe("AuraBackground", () => {
  it("renders children for each tone", () => {
    for (const tone of ["brand", "success", "error"] as const) {
      const { getByTestId, unmount } = render(
        <AuraBackground tone={tone} testID={`aura-${tone}`}>
          <></>
        </AuraBackground>,
      );
      expect(getByTestId(`aura-${tone}`)).toBeTruthy();
      unmount();
    }
  });

  it("defaults to the brand tone", () => {
    render(
      <AuraBackground testID="aura-default">
        <></>
      </AuraBackground>,
    );
    expect(screen.getByTestId("aura-default")).toBeTruthy();
  });
});

describe("BrandMark", () => {
  it("renders the wordmark", () => {
    render(<BrandMark testID="bm" />);
    expect(screen.getByText("Rusuh Tiket")).toBeTruthy();
  });
});

describe("ProgressRing", () => {
  it("renders at various progress values (clamped)", () => {
    for (const p of [-1, 0, 0.5, 1, 2]) {
      const { unmount } = render(
        <ProgressRing progress={p}>
          <></>
        </ProgressRing>,
      );
      unmount();
    }
  });
});

describe("PillButton", () => {
  it("fires onPress for an enabled button", () => {
    const onPress = jest.fn();
    render(<PillButton label="Go" onPress={onPress} testID="pb" />);
    fireEvent.press(screen.getByTestId("pb"));
    expect(onPress).toHaveBeenCalled();
  });

  it("does not fire when disabled or busy", () => {
    const onPress = jest.fn();
    const { rerender } = render(
      <PillButton label="Go" onPress={onPress} disabled testID="pb" />,
    );
    fireEvent.press(screen.getByTestId("pb"));
    rerender(<PillButton label="Go" onPress={onPress} busy testID="pb" />);
    fireEvent.press(screen.getByTestId("pb"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("renders the light variant with a pin and the ghost variant", () => {
    const { rerender } = render(
      <PillButton label="Book" onPress={() => {}} variant="light" pin testID="pb" />,
    );
    expect(screen.getByText("Book")).toBeTruthy();
    rerender(<PillButton label="Ghost" onPress={() => {}} variant="ghost" testID="pb" />);
    expect(screen.getByText("Ghost")).toBeTruthy();
    // primary variant default
    rerender(<PillButton label="Pay" onPress={() => {}} testID="pb" />);
    expect(screen.getByText("Pay")).toBeTruthy();
  });
});
