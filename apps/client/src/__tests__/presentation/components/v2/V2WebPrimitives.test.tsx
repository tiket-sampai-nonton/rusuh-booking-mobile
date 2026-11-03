/**
 * @jest-environment jsdom
 *
 * RBT-087 — web-only V2 primitives (V2Cursor, V2ScrollProgress) exercised in a
 * jsdom (web) environment with Platform.OS forced to "web", so the real DOM
 * bodies (listener wiring, bar/ring creation, scroll ratio, cleanup) run.
 */
import { render } from "@testing-library/react-native";

let mockMotionReduced = false;
// Minimal reanimated mock — these two primitives only use useReducedMotion, so
// avoid requireActual (the real module cannot init under jsdom).
jest.mock("react-native-reanimated", () => ({ useReducedMotion: () => mockMotionReduced }));

jest.mock("react-native/Libraries/Utilities/Platform", () => ({
  OS: "web",
  select: (o: Record<string, unknown>) => o.web ?? o.default,
}));

// Import the two web-only primitives DIRECTLY (not via the index barrel, which
// would drag in V2Button/Loader/Modal and their heavier reanimated usage).
// eslint-disable-next-line import/first -- must follow jest.mock (hoisting)
import { V2Cursor } from "@presentation/components/v2/V2Cursor";
// eslint-disable-next-line import/first -- must follow jest.mock (hoisting)
import { V2ScrollProgress } from "@presentation/components/v2/V2ScrollProgress";

afterEach(() => {
  mockMotionReduced = false;
  document.body.innerHTML = "";
});

describe("V2Cursor (web, fine pointer)", () => {
  beforeEach(() => {
    // Report a fine (mouse) pointer so the cursor mounts.
    window.matchMedia = jest.fn().mockReturnValue({ matches: true }) as unknown as typeof window.matchMedia;
    // rAF: run the loop body exactly once (next tick schedules no further run),
    // so the ring-follow interpolation lines execute without an infinite loop.
    let ran = false;
    jest.spyOn(globalThis, "requestAnimationFrame").mockImplementation((cb: FrameRequestCallback) => {
      if (!ran) {
        ran = true;
        cb(0);
      }
      return 1 as unknown as number;
    });
    jest.spyOn(globalThis, "cancelAnimationFrame").mockImplementation(() => {});
  });
  afterEach(() => jest.restoreAllMocks());

  it("creates ring + dot elements and follows mousemove, then cleans up", () => {
    const { unmount } = render(<V2Cursor />);
    // Two cursor nodes appended to body.
    const nodesBefore = document.body.querySelectorAll("div").length;
    expect(nodesBefore).toBeGreaterThanOrEqual(2);
    // Drive a mousemove over an interactive element to hit the "hot" branch.
    const a = document.createElement("a");
    document.body.appendChild(a);
    const ev = new MouseEvent("mousemove", { clientX: 10, clientY: 20 });
    Object.defineProperty(ev, "target", { value: a });
    document.dispatchEvent(ev);
    // And over a non-interactive target (cold branch).
    const span = document.createElement("span");
    const ev2 = new MouseEvent("mousemove", { clientX: 5, clientY: 5 });
    Object.defineProperty(ev2, "target", { value: span });
    document.dispatchEvent(ev2);
    unmount();
    // Cursor nodes removed on cleanup.
    expect(document.body.querySelectorAll("div").length).toBeLessThan(nodesBefore);
  });

  it("renders nothing under reduced motion", () => {
    mockMotionReduced = true;
    render(<V2Cursor />);
    expect(document.body.querySelectorAll("div").length).toBe(0);
  });

  it("renders nothing on a coarse pointer", () => {
    window.matchMedia = jest.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
    render(<V2Cursor />);
    expect(document.body.querySelectorAll("div").length).toBe(0);
  });
});

describe("V2ScrollProgress (web)", () => {
  it("creates the bar, updates on scroll, and cleans up", () => {
    const { unmount } = render(<V2ScrollProgress />);
    const bar = document.querySelector("[data-testid='v2-scroll-progress']") as HTMLElement;
    expect(bar).toBeTruthy();
    // Simulate a scrollable document and a scroll event.
    Object.defineProperty(document.documentElement, "scrollHeight", { value: 2000, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: 1000, configurable: true });
    Object.defineProperty(window, "scrollY", { value: 500, configurable: true });
    window.dispatchEvent(new Event("scroll"));
    expect(bar.style.transform).toContain("scaleX(");
    unmount();
    expect(document.querySelector("[data-testid='v2-scroll-progress']")).toBeNull();
  });

  it("clamps the ratio when the document is not scrollable", () => {
    Object.defineProperty(document.documentElement, "scrollHeight", { value: 500, configurable: true });
    Object.defineProperty(window, "innerHeight", { value: 1000, configurable: true });
    render(<V2ScrollProgress />);
    window.dispatchEvent(new Event("scroll"));
    const bar = document.querySelector("[data-testid='v2-scroll-progress']") as HTMLElement;
    expect(bar.style.transform).toBe("scaleX(0)");
  });

  it("omits the smooth transition under reduced motion", () => {
    mockMotionReduced = true;
    render(<V2ScrollProgress />);
    const bar = document.querySelector("[data-testid='v2-scroll-progress']") as HTMLElement;
    expect(bar.style.transition).toBe("");
  });
});
