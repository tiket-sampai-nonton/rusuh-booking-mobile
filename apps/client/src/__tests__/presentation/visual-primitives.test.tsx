import { fireEvent, render, screen } from "@testing-library/react-native";

// Flip reduced-motion per test to drive both the drift-loop and static paths
// of AuraBackground (and any other reduced-motion-aware primitive).
const motionState = { reduced: false };
jest.mock("react-native-reanimated", () => {
  const actual = jest.requireActual("react-native-reanimated/mock");
  return { ...actual, useReducedMotion: () => motionState.reduced };
});

// eslint-disable-next-line import/first
import { AuraBackground } from "@presentation/components/AuraBackground";
// eslint-disable-next-line import/first
import { BrandMark } from "@presentation/components/BrandMark";
// eslint-disable-next-line import/first
import { MiniNav } from "@presentation/components/MiniNav";
// eslint-disable-next-line import/first
import { PillButton } from "@presentation/components/PillButton";
// eslint-disable-next-line import/first
import { ProgressRing } from "@presentation/components/ProgressRing";
// eslint-disable-next-line import/first
import { Steps } from "@presentation/components/Steps";

afterEach(() => {
  motionState.reduced = false;
});

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

  it("renders a static aura under reduced-motion (no drift loop)", () => {
    motionState.reduced = true;
    render(
      <AuraBackground testID="aura-reduced">
        <></>
      </AuraBackground>,
    );
    expect(screen.getByTestId("aura-reduced")).toBeTruthy();
  });
});

describe("MiniNav", () => {
  it("renders the brand and a back link that fires onBack", () => {
    const onBack = jest.fn();
    render(<MiniNav onBack={onBack} />);
    expect(screen.getByText("Rusuh Tiket")).toBeTruthy();
    fireEvent.press(screen.getByTestId("mini-nav-back"));
    expect(onBack).toHaveBeenCalled();
  });

  it("hides the back link when showBack is false", () => {
    render(<MiniNav showBack={false} />);
    expect(screen.queryByTestId("mini-nav-back")).toBeNull();
  });

  it("renders a custom back label (inert when no handler)", () => {
    render(<MiniNav backLabel="← Kembali" />);
    expect(screen.getByText("← Kembali")).toBeTruthy();
  });
});

describe("Steps", () => {
  it("renders the four funnel steps with an active index", () => {
    render(<Steps active={2} />);
    expect(screen.getByTestId("funnel-steps")).toBeTruthy();
    for (const l of ["Detail", "Antre", "Pilih", "Bayar"]) {
      expect(screen.getByText(l)).toBeTruthy();
    }
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
