import { Text, View } from "react-native";

import { designDetailStyles as styles } from "../../../style";
import type { AvailabilityStatus } from "../types";
import { getAvailabilityStyle } from './style';

export interface CategoryRowProps {
  readonly name: string;
  readonly description?: string;
  readonly price: string;
  readonly availability: string;
  readonly status: AvailabilityStatus;
}

export function CategoryRow({ name, description, price, availability, status }: CategoryRowProps) {
  const isSoldOut = status === "sold-out";
  const availabilityStyle = getAvailabilityStyle(status);

  return (
    <View style={[styles.categoryFrame, isSoldOut && styles.categorySoldOut]}>
      <View style={styles.categoryItem}>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>{name}</Text>
          {description && <Text style={styles.categoryDesc}>{description}</Text>}
        </View>
        <View style={styles.categoryPrice}>
          <Text style={styles.categoryPriceValue}>{price}</Text>
          <Text style={availabilityStyle}>{availability}</Text>
        </View>
      </View>
    </View>
  );
}
