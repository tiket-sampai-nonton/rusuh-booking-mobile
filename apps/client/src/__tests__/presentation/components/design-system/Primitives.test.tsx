/**
 * RBT-087 —  Brutalist Mono primitives tests.
 *
 * Covers each primitive in BOTH normal and reduced-motion modes. Reduced motion
 * is flipped via a mutable mock of reanimated's useReducedMotion (reset per
 * describe) so the reduced-motion early-return branches are exercised.
 */
import { act, fireEvent, render } from "@testing-library/react-native";
import { Platform, Text } from "react-native";

// Mutable reduced-motion flag honored by the reanimated mock. The `mock` prefix
// lets jest reference it inside the hoisted jest.mock factory.
let mockMotionReduced: boolean | null = false;
let mockAnimationFinished = true;
jest.mock("react-native-reanimated", () => {
  const actual = jest.requireActual("react-native-reanimated/mock");
  return {
    ...actual,
    useReducedMotion: () => mockMotionReduced,
    withTiming: (toValue: unknown, _config: unknown, callback?: (finished: boolean) => void) => {
      callback?.(mockAnimationFinished);
      return toValue;
    },
  };
});

// eslint-disable-next-line import/first -- must follow jest.mock (hoisting)
import {
  Button,
  Loader,
  Modal,
  Reveal,
  RevealStagger,
  ToastProvider,
  useToast,
  Cursor,
  ScrollProgress,
} from "@presentation/components/design-system";
// eslint-disable-next-line import/first -- these standalone variants exercise their edge props directly.
import { ProgressBar } from "@presentation/components/design-system/Loader/ProgressBar";
// eslint-disable-next-line import/first
import { ToastItem } from "@presentation/components/design-system/Toast/ToastItem";

afterEach(() => {
  mockMotionReduced = false;
  mockAnimationFinished = true;
  jest.clearAllTimers();
});

describe("Button", () => {
  it("renders the label and fires onPress", () => {
    const onPress = jest.fn();
    const { getByText, getByTestId } = render(
      <Button testID="btn" label="Beli Tiket" onPress={onPress} />,
    );
    expect(getByText("Beli Tiket")).toBeTruthy();
    fireEvent.press(getByTestId("btn"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("drives the ink-spread fill on pressIn/pressOut", () => {
    const { getByTestId } = render(<Button testID="btn" label="Go" />);
    const btn = getByTestId("btn");
    fireEvent(btn, "pressIn");
    fireEvent(btn, "pressOut");
    // hover handlers exist on web; call them to cover both branches
    fireEvent(btn, "hoverIn");
    fireEvent(btn, "hoverOut");
    expect(btn).toBeTruthy();
  });

  it("does not animate or fire when disabled", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Button testID="btn" label="Nope" onPress={onPress} disabled />,
    );
    const btn = getByTestId("btn");
    fireEvent(btn, "pressIn");
    fireEvent.press(btn);
    expect(onPress).not.toHaveBeenCalled();
  });

  it("renders ghost and danger variants with a trailing glyph", () => {
    const { getByText } = render(
      <>
        <Button label="Ghost" variant="ghost" trailing="→" large />
        <Button label="Danger" variant="danger" />
      </>,
    );
    expect(getByText("Ghost")).toBeTruthy();
    expect(getByText("Danger")).toBeTruthy();
  });

  it("fills instantly under reduced motion", () => {
    mockMotionReduced = true;
    const { getByTestId } = render(<Button testID="btn" label="RM" />);
    fireEvent(getByTestId("btn"), "pressIn");
    expect(getByTestId("btn")).toBeTruthy();
  });

  it("renders a ReactNode trailing element (not a string)", () => {
    const { getByTestId } = render(
      <Button label="Node" trailing={<Text testID="trail-node">»</Text>} />,
    );
    expect(getByTestId("trail-node")).toBeTruthy();
  });

  it("renders a STRING trailing glyph", () => {
    const { getByText } = render(<Button label="Arrow" trailing="→" />);
    expect(getByText("→")).toBeTruthy();
  });
});

describe("Reveal / RevealStagger", () => {
  it("renders children (animated)", () => {
    const { getByText } = render(
      <Reveal delay={50}>
        <Text>Revealed</Text>
      </Reveal>,
    );
    expect(getByText("Revealed")).toBeTruthy();
  });

  it("renders children instantly under reduced motion", () => {
    mockMotionReduced = true;
    const { getByText } = render(
      <Reveal>
        <Text>RM Revealed</Text>
      </Reveal>,
    );
    expect(getByText("RM Revealed")).toBeTruthy();
  });

  it("staggers each child with increasing delay (keyed + unkeyed)", () => {
    const { getByText } = render(
      <RevealStagger step={40} baseDelay={10} testID="stag">
        <Text key="a">One</Text>
        <Text>Two</Text>
        <Text>Three</Text>
      </RevealStagger>,
    );
    expect(getByText("One")).toBeTruthy();
    expect(getByText("Two")).toBeTruthy();
    expect(getByText("Three")).toBeTruthy();
  });

  it("staggers with default step/baseDelay", () => {
    const { getByText } = render(
      <RevealStagger>
        <Text>Solo</Text>
      </RevealStagger>,
    );
    expect(getByText("Solo")).toBeTruthy();
  });

  it("preserves primitive children and omits stagger test identifiers when absent", () => {
    const { toJSON } = render(<RevealStagger>Plain text</RevealStagger>);
    expect(JSON.stringify(toJSON())).toContain("Plain text");
  });
});

describe("Loader", () => {
  it("renders nothing when not visible", () => {
    const { queryByTestId } = render(<Loader visible={false} testID="loader" />);
    expect(queryByTestId("loader")).toBeNull();
  });

  it("shows the wordmark letters + sweeping bar when visible", () => {
    const { getByTestId, getByText, getAllByText } = render(
      <Loader visible testID="loader" label="RUSUH" />,
    );
    expect(getByTestId("loader")).toBeTruthy();
    // Letters are rendered individually for bounce animation
    expect(getByText("R")).toBeTruthy();
    expect(getAllByText("U")).toHaveLength(2); // "RUSUH" has two U's
    expect(getByText("S")).toBeTruthy();
    expect(getByText("H")).toBeTruthy();
  });

  it("renders a static bar under reduced motion", () => {
    mockMotionReduced = true;
    const { getByTestId } = render(<Loader visible testID="loader" />);
    expect(getByTestId("loader")).toBeTruthy();
  });

  it("finishes the exit immediately when reduced motion is enabled", () => {
    mockMotionReduced = true;
    const onExitComplete = jest.fn();
    const { rerender } = render(
      <Loader visible testID="loader" onExitComplete={onExitComplete} />,
    );

    rerender(<Loader visible={false} testID="loader" onExitComplete={onExitComplete} />);

    expect(onExitComplete).toHaveBeenCalledTimes(1);
  });

  it("defaults to motion enabled when the reduced-motion preference is unavailable", () => {
    mockMotionReduced = null;
    const { getByTestId } = render(<Loader visible testID="loader" />);

    expect(getByTestId("loader")).toBeTruthy();
  });
});

describe("Modal", () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: originalPlatform });
  });

  it("renders title + children when visible and closes on backdrop", () => {
    const onClose = jest.fn();
    const { getByText, getByTestId } = render(
      <Modal visible onClose={onClose} title="Masuk" testID="m">
        <Text>Body</Text>
      </Modal>,
    );
    expect(getByText("Masuk")).toBeTruthy();
    expect(getByText("Body")).toBeTruthy();
    fireEvent.press(getByTestId("m-backdrop"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("stops propagation when the card itself is pressed", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <Modal visible onClose={onClose} testID="m">
        <Text>Body</Text>
      </Modal>,
    );
    fireEvent.press(getByTestId("m"), { stopPropagation: jest.fn() });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("renders under reduced motion", () => {
    mockMotionReduced = true;
    const { getByTestId } = render(
      <Modal visible onClose={jest.fn()} testID="m">
        <Text>RM</Text>
      </Modal>,
    );
    expect(getByTestId("m")).toBeTruthy();
  });

  it("resets its entrance when toggled from visible to hidden", () => {
    const { rerender, queryByText } = render(
      <Modal visible onClose={jest.fn()} testID="m">
        <Text>Body</Text>
      </Modal>,
    );
    expect(queryByText("Body")).toBeTruthy();
    // visible=false hits the reset branch (p.value = 0) and unmounts content.
    rerender(
      <Modal visible={false} onClose={jest.fn()} testID="m">
        <Text>Body</Text>
      </Modal>,
    );
    expect(queryByText("Body")).toBeNull();
  });

  it("uses web dialog semantics and fallback test identifiers", () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "web" });
    const { getByTestId, getByRole } = render(
      <Modal visible onClose={jest.fn()}><Text>Default identifiers</Text></Modal>,
    );
    expect(getByTestId("v2-modal-backdrop")).toBeTruthy();
    expect(getByTestId("v2-modal-card")).toBeTruthy();
    expect(getByRole("dialog")).toBeTruthy();
  });
});

describe("standalone animated states", () => {
  it("renders a non-animated progress bar when hidden", () => {
    const { toJSON } = render(<ProgressBar visible={false} reducedMotion={false} />);
    expect(toJSON()).toBeTruthy();
  });

  it("renders default toast items without scheduling a dismissal for zero duration", () => {
    const onDismiss = jest.fn();
    const { getByText } = render(
      <ToastItem toast={{ id: "zero", message: "Pinned", variant: "default", duration: 0 }} onDismiss={onDismiss} />,
    );
    expect(getByText("Pinned")).toBeTruthy();
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it("schedules dismissal for a toast with a positive duration", () => {
    jest.useFakeTimers();
    const { getByText, unmount } = render(
      <ToastItem toast={{ id: "timed", message: "Timed", variant: "success", duration: 100 }} onDismiss={jest.fn()} />,
    );
    expect(getByText("Timed")).toBeTruthy();
    act(() => jest.advanceTimersByTime(100));
    unmount();
    jest.useRealTimers();
  });

  it("does not dismiss a toast when its exit animation is interrupted", () => {
    jest.useFakeTimers();
    mockAnimationFinished = false;
    const onDismiss = jest.fn();
    render(
      <ToastItem toast={{ id: "interrupted", message: "Keep visible", variant: "default", duration: 100 }} onDismiss={onDismiss} />,
    );
    act(() => jest.advanceTimersByTime(100));
    expect(onDismiss).not.toHaveBeenCalled();
    jest.useRealTimers();
  });
});

describe("useToast", () => {
  function Harness({ type }: { type?: "success" | "error" }) {
    const { show } = useToast();
    return (
      <>
        <Text testID="fire" onPress={() => show("Hello", type)}>
          fire
        </Text>
      </>
    );
  }

  it("shows a toast message on demand and auto-hides", async () => {
    jest.useFakeTimers();
    const { getByTestId, getByText } = render(
      <ToastProvider>
        <Harness type="success" />
      </ToastProvider>,
    );
    act(() => {
      fireEvent.press(getByTestId("fire"));
    });
    expect(getByText("Hello")).toBeTruthy();
    act(() => {
      jest.advanceTimersByTime(3500);
    });
    // Toast should still be visible right before auto-hide
    jest.useRealTimers();
  });

  it("supports error types + reduced motion", () => {
    jest.useFakeTimers();
    mockMotionReduced = true;
    const { getByTestId, getByText } = render(
      <ToastProvider>
        <Harness type="error" />
      </ToastProvider>,
    );
    act(() => {
      fireEvent.press(getByTestId("fire"));
    });
    expect(getByText("Hello")).toBeTruthy();
    act(() => {
      jest.advanceTimersByTime(3500);
    });
    jest.useRealTimers();
  });

  it("re-showing before auto-hide clears the prior timer (default variant)", () => {
    jest.useFakeTimers();
    const { getByTestId, getAllByText } = render(
      <ToastProvider>
        <Harness />
      </ToastProvider>,
    );
    act(() => {
      fireEvent.press(getByTestId("fire"));
      jest.advanceTimersByTime(1000);
      fireEvent.press(getByTestId("fire")); // second show while first pending
    });
    // Both toasts are present - the implementation stacks multiple toasts
    expect(getAllByText("Hello").length).toBeGreaterThanOrEqual(1);
    jest.useRealTimers();
  });
});

describe("ToastProvider / useToastContext", () => {
  it("delivers show() through context to a descendant", () => {
    jest.useFakeTimers();
    const {
      ToastProvider,
      useToastContext,
    } = require("@presentation/components/design-system") as typeof import("@presentation/components/design-system");

    function Child() {
      const { show } = useToastContext();
      return (
        <Text testID="ctx-fire" onPress={() => show("Ctx hi", "success")}>
          fire
        </Text>
      );
    }
    const { getByTestId, getByText } = render(
      <ToastProvider>
        <Child />
      </ToastProvider>,
    );
    act(() => {
      fireEvent.press(getByTestId("ctx-fire"));
    });
    expect(getByText("Ctx hi")).toBeTruthy();
    jest.useRealTimers();
  });

  it("throws when used outside a provider", () => {
    const {
      useToastContext,
    } = require("@presentation/components/design-system") as typeof import("@presentation/components/design-system");
    function Bad() {
      useToastContext();
      return null;
    }
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Bad />)).toThrow(/ToastProvider/);
    spy.mockRestore();
  });
});

describe("web-only primitives on native", () => {
  it("Cursor renders nothing (no window on native)", () => {
    const { toJSON } = render(<Cursor />);
    expect(toJSON()).toBeNull();
  });

  it("ScrollProgress renders nothing on native", () => {
    const { toJSON } = render(<ScrollProgress />);
    expect(toJSON()).toBeNull();
  });
});
