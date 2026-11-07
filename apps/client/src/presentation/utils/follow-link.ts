import { Linking } from "react-native";

/** Route internal links in-app, ignore placeholders, and open external URLs. */
export async function followLink(
  href: string,
  navigate: (href: string) => void,
  onError: () => void,
): Promise<void> {
  if (href.startsWith("/")) {
    navigate(href);
    return;
  }
  if (href === "#") return;

  try {
    await Linking.openURL(href);
  } catch {
    onError();
  }
}
