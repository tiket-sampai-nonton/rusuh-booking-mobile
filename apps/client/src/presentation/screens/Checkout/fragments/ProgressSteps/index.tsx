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
import { Text, View } from "react-native";
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
   * Current step (1-4):
   * 1 = Select (completed by entering checkout)
   * 2 = Details (active on checkout screen)
   * 3 = Payment (active on payment screen)
   * 4 = Confirm (active on success screen)
   */
  readonly currentStep: 1 | 2 | 3 | 4;
}

const STEPS = [
  { id: 1, label: "Pilih" },
  { id: 2, label: "Detail" },
  { id: 3, label: "Bayar" },
  { id: 4, label: "Selesai" },
] as const;

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
  const { isMobileWeb } = useResponsive();
  // Calculate progress line fill percentage (0%, 33%, 66%, 100%)
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
        isMobileWeb && componentStyles.mobileWebContainer,
      ]}
    >
      <View
        style={[
          componentStyles.elementMaxWidth1,
          isMobileWeb && componentStyles.mobileWebMaxWidth,
        ]}
      >
        <View style={componentStyles.elementFlexDirection2}>
          {/* Background line */}
          {!isMobileWeb && <View style={componentStyles.elementPosition3} />}
          {/* Progress line fill (animated) */}
          {!isMobileWeb && (
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
                  compact={isMobileWeb}
                />
                <Text
                  style={[
                    styleForProgressStepsText3(isActive, isCompleted),
                    isMobileWeb && componentStyles.mobileWebLabel,
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
