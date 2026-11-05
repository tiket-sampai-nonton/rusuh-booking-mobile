import { fireEvent, render, screen } from "@testing-library/react-native";
import { Linking } from "react-native";

import { ToastProvider } from "@presentation/components/design-system";
import { FooterLink } from "@presentation/screens/Home/fragments/HomeFooter/FooterLink";

describe("FooterLink navigation", () => {
  it("routes internal destinations through the supplied navigation callback", () => {
    const onNavigate = jest.fn();
    render(
      <ToastProvider>
        <FooterLink label="Jelajahi" href="/browse" onNavigate={onNavigate} />
      </ToastProvider>,
    );

    fireEvent.press(screen.getByRole("link", { name: "Jelajahi" }));
    expect(onNavigate).toHaveBeenCalledWith("/browse");
  });

  it("shows the fallback toast when an external destination cannot open", async () => {
    jest.spyOn(Linking, "openURL").mockRejectedValueOnce(new Error("not available"));
    render(
      <ToastProvider>
        <FooterLink label="Instagram" href="https://example.test" onNavigate={jest.fn()} />
      </ToastProvider>,
    );

    fireEvent.press(screen.getByRole("link", { name: "Instagram" }));
    expect(await screen.findByText("Tautan tidak dapat dibuka")).toBeTruthy();
    jest.restoreAllMocks();
  });
});
