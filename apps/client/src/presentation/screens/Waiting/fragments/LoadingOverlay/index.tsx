import { ActivityIndicator, View } from 'react-native';

import { palette, styles } from '../../style';

export function LoadingOverlay() {
  return (
    <View style={styles.loadingOverlay} testID="waiting-loading-overlay">
      <ActivityIndicator size="large" color={palette.ink} />
    </View>
  );
}
