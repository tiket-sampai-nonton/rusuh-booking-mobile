import { useEffect, useRef } from "react";
import { Animated, View } from "react-native";

import { nativeDriverSupported } from "@presentation/utils/style";

import { designDetailStyles as styles } from "../../../style";
import { detailLoadingProgressStyle } from "./style";

export function DetailLoading() {
  const progressAnim = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 0,
      duration: 1500,
      useNativeDriver: nativeDriverSupported(),
    }).start();
  }, [progressAnim]);

  return (
    <View style={styles.loader} testID="detail-loading">
      <View style={styles.loaderBar}>
        <Animated.View style={[styles.loaderProgress, detailLoadingProgressStyle(progressAnim)]} />
      </View>
    </View>
  );
}
