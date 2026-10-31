// React Native Testing Library ships its own Jest matchers (v12.4+).
import "@testing-library/react-native/extend-expect";

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
