import { Stack } from "expo-router";

// Layout for the (booking) route group. Placeholder guard structure only —
// a real session/hold guard (redirect when no active booking session) lands in
// a later RBT. Routing-only: renders the nested stack with no business logic.
export default function BookingLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
