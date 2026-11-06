import { WebFileShareAdapter } from "../../../infrastructure/files/web-file-share.adapter";

describe("WebFileShareAdapter", () => {
  const adapter = new WebFileShareAdapter();
  const file = {
    fileName: "ticket.pdf",
    mimeType: "application/pdf",
    base64: "cGRm",
  };
  const originalDocument = Object.getOwnPropertyDescriptor(
    globalThis,
    "document",
  );
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const originalNavigator = Object.getOwnPropertyDescriptor(
    globalThis,
    "navigator",
  );
  const originalCreateObjectURL = Object.getOwnPropertyDescriptor(
    URL,
    "createObjectURL",
  );
  const originalRevokeObjectURL = Object.getOwnPropertyDescriptor(
    URL,
    "revokeObjectURL",
  );

  afterEach(() => {
    jest.restoreAllMocks();
    for (const [target, key, descriptor] of [
      [globalThis, "document", originalDocument],
      [globalThis, "window", originalWindow],
      [globalThis, "navigator", originalNavigator],
      [URL, "createObjectURL", originalCreateObjectURL],
      [URL, "revokeObjectURL", originalRevokeObjectURL],
    ] as const) {
      if (descriptor) Object.defineProperty(target, key, descriptor);
      else Reflect.deleteProperty(target, key);
    }
  });

  function installBrowserStubs() {
    const anchor = {
      href: "",
      download: "",
      style: {},
      click: jest.fn(),
      remove: jest.fn(),
    };
    const createElement = jest.fn(() => anchor);
    const appendChild = jest.fn();
    const setTimeout = jest.fn();
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: { createElement, body: { appendChild } },
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { setTimeout },
    });
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: jest.fn(() => "blob:ticket"),
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      configurable: true,
      value: jest.fn(),
    });
    return { anchor, createElement, appendChild, setTimeout };
  }

  it("downloads a file through a temporary object URL", async () => {
    const browser = installBrowserStubs();
    await adapter.save(file);

    expect(browser.createElement).toHaveBeenCalledWith("a");
    expect(browser.anchor.href).toBe("blob:ticket");
    expect(browser.anchor.download).toBe("ticket.pdf");
    expect(browser.appendChild).toHaveBeenCalledWith(browser.anchor);
    expect(browser.anchor.click).toHaveBeenCalledTimes(1);
    expect(browser.anchor.remove).toHaveBeenCalledTimes(1);
    expect(browser.setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);
    browser.setTimeout.mock.calls[0]?.[0]();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:ticket");
  });

  it("uses the native web-share API for supported browsers", async () => {
    installBrowserStubs();
    const share = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: { share },
    });

    await adapter.share(file);
    expect(share).toHaveBeenCalledWith({
      files: [
        expect.objectContaining({
          name: "ticket.pdf",
          type: "application/pdf",
        }),
      ],
    });
  });

  it("falls back to a download when web sharing is unavailable", async () => {
    const browser = installBrowserStubs();
    Object.defineProperty(globalThis, "navigator", {
      configurable: true,
      value: {},
    });
    await adapter.share(file);
    expect(browser.anchor.click).toHaveBeenCalledTimes(1);
  });
});
