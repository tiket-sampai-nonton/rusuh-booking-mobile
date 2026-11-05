import { render, screen } from "@testing-library/react-native";

import { ProgressSteps } from "../../../../../../presentation/screens/Checkout/fragments/ProgressSteps/index";

describe("ProgressSteps", () => {
  it("renders all checkout stages", () => {
    render(<ProgressSteps currentStep={2} />);
    expect(screen.getByText("Pilih")).toBeTruthy();
    expect(screen.getByText("Detail")).toBeTruthy();
    expect(screen.getByText("Bayar")).toBeTruthy();
    expect(screen.getByText("Selesai")).toBeTruthy();
  });

  it("renders the completed final stage", () => {
    render(<ProgressSteps currentStep={4} />);
    expect(screen.getByText("Selesai")).toBeTruthy();
  });
});
