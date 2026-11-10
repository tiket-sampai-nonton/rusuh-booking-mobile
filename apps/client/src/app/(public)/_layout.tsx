import { Stack } from "expo-router";

/** Keep public content and its Home/Browse tabs in one public route stack. */
export default function PublicLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
