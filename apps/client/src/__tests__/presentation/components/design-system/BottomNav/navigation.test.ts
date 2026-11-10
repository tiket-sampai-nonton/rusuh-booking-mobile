import { navigateBottomTab } from "../../../../../presentation/components/design-system/BottomNav/navigation";

describe("navigateBottomTab", () => {
  const createRouter = () => ({
    navigate: jest.fn(),
  });

  it("switches tabs through the navigator so the Browse screen stays mounted", () => {
    const router = createRouter();

    navigateBottomTab(router, "home", "browse");

    expect(router.navigate).toHaveBeenCalledWith("/browse");
  });

  it("returns to an existing tab from another route", () => {
    const router = createRouter();

    navigateBottomTab(router, "browse", "home");

    expect(router.navigate).toHaveBeenCalledWith("/");
  });

  it("does nothing when the selected tab is already active", () => {
    const router = createRouter();

    navigateBottomTab(router, "browse", "browse");

    expect(router.navigate).not.toHaveBeenCalled();
  });
});
