import type { AvailabilityStatus } from "../types";
import { Platform } from "react-native";
import { designDetailStyles as styles } from "../../../style";

export function getAvailabilityStyle(status: AvailabilityStatus) {
  if (Platform.OS === "web") {
    return status === "sold-out" ? styles.categoryAvailOut : styles.categoryAvail;
  }

  switch (status) {
    case "available":
      return styles.categoryAvail;
    case "limited":
      return styles.categoryAvailLimited;
    case "sold-out":
      return styles.categoryAvailOut;
  }
}
