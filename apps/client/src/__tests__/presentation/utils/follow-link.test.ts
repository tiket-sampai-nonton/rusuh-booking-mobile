import { Linking } from "react-native";

import { followLink } from "../../../presentation/utils/follow-link";

describe("followLink", () => {
  it("routes internal links through the screen callback", async () => {
    const navigate = jest.fn();
    const openURL = jest.spyOn(Linking, "openURL");

    await followLink("/browse?genre=concert", navigate, jest.fn());

    expect(navigate).toHaveBeenCalledWith("/browse?genre=concert");
    expect(openURL).not.toHaveBeenCalled();
    openURL.mockRestore();
  });

  it("ignores placeholder links", async () => {
    const navigate = jest.fn();
    const openURL = jest.spyOn(Linking, "openURL");

    await followLink("#", navigate, jest.fn());

    expect(navigate).not.toHaveBeenCalled();
    expect(openURL).not.toHaveBeenCalled();
    openURL.mockRestore();
  });

  it("opens external URLs and reports a rejected open request", async () => {
    const navigate = jest.fn();
    const onError = jest.fn();
    const openURL = jest
      .spyOn(Linking, "openURL")
      .mockRejectedValueOnce(new Error("blocked"));

    await followLink("https://example.invalid/help", navigate, onError);

    expect(openURL).toHaveBeenCalledWith("https://example.invalid/help");
    expect(navigate).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
    openURL.mockRestore();
  });
});
