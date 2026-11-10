import { navigateBottomTab } from "../../../../../presentation/components/design-system/BottomNav/navigation";

describe("navigateBottomTab", () => {
  const createRouter = () => ({
    push: jest.fn(),
    dismissTo: jest.fn(),
  });

  it("pushes the first tab from Home so Home remains the back destination", () => {
    const router = createRouter();

    navigateBottomTab(router, "home", "browse");

    expect(router.push).toHaveBeenCalledWith("/browse");
    expect(router.dismissTo).not.toHaveBeenCalled();
  });

  it("dismisses to an existing tab from another route", () => {
    const router = createRouter();

    navigateBottomTab(router, "browse", "home");

    expect(router.dismissTo).toHaveBeenCalledWith("/");
    expect(router.push).not.toHaveBeenCalled();
  });

  it("does nothing when the selected tab is already active", () => {
    const router = createRouter();

    navigateBottomTab(router, "browse", "browse");

    expect(router.dismissTo).not.toHaveBeenCalled();
    expect(router.push).not.toHaveBeenCalled();
  });
});
