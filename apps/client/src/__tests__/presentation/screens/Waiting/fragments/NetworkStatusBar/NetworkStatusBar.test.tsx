import { render, screen } from "@testing-library/react-native";

import { NetworkStatusBar } from "../../../../../../presentation/screens/Waiting/fragments/NetworkStatusBar/index";

describe("NetworkStatusBar", () => {
  it("stays hidden while connected", () => {
    render(<NetworkStatusBar isOffline={false} isReconnected={false} />);
    expect(screen.queryByTestId("waiting-network-status")).toBeNull();
  });

  it("shows the recoverable offline message", () => {
    render(<NetworkStatusBar isOffline isReconnected={false} />);
    expect(screen.getByText("Koneksi terputus. Posisi antrean Anda tetap tersimpan…")).toBeTruthy();
  });

  it("prioritizes the reconnected message when both flags are set", () => {
    render(<NetworkStatusBar isOffline isReconnected />);
    expect(screen.getByText("Koneksi tersambung kembali. Memperbarui antrean…")).toBeTruthy();
  });
});
