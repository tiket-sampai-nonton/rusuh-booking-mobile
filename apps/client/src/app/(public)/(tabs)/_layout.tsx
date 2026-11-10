import { Tabs } from "expo-router";

/**
 * Keep Home and Browse mounted after first visit so tab switching reuses their
 * virtualized lists instead of rebuilding every native card and image view.
 * The app renders its own cross-platform bottom navigation inside each tab.
 */
export default function PublicTabsLayout() {
  return (
    <Tabs
      backBehavior="firstRoute"
      screenOptions={{
        headerShown: false,
        freezeOnBlur: true,
        tabBarStyle: { display: "none" },
      }}
    />
  );
}
