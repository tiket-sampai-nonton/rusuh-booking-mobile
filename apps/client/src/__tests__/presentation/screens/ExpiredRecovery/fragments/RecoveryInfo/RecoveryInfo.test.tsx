import { render, screen } from "@testing-library/react-native";

import { RecoveryInfo } from "../../../../../../presentation/screens/ExpiredRecovery/fragments/RecoveryInfo/index";

describe("RecoveryInfo", () => {
  it("shows the explanation and each recovery detail", () => {
    render(<RecoveryInfo text="Sesi berakhir." items={["Tiket dilepas", "Masuk antrean lagi"]} />);

    expect(screen.getByText("Apa yang terjadi?")).toBeTruthy();
    expect(screen.getByText("Sesi berakhir.")).toBeTruthy();
    expect(screen.getByText("Tiket dilepas")).toBeTruthy();
    expect(screen.getByText("Masuk antrean lagi")).toBeTruthy();
  });

  it("supports an empty detail list", () => {
    render(<RecoveryInfo text="Sesi berakhir." items={[]} />);

    expect(screen.getByText("Sesi berakhir.")).toBeTruthy();
    expect(screen.queryByText("Tiket dilepas")).toBeNull();
  });
});
