import { Text, View, type StyleProp, type TextStyle } from "react-native";

import { formatCount } from "../../display";
import { styles } from "../../style";

interface QueuePositionPanelProps {
  readonly position: number;
  readonly statusLabel: string;
  readonly isDesktop: boolean;
}

export function QueuePositionPanel({
  position,
  statusLabel,
  isDesktop,
}: QueuePositionPanelProps) {
  const numberLength = formatCount(position).length;
  let numberStyle: StyleProp<TextStyle> = styles.positionNumberMobile;
  if (isDesktop) {
    numberStyle =
      numberLength > 5
        ? styles.positionNumberDesktopLong
        : styles.positionNumberDesktop;
  } else if (numberLength > 5) {
    numberStyle = styles.positionNumberMobileLong;
  }

  return (
    <View
      style={[
        styles.positionPanelFrame,
        isDesktop && styles.positionPanelFrameDesktop,
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.positionPanelShadow,
          isDesktop && styles.positionPanelShadowDesktop,
        ]}
      />
      <View
        style={[styles.positionPanel, isDesktop && styles.positionPanelDesktop]}
      >
        <View style={styles.positionHead}>
          <Text
            style={[
              styles.positionHeadLabel,
              isDesktop && styles.positionHeadLabelDesktop,
            ]}
          >
            Posisimu
          </Text>
          <Text
            style={[
              styles.positionHeadLabel,
              isDesktop && styles.positionHeadLabelDesktop,
            ]}
          >
            {statusLabel}
          </Text>
        </View>
        <Text
          style={numberStyle}
          testID="waiting-position"
          accessibilityLiveRegion="polite"
          accessibilityLabel={`Posisi antrean ${formatCount(position)}`}
        >
          {formatCount(position)}
        </Text>
        <View style={styles.numberRule} />
        <View style={styles.positionFoot}>
          <Text
            style={[
              styles.positionFootText,
              isDesktop && styles.positionFootTextDesktop,
            ]}
          >
            Nomor antrean
          </Text>
          <Text
            style={[
              styles.positionFootText,
              isDesktop && styles.positionFootTextDesktop,
            ]}
          >
            Urutan masuk
          </Text>
        </View>
      </View>
    </View>
  );
}
