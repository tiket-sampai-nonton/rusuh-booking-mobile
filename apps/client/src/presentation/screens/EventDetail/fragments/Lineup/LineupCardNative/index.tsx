import { useEffect, useRef, useState } from "react";
import { Animated, Image, Pressable, StyleSheet, Text, View } from "react-native";

import { designDuration } from "@presentation/theme/event-design-tokens";
import { nativeDriverSupported } from "@presentation/utils/style";

import { lineupStyles } from "../style";
import type { LineupItem } from "../types";
import { lineupNativeCardAnimationStyle } from "./style";

interface LineupCardNativeProps extends LineupItem {
  readonly index: number;
}

export function LineupCardNative({ name, role, avatar, index }: LineupCardNativeProps) {
  const [isPressed, setIsPressed] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const avatarUri =
    avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=000&color=fff&bold=true&size=160&format=png`;

  useEffect(() => {
    const delay = 1100 + index * 100;
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        delay,
        useNativeDriver: nativeDriverSupported(),
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: designDuration.normal,
        delay,
        useNativeDriver: nativeDriverSupported(),
      }),
    ]).start();
  }, [scaleAnim, opacityAnim, index]);

  return (
    <Animated.View style={lineupNativeCardAnimationStyle(opacityAnim, scaleAnim)}>
      <Pressable
        style={lineupStyles.cardNative}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
      >
        <View style={lineupStyles.avatarContainer}>
          <Image
            source={{ uri: avatarUri }}
            style={lineupStyles.avatar}
            resizeMode="cover"
            accessibilityIgnoresInvertColors
          />
          {!isPressed && (
            <>
              <View style={[StyleSheet.absoluteFill, lineupStyles.grayscaleDark]} />
              <View style={[StyleSheet.absoluteFill, lineupStyles.grayscaleGray]} />
            </>
          )}
        </View>
        <Text style={lineupStyles.name} numberOfLines={2}>{name}</Text>
        <Text style={lineupStyles.role} numberOfLines={1}>{role}</Text>
      </Pressable>
    </Animated.View>
  );
}
