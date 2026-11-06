import { Text, View } from "react-native";

import { CheckIcon } from "@presentation/components/ArrowIcon";
import { designColors } from "@presentation/theme";

import { stepCircleStyles } from "./style";

export interface StepCircleProps {
  readonly number: number;
  readonly isActive: boolean;
  readonly isCompleted: boolean;
  readonly compact?: boolean;
}

export function StepCircle({
  number,
  isActive,
  isCompleted,
  compact = false,
}: StepCircleProps) {
  const filled = isActive || isCompleted;
  const numberStyle = filled
    ? stepCircleStyles.filledNumber
    : stepCircleStyles.emptyNumber;
  return (
    <View
      style={[
        stepCircleStyles.circle,
        compact && stepCircleStyles.compactCircle,
        filled ? stepCircleStyles.filledCircle : stepCircleStyles.emptyCircle,
      ]}
    >
      {isCompleted ? (
        <CheckIcon color={designColors.ground} size={compact ? 12 : 16} />
      ) : (
        <Text
          style={[
            stepCircleStyles.number,
            compact && stepCircleStyles.compactNumber,
            numberStyle,
          ]}
        >
          {number}
        </Text>
      )}
    </View>
  );
}
