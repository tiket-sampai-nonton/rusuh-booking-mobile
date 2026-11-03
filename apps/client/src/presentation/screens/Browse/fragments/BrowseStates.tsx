/**
 * RBT-089 — V2 Brutalist Mono Browse States
 *
 * PROTOTYPE 05-browse.html EXACT COPY:
 * - Loading: V2Loader with "BROWSE" label
 * - Empty: dashed 2px border, no rounded corners
 * - Pure black/white, Inter font
 */
import { Text, View } from 'react-native';

import { V2Loader } from '@presentation/components/v2';
import { v2Colors, interFonts } from '@presentation/theme';

import { browseEmpty } from '../style';

export function BrowseLoading() {
  return <V2Loader visible label="BROWSE" testID="browse-loading" />;
}

export function BrowseEmpty() {
  return (
    <View style={browseEmpty} testID="browse-empty">
      <Text
        style={{
          color: v2Colors.ink,
          fontSize: 18,
          fontFamily: interFonts.black,
          textTransform: 'uppercase',
          letterSpacing: -0.36,
          textAlign: 'center',
          marginBottom: 8,
        }}
      >
        Tidak Ada Event
      </Text>
      <Text
        style={{
          color: v2Colors.inkMuted,
          fontSize: 14,
          fontFamily: interFonts.regular,
          textAlign: 'center',
          maxWidth: 320,
        }}
      >
        Tidak ada event yang cocok dengan filter ini. Coba ubah filter atau kembali ke beranda.
      </Text>
    </View>
  );
}
