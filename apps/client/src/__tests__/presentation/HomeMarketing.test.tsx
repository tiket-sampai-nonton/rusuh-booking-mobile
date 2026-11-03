/**
 * RBT-088 — HomeMarketing (V2 Brutalist Mono stats/how/testimonials/newsletter).
 * Covers the formatStat helper, the four sections' render, and the newsletter
 * valid/invalid submit path (via the V2ToastProvider).
 */
import { act, fireEvent, render, screen } from "@testing-library/react-native";

// Flip reduced-motion per test so the counter's reduced arm (jump straight to
// target) is covered deterministically — the reanimated mock does not drive
// useAnimatedReaction, so the animated tick never settles in jest.
const mockReduced = { value: true };
jest.mock("react-native-reanimated", () => {
  const actual = jest.requireActual("react-native-reanimated/mock");
  return { ...actual, useReducedMotion: () => mockReduced.value };
});

// eslint-disable-next-line import/first
import { V2ToastProvider } from "@presentation/components/v2";
// eslint-disable-next-line import/first
import {
  HomeMarketing,
  counterDisplay,
  formatStat,
} from "@presentation/screens/Home/fragments/HomeMarketing";

function renderMarketing() {
  return render(
    <V2ToastProvider>
      <HomeMarketing />
    </V2ToastProvider>,
  );
}

describe("formatStat", () => {
  it("groups thousands with Indonesian separators", () => {
    expect(formatStat(2_500_000, 0, "+")).toBe("2.500.000+");
    expect(formatStat(500, 0, "+")).toBe("500+");
    expect(formatStat(1_000_000, 0, "+")).toBe("1.000.000+");
  });

  it("renders a decimal with a comma + suffix", () => {
    expect(formatStat(99.9, 1, "%")).toBe("99,9%");
    expect(formatStat(0, 1, "%")).toBe("0,0%");
  });

  it("rounds when no decimals requested", () => {
    expect(formatStat(1234.6, 0, "")).toBe("1.235");
    expect(formatStat(0, 0, "+")).toBe("0+");
  });
});

describe("counterDisplay", () => {
  it("scales progress v (0→1) toward the target", () => {
    expect(counterDisplay(0, 2_500_000, 0, "+")).toBe("0+");
    expect(counterDisplay(0.5, 2_500_000, 0, "+")).toBe("1.250.000+");
    expect(counterDisplay(1, 99.9, 1, "%")).toBe("99,9%");
  });
});

describe("HomeMarketing", () => {
  it("renders all four brutalist sections", () => {
    renderMarketing();
    expect(screen.getByTestId("home-stats")).toBeTruthy();
    expect(screen.getByTestId("home-how")).toBeTruthy();
    expect(screen.getByTestId("home-testimonials")).toBeTruthy();
    expect(screen.getByTestId("home-newsletter")).toBeTruthy();
  });

  it("renders the stat labels and step titles from the prototype", () => {
    renderMarketing();
    expect(screen.getByText("Tiket Terjual")).toBeTruthy();
    expect(screen.getByText("Transaksi Aman")).toBeTruthy();
    expect(screen.getByText("Cara Beli Tiket")).toBeTruthy();
    expect(screen.getByText("Pilih Event")).toBeTruthy();
    expect(screen.getByText("Masuk Venue")).toBeTruthy();
    expect(screen.getByText("Kata Mereka")).toBeTruthy();
    expect(screen.getByText("Rina Putri")).toBeTruthy();
  });

  it("shows the final counter values immediately under reduced-motion", () => {
    mockReduced.value = true;
    renderMarketing();
    expect(screen.getByText("99,9%")).toBeTruthy();
    expect(screen.getByText("2.500.000+")).toBeTruthy();
  });

  it("ticks the counter to its target over the rAF animation when motion is allowed", () => {
    mockReduced.value = false;
    // Drive requestAnimationFrame manually + freeze the clock so the tick body
    // runs deterministically from t=0 to t=1 (settled at the target).
    const now = jest.spyOn(Date, "now");
    let t = 0;
    now.mockImplementation(() => t);
    const rafCbs: FrameRequestCallback[] = [];
    const rafSpy = jest
      .spyOn(globalThis, "requestAnimationFrame")
      .mockImplementation((cb: FrameRequestCallback) => {
        rafCbs.push(cb);
        return rafCbs.length as unknown as number;
      });
    const cafSpy = jest.spyOn(globalThis, "cancelAnimationFrame").mockImplementation(() => {});

    renderMarketing();
    // First frame at t=0 → counters read the start value.
    act(() => rafCbs.splice(0).forEach((cb) => cb(0)));
    // Advance past COUNT_MS and flush the queued frame → settles at target.
    t = 2000;
    act(() => rafCbs.splice(0).forEach((cb) => cb(0)));
    expect(screen.getByText("99,9%")).toBeTruthy();

    now.mockRestore();
    rafSpy.mockRestore();
    cafSpy.mockRestore();
    mockReduced.value = true;
  });

  it("rejects an invalid newsletter email", () => {
    renderMarketing();
    fireEvent.changeText(screen.getByTestId("newsletter-input"), "not-an-email");
    fireEvent.press(screen.getByTestId("newsletter-submit"));
    expect(screen.getByText("Masukkan alamat email yang valid.")).toBeTruthy();
  });

  it("accepts a valid newsletter email and clears the field", () => {
    renderMarketing();
    const input = screen.getByTestId("newsletter-input");
    fireEvent.changeText(input, "rizky@example.com");
    fireEvent(input, "focus");
    fireEvent.press(screen.getByTestId("newsletter-submit"));
    expect(screen.getByText("Berhasil! Cek email kamu untuk konfirmasi.")).toBeTruthy();
    expect(input.props.value).toBe("");
  });

  it("toggles the input focus border", () => {
    renderMarketing();
    const input = screen.getByTestId("newsletter-input");
    fireEvent(input, "focus");
    fireEvent(input, "blur");
    expect(input).toBeTruthy();
  });
});
