import { render, screen } from "@testing-library/react-native";

let mockReducedMotion: boolean | undefined = false;
jest.mock("react-native-reanimated", () => ({
  ...jest.requireActual("react-native-reanimated/mock"),
  useReducedMotion: () => mockReducedMotion,
}));

// eslint-disable-next-line import/first -- reduced motion must be mocked before the component loads.
import { RingProgress } from "@presentation/screens/Waiting/fragments/RingProgress";
// eslint-disable-next-line import/first -- reduced motion must be mocked before the component loads.
import { StatusBadge } from "@presentation/screens/Waiting/fragments/StatusBadge";

describe("waiting animated visual states", () => {
  afterEach(() => {
    mockReducedMotion = false;
  });

  it.each([
    ["queue", "Dalam antrean"],
    ["yourTurn", "Giliran Anda"],
    ["soldOut", "Tiket habis"],
    ["expired", "Berakhir"],
    ["offline", "Luring"],
    ["paused", "Dijeda"],
  ] as const)("renders the %s badge variant", (variant, label) => {
    mockReducedMotion = variant === "offline" ? undefined : false;
    render(<StatusBadge variant={variant} label={label} />);
    expect(screen.getByTestId("waiting-status-badge")).toBeTruthy();
    expect(screen.getByText(label)).toBeTruthy();
  });

  it("renders ring progress with standard and reduced motion preferences", () => {
    const standard = render(<RingProgress progress={1.4} position={12} />);
    expect(standard.getByTestId("waiting-ring")).toBeTruthy();
    standard.unmount();

    mockReducedMotion = true;
    render(<RingProgress progress={-0.2} position={4} isWarning />);
    expect(screen.getByTestId("waiting-ring")).toBeTruthy();
  });
});
