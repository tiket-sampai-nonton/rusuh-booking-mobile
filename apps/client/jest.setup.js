// React Native Testing Library ships its own Jest matchers (v12.4+).
import "@testing-library/react-native/extend-expect";
import { act } from "@testing-library/react-native";
import { notifyManager } from "@tanstack/react-query";

// Native FastImage view managers are unavailable in Jest. Use RN Image for
// component assertions; device builds cover native caching/rendering.
jest.mock("react-native-fast-image", () => require("react-native").Image);

// TanStack Query flushes observer updates in a scheduled callback. Treat that
// callback as a React update so async query and mutation tests stay inside act.
notifyManager.setNotifyFunction((notify) => act(notify));

// Safe-area insets: screens call useSafeAreaInsets(); provide a zero-inset stub
// so components render under plain `render()` (no SafeAreaProvider) exactly as
// they do inside the app's real SafeAreaProvider. Inline requires only (the
// jest.mock factory may not reference out-of-scope variables).
jest.mock("react-native-safe-area-context", () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  const frame = { x: 0, y: 0, width: 0, height: 0 };
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaConsumer: ({ children }) => children(inset),
    SafeAreaView: ({ children }) => children,
    useSafeAreaInsets: () => inset,
    useSafeAreaFrame: () => frame,
    initialWindowMetrics: { insets: inset, frame },
  };
});

// expo-router/head (react-native-helmet-async) writes to the web DOM <head>
// during static export; in the jsdom/RN test env it is irrelevant and not
// resolvable the same way. Stub it to render nothing so route screens that
// mount <Seo> render under plain render(). The real Head output (title,
// robots, canonical, OG, JSON-LD) is verified against the static export HTML
// in the RBT-033 evidence, not here.
jest.mock("expo-router/head", () => {
  const Head = () => null;
  return { __esModule: true, default: Head };
});

// react-native-webview renders a native view with no jsdom/RN-test backing.
// Stub it as a plain View that forwards testID + source. The page-token
// exchange is covered by PaymentPageBootstrap tests; WebView rendering is
// verified on-device/manually, not in the unit runner.
jest.mock("react-native-webview", () => {
  const ReactMock = require("react");
  const RNMock = require("react-native");
  let currentProps = {};
  const WebViewMock = ReactMock.forwardRef((props, ref) => {
    currentProps = props;
    ReactMock.useEffect(() => {
      // Drive a navigation event when the test asks for one via a magic uri
      // query (?rbtest_nav=<url>), so the onNavigationStateChange branch runs.
      const uri = props.source ? props.source.uri : "";
      const m = /rbtest_nav=([^&]+)/.exec(uri || "");
      if (m && typeof props.onNavigationStateChange === "function") {
        props.onNavigationStateChange({ url: decodeURIComponent(m[1]) });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.onLoadEnd]);
    return ReactMock.createElement(RNMock.View, {
      testID: props.testID,
      accessibilityLabel: props.source ? props.source.uri : undefined,
    });
  });
  return {
    __esModule: true,
    WebView: WebViewMock,
    default: WebViewMock,
    __sendMessage: (data) =>
      currentProps.onMessage?.({ nativeEvent: { data } }),
  };
});

// react-native-qrcode-svg renders an SVG QR via react-native-svg; in the unit
// runner we stub it as a plain View that carries the encoded value as its
// accessibilityLabel + testID, so tests can assert the QR payload (a safe
// ticket ref, never PII) without a real SVG rasterizer. The real QR render is
// verified on-device/manually (RBT-071).
jest.mock("react-native-qrcode-svg", () => {
  const ReactMock = require("react");
  const RNMock = require("react-native");
  function QRCodeMock(props) {
    return ReactMock.createElement(RNMock.View, {
      testID: "qr-code",
      accessibilityLabel: props.value,
    });
  }
  return { __esModule: true, default: QRCodeMock };
});

// expo-notifications touches the native notification SDK; in the unit runner we
// stub the surface the adapter + useNotifications use (RBT-072). Tests that need
// specific behavior override these with jest.spyOn / jest.doMock.
jest.mock("expo-notifications", () => ({
  getPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ granted: true }),
  getExpoPushTokenAsync: jest
    .fn()
    .mockResolvedValue({ data: "ExpoPushToken[xyz]" }),
  scheduleNotificationAsync: jest.fn().mockResolvedValue("notif-id"),
  addNotificationResponseReceivedListener: jest
    .fn()
    .mockReturnValue({ remove: jest.fn() }),
}));

// Connectivity is controlled through the ConnectivityPort in app code. Keep
// the OS SDK deterministic and online by default in unit tests; individual
// tests can inject an offline port to exercise recovery states.
jest.mock("expo-network", () => ({
  getNetworkStateAsync: jest.fn().mockResolvedValue({
    isConnected: null,
    isInternetReachable: null,
  }),
  addNetworkStateListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
}));
