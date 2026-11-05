import { StyleSheet } from "react-native";
import { styles } from "@presentation/screens/ExpiredRecovery/fragments/RecoveryActions/style";

describe("expired recovery action styles", () => {
  it("keeps each action visible with a filled primary and bordered secondary", () => {
    expect(StyleSheet.flatten(styles.primaryButton)).toMatchObject({
      backgroundColor: "#000000",
      borderWidth: 2,
      borderColor: "#000000",
    });
    expect(StyleSheet.flatten(styles.secondaryButton)).toMatchObject({
      backgroundColor: "#ffffff",
      borderWidth: 2,
      borderColor: "#000000",
    });
    expect(StyleSheet.flatten(styles.requeueButton)).toMatchObject({
      backgroundColor: "#ffffff",
      borderWidth: 2,
      borderColor: "#000000",
    });
  });
});
