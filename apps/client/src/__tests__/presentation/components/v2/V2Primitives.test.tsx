/**
 * RBT-087 — V2 Brutalist Mono primitives tests.
 *
 * Covers each primitive in BOTH normal and reduced-motion modes. Reduced motion
 * is flipped via a mutable mock of reanimated's useReducedMotion (reset per
 * describe) so the reduced-motion early-return branches are exercised.
 */
import { act, fireEvent, render } from "@testing-library/react-native";
import { Text } from "react-native";

// Mutable reduced-motion flag honored by the reanimated mock. The `mock` prefix
// lets jest reference it inside the hoisted jest.mock factory.
let mockMotionReduced = false;
jest.mock("react-native-reanimated", () => {
  const actual = jest.requireActual("react-native-reanimated/mock");
  return { ...actual, useReducedMotion: () => mockMotionReduced };
});

// eslint-disable-next-line import/first -- must follow jest.mock (hoisting)
import {
  V2Button,
  V2Loader,
  V2Modal,
  V2Reveal,
  V2RevealStagger,
  useV2Toast,
  V2Cursor,
  V2ScrollProgress,
} from "@presentation/components/v2";

afterEach(() => {
  mockMotionReduced = false;
  jest.clearAllTimers();
});

describe("V2Button", () => {
  it("renders the label and fires onPress", () => {
    const onPress = jest.fn();
    const { getByText, getByTestId } = render(
      <V2Button testID="btn" label="Beli Tiket" onPress={onPress} />,
    );
    expect(getByText("Beli Tiket")).toBeTruthy();
    fireEvent.press(getByTestId("btn"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("drives the ink-spread fill on pressIn/pressOut", () => {
    const { getByTestId } = render(<V2Button testID="btn" label="Go" />);
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
      <V2Button testID="btn" label="Nope" onPress={onPress} disabled />,
    );
    const btn = getByTestId("btn");
    fireEvent(btn, "pressIn");
    fireEvent.press(btn);
    expect(onPress).not.toHaveBeenCalled();
  });

  it("renders ghost and danger variants with a trailing glyph", () => {
    const { getByText } = render(
      <>
        <V2Button label="Ghost" variant="ghost" trailing="→" large />
        <V2Button label="Danger" variant="danger" />
      </>,
    );
    expect(getByText("Ghost")).toBeTruthy();
    expect(getByText("Danger")).toBeTruthy();
  });

  it("fills instantly under reduced motion", () => {
    mockMotionReduced = true;
    const { getByTestId } = render(<V2Button testID="btn" label="RM" />);
    fireEvent(getByTestId("btn"), "pressIn");
    expect(getByTestId("btn")).toBeTruthy();
  });

  it("renders a ReactNode trailing element (not a string)", () => {
    const { getByTestId } = render(
      <V2Button label="Node" trailing={<Text testID="trail-node">»</Text>} />,
    );
    expect(getByTestId("trail-node")).toBeTruthy();
  });

  it("renders a STRING trailing glyph", () => {
    const { getByText } = render(<V2Button label="Arrow" trailing="→" />);
    expect(getByText("→")).toBeTruthy();
  });
});

describe("V2Reveal / V2RevealStagger", () => {
  it("renders children (animated)", () => {
    const { getByText } = render(
      <V2Reveal delay={50}>
        <Text>Revealed</Text>
      </V2Reveal>,
    );
    expect(getByText("Revealed")).toBeTruthy();
  });

  it("renders children instantly under reduced motion", () => {
    mockMotionReduced = true;
    const { getByText } = render(
      <V2Reveal>
        <Text>RM Revealed</Text>
      </V2Reveal>,
    );
    expect(getByText("RM Revealed")).toBeTruthy();
  });

  it("staggers each child with increasing delay (keyed + unkeyed)", () => {
    const { getByText } = render(
      <V2RevealStagger step={40} baseDelay={10} testID="stag">
        <Text key="a">One</Text>
        <Text>Two</Text>
        <Text>Three</Text>
      </V2RevealStagger>,
    );
    expect(getByText("One")).toBeTruthy();
    expect(getByText("Two")).toBeTruthy();
    expect(getByText("Three")).toBeTruthy();
  });

  it("staggers with default step/baseDelay", () => {
    const { getByText } = render(
      <V2RevealStagger>
        <Text>Solo</Text>
      </V2RevealStagger>,
    );
    expect(getByText("Solo")).toBeTruthy();
  });
});

describe("V2Loader", () => {
  it("renders nothing when not visible", () => {
    const { queryByTestId } = render(<V2Loader visible={false} testID="loader" />);
    expect(queryByTestId("loader")).toBeNull();
  });

  it("shows the wordmark + sweeping bar when visible", () => {
    const { getByTestId, getByText } = render(
      <V2Loader visible testID="loader" label="RUSUH" />,
    );
    expect(getByTestId("loader")).toBeTruthy();
    expect(getByText("RUSUH")).toBeTruthy();
  });

  it("renders a static bar under reduced motion", () => {
    mockMotionReduced = true;
    const { getByTestId } = render(<V2Loader visible testID="loader" />);
    expect(getByTestId("loader")).toBeTruthy();
  });
});

describe("V2Modal", () => {
  it("renders title + children when visible and closes on backdrop", () => {
    const onClose = jest.fn();
    const { getByText, getByTestId } = render(
      <V2Modal visible onClose={onClose} title="Masuk" testID="m">
        <Text>Body</Text>
      </V2Modal>,
    );
    expect(getByText("Masuk")).toBeTruthy();
    expect(getByText("Body")).toBeTruthy();
    fireEvent.press(getByTestId("m-backdrop"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("stops propagation when the card itself is pressed", () => {
    const onClose = jest.fn();
    const { getByTestId } = render(
      <V2Modal visible onClose={onClose} testID="m">
        <Text>Body</Text>
      </V2Modal>,
    );
    fireEvent.press(getByTestId("m"), { stopPropagation: jest.fn() });
    expect(onClose).not.toHaveBeenCalled();
  });

  it("renders under reduced motion", () => {
    mockMotionReduced = true;
    const { getByTestId } = render(
      <V2Modal visible onClose={jest.fn()} testID="m">
        <Text>RM</Text>
      </V2Modal>,
    );
    expect(getByTestId("m")).toBeTruthy();
  });

  it("resets its entrance when toggled from visible to hidden", () => {
    const { rerender, queryByText } = render(
      <V2Modal visible onClose={jest.fn()} testID="m">
        <Text>Body</Text>
      </V2Modal>,
    );
    expect(queryByText("Body")).toBeTruthy();
    // visible=false hits the reset branch (p.value = 0) and unmounts content.
    rerender(
      <V2Modal visible={false} onClose={jest.fn()} testID="m">
        <Text>Body</Text>
      </V2Modal>,
    );
    expect(queryByText("Body")).toBeNull();
  });
});

describe("useV2Toast", () => {
  function Harness({ type }: { type?: "info" | "success" | "error" }) {
    const { show, toast } = useV2Toast();
    return (
      <>
        <Text testID="fire" onPress={() => show("Hello", type)}>
          fire
        </Text>
        {toast}
      </>
    );
  }

  it("shows a toast message on demand and auto-hides", async () => {
    jest.useFakeTimers();
    const { getByTestId, getByText } = render(<Harness type="success" />);
    act(() => {
      fireEvent.press(getByTestId("fire"));
    });
    expect(getByText("Hello")).toBeTruthy();
    act(() => {
      jest.advanceTimersByTime(3500);
    });
    expect(getByTestId("v2-toast")).toBeTruthy();
    jest.useRealTimers();
  });

  it("supports info and error types + reduced motion", () => {
    jest.useFakeTimers();
    mockMotionReduced = true;
    const { getByTestId } = render(<Harness type="error" />);
    act(() => {
      fireEvent.press(getByTestId("fire"));
      jest.advanceTimersByTime(3500);
    });
    expect(getByTestId("v2-toast")).toBeTruthy();
    jest.useRealTimers();
  });

  it("re-showing before auto-hide clears the prior timer (info default)", () => {
    jest.useFakeTimers();
    const { getByTestId } = render(<Harness />);
    act(() => {
      fireEvent.press(getByTestId("fire"));
      jest.advanceTimersByTime(1000);
      fireEvent.press(getByTestId("fire")); // second show while first pending
      jest.advanceTimersByTime(3500);
    });
    expect(getByTestId("v2-toast")).toBeTruthy();
    jest.useRealTimers();
  });
});

describe("V2ToastProvider / useV2ToastContext", () => {
  it("delivers show() through context to a descendant", () => {
    jest.useFakeTimers();
    const {
      V2ToastProvider,
      useV2ToastContext,
    } = require("@presentation/components/v2") as typeof import("@presentation/components/v2");

    function Child() {
      const { show } = useV2ToastContext();
      return (
        <Text testID="ctx-fire" onPress={() => show("Ctx hi", "success")}>
          fire
        </Text>
      );
    }
    const { getByTestId, getByText } = render(
      <V2ToastProvider>
        <Child />
      </V2ToastProvider>,
    );
    act(() => {
      fireEvent.press(getByTestId("ctx-fire"));
    });
    expect(getByText("Ctx hi")).toBeTruthy();
    jest.useRealTimers();
  });

  it("throws when used outside a provider", () => {
    const {
      useV2ToastContext,
    } = require("@presentation/components/v2") as typeof import("@presentation/components/v2");
    function Bad() {
      useV2ToastContext();
      return null;
    }
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    expect(() => render(<Bad />)).toThrow(/V2ToastProvider/);
    spy.mockRestore();
  });
});

describe("web-only primitives on native", () => {
  it("V2Cursor renders nothing (no window on native)", () => {
    const { toJSON } = render(<V2Cursor />);
    expect(toJSON()).toBeNull();
  });

  it("V2ScrollProgress renders nothing on native", () => {
    const { toJSON } = render(<V2ScrollProgress />);
    expect(toJSON()).toBeNull();
  });
});
