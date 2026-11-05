import { render, screen } from "@testing-library/react-native";

import { EstimatedTime } from "../../../../../../presentation/screens/Waiting/fragments/EstimatedTime";

describe("EstimatedTime", () => {
  it("renders the estimate derived from the server throughput", () => {
    render(<EstimatedTime position={3000} admissionRatePerMin={1000} />);

    expect(screen.getByText("03")).toBeTruthy();
    expect(screen.getByText("00")).toBeTruthy();
    expect(screen.getByText("Menit")).toBeTruthy();
    expect(screen.getByText("Detik")).toBeTruthy();
  });

  it("explains that the estimate is unavailable when the server omits its rate", () => {
    render(<EstimatedTime position={3000} />);

    expect(screen.getByTestId("waiting-eta-unavailable")).toBeTruthy();
    expect(screen.getByText("Estimasi waktu tunggu belum tersedia.")).toBeTruthy();
  });
});
