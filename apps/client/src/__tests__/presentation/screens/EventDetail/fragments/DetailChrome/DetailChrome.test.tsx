import { fireEvent, render, screen } from "@testing-library/react-native";
import { Platform, Text } from "react-native";

import { DetailBackground, MiniNav, Header, Steps } from "../../../../../../presentation/screens/EventDetail/fragments/DetailChrome/index";

describe("Event detail chrome fragments", () => {
  const originalPlatform = Platform.OS;

  afterEach(() => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: originalPlatform });
  });

  it("wraps screen content and forwards the test identifier", () => {
    render(<DetailBackground testID="detail-root"><Text>Event detail</Text></DetailBackground>);
    expect(screen.getByTestId("detail-root")).toBeTruthy();
    expect(screen.getByText("Event detail")).toBeTruthy();
  });

  it("handles native back and optional share actions", () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "ios" });
    const onBack = jest.fn();
    const onShare = jest.fn();
    render(<Header onBack={onBack} onShare={onShare} isScrolled />);

    const back = screen.getByRole("button", { name: "Kembali" });
    const share = screen.getByRole("button", { name: "Bagikan" });
    fireEvent(back, "pressIn");
    fireEvent.press(back);
    fireEvent(back, "pressOut");
    fireEvent(share, "pressIn");
    fireEvent.press(share);
    fireEvent(share, "pressOut");
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onShare).toHaveBeenCalledTimes(1);
  });

  it("renders the web wordmark and the back-only MiniNav variant", () => {
    Object.defineProperty(Platform, "OS", { configurable: true, value: "web" });
    const onBack = jest.fn();
    render(<><Header onBack={onBack} /><MiniNav onBack={onBack} /></>);

    expect(screen.getAllByText("Rusuh Tiket")).toHaveLength(2);
    fireEvent.press(screen.getAllByRole("button", { name: "Kembali" })[0]);
    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it("shows all checkout steps and supports the default active step", () => {
    render(<><Steps activeStep={3} /><Steps /></>);

    for (const label of ["Detail", "Antre", "Pilih", "Bayar", "Selesai"]) {
      expect(screen.getAllByText(label, { includeHiddenElements: true }).length).toBeGreaterThan(0);
    }
  });
});
