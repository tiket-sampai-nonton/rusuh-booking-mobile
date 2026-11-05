import { Text, View } from "react-native";

import { CheckIcon } from "@presentation/components/ArrowIcon";
import { designColors } from "@presentation/theme";

import { stepCircleStyles } from "./style";

export interface StepCircleProps {
  readonly number: number;
  readonly isActive: boolean;
  readonly isCompleted: boolean;
}

export function StepCircle({ number, isActive, isCompleted }: StepCircleProps) {
  const filled = isActive || isCompleted;
  const numberStyle = filled ? stepCircleStyles.filledNumber : stepCircleStyles.emptyNumber;
  return (
    <View style={[stepCircleStyles.circle, filled ? stepCircleStyles.filledCircle : stepCircleStyles.emptyCircle]}>
      {isCompleted ? (
        <CheckIcon color={designColors.ground} size={16} />
      ) : (
        <Text style={[stepCircleStyles.number, numberStyle]}>
          {number}
        </Text>
      )}
    </View>
  );
}
