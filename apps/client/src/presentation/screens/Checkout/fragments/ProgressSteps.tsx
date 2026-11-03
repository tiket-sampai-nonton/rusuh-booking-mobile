/**
 * RBT-092 — V2 Brutalist Mono Progress Steps Bar
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

import { v2Colors, v2Borders, interFonts } from "@presentation/theme";

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

function StepCircle({
  number,
  isActive,
  isCompleted,
}: {
  readonly number: number;
  readonly isActive: boolean;
  readonly isCompleted: boolean;
}) {
  const filled = isActive || isCompleted;

  return (
    <View
      style={{
        width: 40,
        height: 40,
        borderWidth: v2Borders.standard,
        borderColor: v2Colors.ink,
        backgroundColor: filled ? v2Colors.ink : v2Colors.ground,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {isCompleted ? (
        <Text
          style={{
            color: v2Colors.ground,
            fontSize: 16,
            fontFamily: interFonts.bold,
          }}
        >
          ✓
        </Text>
      ) : (
        <Text
          style={{
            color: filled ? v2Colors.ground : v2Colors.ink,
            fontSize: 14,
            fontFamily: interFonts.bold,
          }}
        >
          {number}
        </Text>
      )}
    </View>
  );
}

export function ProgressSteps({ currentStep }: ProgressStepsProps) {
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
      style={{
        backgroundColor: v2Colors.ground,
        borderBottomWidth: v2Borders.standard,
        borderBottomColor: v2Colors.ink,
        paddingVertical: 16,
      }}
    >
      <View
        style={{
          maxWidth: 800,
          marginHorizontal: "auto",
          paddingHorizontal: 32,
          width: "100%",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            position: "relative",
          }}
        >
          {/* Background line */}
          <View
            style={{
              position: "absolute",
              top: 20, // Half of step circle height (40/2)
              left: "10%",
              right: "10%",
              height: 2,
              backgroundColor: "#e0e0e0",
              zIndex: 1,
            }}
          />
          {/* Progress line fill (animated) */}
          <Animated.View
            style={[
              {
                position: "absolute",
                top: 20,
                left: "10%",
                height: 2,
                backgroundColor: v2Colors.ink,
                zIndex: 2,
              },
              animatedLineStyle,
            ]}
          />

          {/* Steps */}
          {STEPS.map((step) => {
            const isCompleted = step.id < currentStep;
            const isActive = step.id === currentStep;

            return (
              <View
                key={step.id}
                style={{
                  alignItems: "center",
                  gap: 8,
                  zIndex: 3,
                }}
              >
                <StepCircle
                  number={step.id}
                  isActive={isActive}
                  isCompleted={isCompleted}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontFamily: interFonts.medium,
                    textTransform: "uppercase",
                    letterSpacing: 0.6,
                    color: isActive || isCompleted ? v2Colors.ink : v2Colors.gray,
                  }}
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
