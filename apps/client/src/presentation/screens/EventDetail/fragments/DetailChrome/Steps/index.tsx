import { Text, View } from "react-native";

import { designDetailStyles as styles } from "../../../style";

const FLOW_STEPS = [
  { number: 1, label: "Detail" },
  { number: 2, label: "Antre" },
  { number: 3, label: "Pilih" },
  { number: 4, label: "Bayar" },
  { number: 5, label: "Selesai" },
] as const;

export interface StepsProps {
  readonly activeStep?: number;
  readonly isMobileWeb?: boolean;
}

export function Steps({ activeStep = 1, isMobileWeb = false }: StepsProps) {
  return (
    <View
      style={[
        styles.stepsContainer,
        isMobileWeb && styles.mobileWebStepsContainer,
      ]}
    >
      {FLOW_STEPS.map((step, index) => {
        const isActive = step.number === activeStep;
        const isLast = index === FLOW_STEPS.length - 1;

        return (
          <View key={step.number} style={styles.step}>
            <View
              style={[
                styles.stepNum,
                isActive ? styles.stepNumActive : styles.stepNumInactive,
              ]}
            >
              <Text
                style={[
                  styles.stepNumText,
                  isActive
                    ? styles.stepNumTextActive
                    : styles.stepNumTextInactive,
                ]}
              >
                {step.number}
              </Text>
            </View>
            <Text
              style={[
                styles.stepLabel,
                isActive ? styles.stepLabelActive : styles.stepLabelInactive,
              ]}
            >
              {step.label}
            </Text>
            {!isLast && <View style={styles.stepConnector} />}
          </View>
        );
      })}
    </View>
  );
}
