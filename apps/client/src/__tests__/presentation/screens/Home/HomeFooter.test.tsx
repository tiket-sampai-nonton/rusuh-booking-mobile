import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react-native";
import { Linking } from "react-native";

let mockReducedMotion = true;
jest.mock("react-native-reanimated", () => {
  const actual = jest.requireActual("react-native-reanimated/mock");
  return { ...actual, useReducedMotion: () => mockReducedMotion };
});

// eslint-disable-next-line import/first
import { ToastProvider } from "@presentation/components/design-system";
// eslint-disable-next-line import/first
import { HomeFooter } from "@presentation/screens/Home/fragments/HomeFooter";

describe("HomeFooter", () => {
  afterEach(() => {
    mockReducedMotion = true;
    jest.restoreAllMocks();
  });

  it("opens WhatsApp support with the Indonesian help message", async () => {
    const onNavigate = jest.fn();
    const openURL = jest.spyOn(Linking, "openURL").mockResolvedValue(undefined);
    render(
      <ToastProvider>
        <HomeFooter onNavigate={onNavigate} />
      </ToastProvider>,
    );

    fireEvent.press(screen.getByLabelText("Pusat Bantuan"));

    await waitFor(() => expect(openURL).toHaveBeenCalledTimes(1));
    expect(openURL.mock.calls[0]?.[0]).toContain("https://wa.me/628113663068?");
    expect(decodeURIComponent(openURL.mock.calls[0]?.[0] ?? "")).toContain(
      "Halo, saya butuh bantuan terkait Rusuh Booking. Bisa dibantu?",
    );
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("renders the link columns and shows the selected social profile", () => {
    const onNavigate = jest.fn();
    render(
      <ToastProvider>
        <HomeFooter onNavigate={onNavigate} />
      </ToastProvider>,
    );

    expect(screen.getByText("Bantuan")).toBeTruthy();
    expect(screen.queryByText("Perusahaan")).toBeNull();
    expect(
      screen.getByText("© 2025 Rusuh Tiket. Hak cipta dilindungi."),
    ).toBeTruthy();
    const instagram = screen.getByLabelText("Instagram: @rusuhtiket");
    fireEvent(instagram, "hoverIn");
    fireEvent(instagram, "hoverOut");
    fireEvent.press(instagram);
    expect(screen.getByText("Instagram: @rusuhtiket")).toBeTruthy();
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("handles pointer states for the WhatsApp support link", () => {
    const onNavigate = jest.fn();
    render(
      <ToastProvider>
        <HomeFooter onNavigate={onNavigate} />
      </ToastProvider>,
    );
    const link = screen.getByLabelText("Pusat Bantuan");
    fireEvent(link, "hoverIn");
    fireEvent(link, "hoverOut");
    fireEvent.press(link);
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("runs the animated hover states for footer links and social items", () => {
    mockReducedMotion = false;
    const onNavigate = jest.fn();
    render(
      <ToastProvider>
        <HomeFooter onNavigate={onNavigate} />
      </ToastProvider>,
    );
    const eventLink = screen.getByLabelText("Pusat Bantuan");
    const socialLink = screen.getByLabelText("YouTube: Rusuh Tiket Official");

    fireEvent(eventLink, "hoverIn");
    fireEvent(eventLink, "hoverOut");
    fireEvent(socialLink, "hoverIn");
    fireEvent(socialLink, "hoverOut");
    fireEvent.press(socialLink);

    expect(screen.getByText("YouTube: Rusuh Tiket Official")).toBeTruthy();
    expect(onNavigate).not.toHaveBeenCalled();
  });
});
