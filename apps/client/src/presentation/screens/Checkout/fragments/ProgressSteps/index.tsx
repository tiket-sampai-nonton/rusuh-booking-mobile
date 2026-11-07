/**
 * RBT-092 —  Brutalist Mono Progress Steps Bar
 *
 * PROTOTYPE 03-checkout.html .progress-container EXACT COPY:
 * - Fixed top bar with 4 steps: Select, Details, Payment, Confirm
 * - Numbered circles with border, filled when active/completed
 * - Progress line fill animation between steps (width 0.5s cubic-bezier)
 * - Uppercase labels below each step
 */
import { useEffect } from "react";
import { Platform, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { StepCircle } from "./StepCircle";
import { useResponsive } from "@presentation/hooks/useResponsive";
import { componentStyles } from "./style";
import {
  styleForProgressStepsAnimatedView2,
  styleForProgressStepsText3,
} from "./style";

interface ProgressStepsProps {
  /**
   * Current step in the shared five-step event journey.
   */
  readonly currentStep: 1 | 2 | 3 | 4 | 5;
}

const STEPS = [
  { id: 1, label: "Detail" },
  { id: 2, label: "Antre" },
  { id: 3, label: "Pilih" },
  { id: 4, label: "Bayar" },
  { id: 5, label: "Selesai" },
] as const;

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
  const { isMobileWeb } = useResponsive();
  const isCompact = isMobileWeb || Platform.OS !== "web";
  // Calculate progress line fill percentage across the five journey steps.
  const progressPercent = ((currentStep - 1) / (STEPS.length - 1)) * 100;

  // Animated progress width (prototype: transition: width 0.5s cubic-bezier(0.76, 0, 0.24, 1))
  const animatedWidth = useSharedValue(0);

  useEffect(() => {
    animatedWidth.value = withTiming(progressPercent * 0.8, {
      duration: 500,
      easing: Easing.bezier(0.76, 0, 0.24, 1),
    });
  }, [progressPercent, animatedWidth]);

  const animatedLineStyle = useAnimatedStyle(() => ({
    width: `${animatedWidth.value}%`,
  }));

  return (
    <View
      style={[
        componentStyles.elementBackgroundColor0,
        isCompact && componentStyles.mobileWebContainer,
      ]}
    >
      <View
        style={[
          componentStyles.elementMaxWidth1,
          isCompact && componentStyles.mobileWebMaxWidth,
        ]}
      >
        <View style={componentStyles.elementFlexDirection2}>
          {/* Background line */}
          {!isCompact && <View style={componentStyles.elementPosition3} />}
          {/* Progress line fill (animated) */}
          {!isCompact && (
            <Animated.View
              style={[styleForProgressStepsAnimatedView2(), animatedLineStyle]}
            />
          )}

          {/* Steps */}
          {STEPS.map((step) => {
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;

            return (
              <View key={step.id} style={componentStyles.elementAlignItems4}>
                <StepCircle
                  number={step.id}
                  isActive={isActive}
                  isCompleted={isCompleted}
                  compact={isCompact}
                />
                <Text
                  style={[
                    styleForProgressStepsText3(isActive, isCompleted),
                    isCompact && componentStyles.mobileWebLabel,
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}
