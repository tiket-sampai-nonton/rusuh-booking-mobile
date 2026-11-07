import { StyleSheet } from "react-native";
import { designColors } from "@presentation/theme";
import { styles } from "@presentation/screens/ExpiredRecovery/fragments/RecoveryActions/style";

describe("expired recovery action styles", () => {
  it("keeps each action visible with a filled primary and bordered secondary", () => {
    expect(StyleSheet.flatten(styles.primaryButton)).toMatchObject({
      backgroundColor: designColors.ink,
      borderWidth: 2,
      borderColor: designColors.ink,
    });
    expect(StyleSheet.flatten(styles.secondaryButton)).toMatchObject({
      backgroundColor: designColors.ground,
      borderWidth: 2,
      borderColor: designColors.ink,
    });
    expect(StyleSheet.flatten(styles.requeueButton)).toMatchObject({
      backgroundColor: designColors.ground,
      borderWidth: 2,
      borderColor: designColors.ink,
    });
  });
});
